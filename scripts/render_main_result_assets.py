#!/usr/bin/env python3
"""Render web-ready CANIS main-result assets from saved registration artifacts.

For each case this script writes:
  - image_anchors.png: selected 2D render with projected source anchors.
  - registration_anchors.png: final source/proxy registration with paired anchors.
  - metadata.json: source paths, metrics, and web-relative output paths.

The renderer is artifact-only. It does not run TRELLIS, FCGF, or registration.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import zlib
from pathlib import Path
from typing import Any

import numpy as np


PROJECT_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = PROJECT_DIR.parent.parent
RESULTS_SCRIPTS = REPO_ROOT / "scripts" / "results"
DEFAULT_RESULTS_ROOT = Path(
    "/data/kendong/Diffusions/actionmesh_fast4d/outputs/"
    "paper_anchor_registration_cases_all"
)
DEFAULT_OUTPUT_DIR = PROJECT_DIR / "assets" / "main-results"

os.environ.setdefault(
    "MPLCONFIGDIR",
    str(Path(tempfile.gettempdir()) / "canis-main-results-matplotlib"),
)
sys.path.insert(0, str(REPO_ROOT))
sys.path.insert(0, str(RESULTS_SCRIPTS))

from visualize_anchor_registration_tpami import (  # noqa: E402
    ANCHOR_COLORS,
    PALETTES,
    choose_anchor_indices,
    common_limits,
    configure_3d_axis,
    deterministic_sample,
    draw_clouds,
    read_point_cloud,
    rotate_for_display,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render 2D-anchor and registration-anchor images for the project page."
    )
    parser.add_argument("--results-root", type=Path, default=DEFAULT_RESULTS_ROOT)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument(
        "--uids",
        nargs="*",
        default=None,
        help="Exact case UIDs. Without this option, every selected=true case is rendered.",
    )
    parser.add_argument("--limit", type=int, default=0, help="Render at most N cases; 0 means all.")
    parser.add_argument("--max-anchor-pairs", type=int, default=8)
    parser.add_argument("--dense-max-points", type=int, default=18000)
    parser.add_argument("--palette", choices=tuple(PALETTES), default="teal-coral")
    parser.add_argument("--elev", type=float, default=20.0)
    parser.add_argument("--azim", type=float, default=-135.0)
    parser.add_argument("--image-size", type=int, default=900)
    parser.add_argument("--registration-width", type=int, default=1400)
    parser.add_argument("--dpi", type=int, default=180)
    parser.add_argument("--seed", type=int, default=17)
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def select_case_dirs(args: argparse.Namespace) -> list[Path]:
    candidates = args.results_root.expanduser().resolve() / "candidates"
    if not candidates.is_dir():
        raise NotADirectoryError(candidates)

    if args.uids:
        case_dirs = [candidates / str(uid) for uid in args.uids]
        missing = [path for path in case_dirs if not path.is_dir()]
        if missing:
            raise FileNotFoundError(f"Case directories not found: {missing[:5]}")
    else:
        case_dirs = []
        for path in sorted(candidates.iterdir()):
            metrics_path = path / "case_metrics.json"
            if not path.is_dir() or not metrics_path.is_file():
                continue
            metrics = load_json(metrics_path)
            if metrics.get("status") == "ok" and metrics.get("selected") is True:
                case_dirs.append(path)

    if args.limit > 0:
        case_dirs = case_dirs[: args.limit]
    if not case_dirs:
        raise ValueError("No cases selected for rendering")
    return [path.resolve() for path in case_dirs]


def foreground_bbox(image: Any) -> tuple[float, float, float, float]:
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    corner = max(4, min(rgb.shape[:2]) // 32)
    samples = np.concatenate(
        (
            rgb[:corner, :corner].reshape(-1, 3),
            rgb[:corner, -corner:].reshape(-1, 3),
            rgb[-corner:, :corner].reshape(-1, 3),
            rgb[-corner:, -corner:].reshape(-1, 3),
        ),
        axis=0,
    )
    background = np.median(samples, axis=0)
    mask = np.abs(rgb - background).sum(axis=-1) > 36
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return (0.0, 0.0, float(image.width - 1), float(image.height - 1))
    return (float(xs.min()), float(ys.min()), float(xs.max()), float(ys.max()))


def project_source_anchors(
    *,
    source_points: np.ndarray,
    source_anchors: np.ndarray,
    image: Any,
    view_id: int,
    num_views: int,
) -> np.ndarray:
    """Rebuild the deterministic pipeline camera and project source anchors."""
    import torch

    from src.tools.render_tools import Render

    device = torch.device("cpu")
    points_tensor = torch.as_tensor(source_points, dtype=torch.float32, device=device)
    anchors_tensor = torch.as_tensor(source_anchors, dtype=torch.float32, device=device)
    renderer = Render(size=int(image.width), device=device)
    renderer.set_camera(points_tensor[None, ...], normalize=True, n_views=int(num_views))
    camera = renderer.get_camera(int(view_id))
    image_size = ((int(image.height), int(image.width)),)
    projected_points = camera.transform_points_screen(
        points_tensor[None, ...], image_size=image_size
    )[0, :, :2].detach().cpu().numpy()
    projected_anchors = camera.transform_points_screen(
        anchors_tensor[None, ...], image_size=image_size
    )[0, :, :2].detach().cpu().numpy()

    # Mesh-rendered inputs can set a slightly different camera center than the
    # saved point cloud. Align projection and image foreground bounding boxes.
    finite = np.isfinite(projected_points).all(axis=1)
    points_2d = projected_points[finite]
    low = np.quantile(points_2d, 0.002, axis=0)
    high = np.quantile(points_2d, 0.998, axis=0)
    x0, y0, x1, y1 = foreground_bbox(image)
    target_low = np.array([x0, y0], dtype=np.float64)
    target_high = np.array([x1, y1], dtype=np.float64)
    source_span = np.maximum(high - low, 1e-6)
    target_span = np.maximum(target_high - target_low, 1e-6)
    scale = target_span / source_span
    return (projected_anchors - low) * scale + target_low


def render_image_anchors(
    *,
    case_dir: Path,
    output_path: Path,
    anchor_indices: np.ndarray,
    image_size: int,
) -> dict[str, Any]:
    from PIL import Image, ImageDraw

    input_path = case_dir / "render_select.png"
    source_path = case_dir / "render_pcd_norm.ply"
    matches_path = case_dir / "matches.npz"
    view_path = case_dir / "view_selection.json"
    for path in (input_path, source_path, matches_path, view_path):
        if not path.is_file():
            raise FileNotFoundError(path)

    image = Image.open(input_path).convert("RGB")
    source_points = read_point_cloud(source_path)
    matches = np.load(matches_path, allow_pickle=False)
    source_anchors = np.asarray(matches["render_xyz"], dtype=np.float64)[anchor_indices]
    view = load_json(view_path)
    view_id = int(view.get("topk_ids", [0])[0])
    details = view.get("view_score_details", [])
    num_views = max(len(details), view_id + 1)
    anchor_uv = project_source_anchors(
        source_points=source_points,
        source_anchors=source_anchors,
        image=image,
        view_id=view_id,
        num_views=num_views,
    )

    scale_x = float(image_size) / float(image.width)
    scale_y = float(image_size) / float(image.height)
    image = image.resize((int(image_size), int(image_size)), Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(image, "RGBA")
    outer_radius = max(10, int(round(image_size * 0.018)))
    color_radius = max(7, int(round(image_size * 0.013)))
    core_radius = max(2, int(round(image_size * 0.004)))

    for index, uv in enumerate(anchor_uv):
        x = float(uv[0]) * scale_x
        y = float(uv[1]) * scale_y
        color = ANCHOR_COLORS[index % len(ANCHOR_COLORS)]
        draw.ellipse(
            (x - outer_radius, y - outer_radius, x + outer_radius, y + outer_radius),
            fill=(255, 255, 255, 235),
        )
        draw.ellipse(
            (x - color_radius, y - color_radius, x + color_radius, y + color_radius),
            fill=color,
        )
        draw.ellipse(
            (x - core_radius, y - core_radius, x + core_radius, y + core_radius),
            fill=(255, 255, 255, 255),
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, optimize=True)
    return {
        "source": str(input_path),
        "selected_view_id": view_id,
        "anchor_uv": np.round(anchor_uv, 3).tolist(),
    }


def draw_anchor_pairs(
    axis: Any,
    source_anchors: np.ndarray,
    target_anchors: np.ndarray,
) -> None:
    for index, (source_anchor, target_anchor) in enumerate(
        zip(source_anchors, target_anchors)
    ):
        color = ANCHOR_COLORS[index % len(ANCHOR_COLORS)]
        axis.plot(
            [source_anchor[0], target_anchor[0]],
            [source_anchor[1], target_anchor[1]],
            [source_anchor[2], target_anchor[2]],
            color=color,
            linewidth=1.35,
            alpha=0.92,
            zorder=7,
        )
        axis.scatter(
            *source_anchor,
            s=65,
            marker="o",
            facecolors="white",
            edgecolors=color,
            linewidths=1.8,
            depthshade=False,
            zorder=8,
        )
        axis.scatter(
            *target_anchor,
            s=72,
            marker="X",
            c=color,
            edgecolors="#252525",
            linewidths=0.55,
            depthshade=False,
            zorder=9,
        )


def render_registration_anchors(
    *,
    case_dir: Path,
    output_path: Path,
    anchor_indices: np.ndarray,
    palette_name: str,
    dense_max_points: int,
    width: int,
    dpi: int,
    elev: float,
    azim: float,
    seed: int,
) -> dict[str, Any]:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.lines import Line2D

    source = rotate_for_display(read_point_cloud(case_dir / "with_anchor_aligned_source.ply"))
    target = rotate_for_display(read_point_cloud(case_dir / "registration_target_scaled.ply"))
    anchors = np.load(case_dir / "anchor_pairs_aligned.npz", allow_pickle=False)
    source_anchors = rotate_for_display(
        np.asarray(anchors["src_anchor_aligned_xyz"], dtype=np.float64)[anchor_indices]
    )
    target_anchors = rotate_for_display(
        np.asarray(anchors["tgt_anchor_xyz"], dtype=np.float64)[anchor_indices]
    )
    source_sample = deterministic_sample(source, int(dense_max_points), int(seed))
    center, half_span = common_limits((source_sample, target))
    palette = PALETTES[palette_name]
    target_size = float(np.clip(0.58 + 260.0 / len(target), 0.62, 1.15))

    height = int(round(width * 0.76))
    figure = plt.figure(figsize=(width / dpi, height / dpi), dpi=dpi, facecolor="white")
    axis = figure.add_subplot(111, projection="3d", computed_zorder=False)
    configure_3d_axis(axis, center, half_span, float(elev), float(azim))
    axis.set_box_aspect((1.0, 1.0, 1.0), zoom=1.34)
    draw_clouds(
        axis,
        source=source_sample,
        trellis=target,
        source_size=0.46,
        source_alpha=0.66,
        trellis_size=target_size,
        trellis_alpha=0.84,
        source_color=palette["source"],
        trellis_color=palette["trellis"],
        trellis_edge_color=palette["trellis_edge"],
    )
    draw_anchor_pairs(axis, source_anchors, target_anchors)

    legend = [
        Line2D([0], [0], marker="o", linestyle="", markersize=5, markerfacecolor=palette["source"], markeredgecolor="none", label="Input"),
        Line2D([0], [0], marker="o", linestyle="", markersize=5.5, markerfacecolor=palette["trellis"], markeredgecolor=palette["trellis_edge"], label="Canonical proxy"),
        Line2D([0], [0], marker="o", linestyle="", markersize=6, markerfacecolor="white", markeredgecolor=ANCHOR_COLORS[0], label="Source anchor"),
        Line2D([0], [0], marker="X", linestyle="", markersize=6, markerfacecolor=ANCHOR_COLORS[0], markeredgecolor="#252525", label="Proxy anchor"),
    ]
    figure.legend(
        handles=legend,
        loc="lower center",
        ncol=4,
        frameon=False,
        fontsize=8.5,
        handletextpad=0.45,
        columnspacing=1.4,
        bbox_to_anchor=(0.5, 0.025),
    )
    figure.subplots_adjust(left=0.01, right=0.99, top=0.995, bottom=0.10)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    figure.savefig(output_path, dpi=dpi, facecolor="white", pad_inches=0.0)
    plt.close(figure)
    return {
        "source_points_shown": int(len(source_sample)),
        "target_points_shown": int(len(target)),
        "camera": {"elev": float(elev), "azim": float(azim)},
        "palette": palette_name,
    }


def render_case(case_dir: Path, args: argparse.Namespace) -> dict[str, Any]:
    uid = case_dir.name
    destination = args.out_dir.expanduser().resolve() / uid
    image_path = destination / "image_anchors.png"
    registration_path = destination / "registration_anchors.png"
    metadata_path = destination / "metadata.json"

    anchors = np.load(case_dir / "anchor_pairs_aligned.npz", allow_pickle=False)
    anchor_count = len(anchors["src_anchor_aligned_xyz"])
    anchor_indices = choose_anchor_indices(anchor_count, int(args.max_anchor_pairs))

    if args.overwrite or not image_path.is_file():
        image_metadata = render_image_anchors(
            case_dir=case_dir,
            output_path=image_path,
            anchor_indices=anchor_indices,
            image_size=int(args.image_size),
        )
    else:
        image_metadata = {"skipped_existing": True}

    if args.overwrite or not registration_path.is_file():
        registration_metadata = render_registration_anchors(
            case_dir=case_dir,
            output_path=registration_path,
            anchor_indices=anchor_indices,
            palette_name=args.palette,
            dense_max_points=int(args.dense_max_points),
            width=int(args.registration_width),
            dpi=int(args.dpi),
            elev=float(args.elev),
            azim=float(args.azim),
            seed=int(args.seed) + zlib.crc32(uid.encode("utf-8")) % 100000,
        )
    else:
        registration_metadata = {"skipped_existing": True}

    metrics = load_json(case_dir / "case_metrics.json")
    web_root = Path("assets") / "main-results" / uid
    metadata = {
        "uid": uid,
        "case_dir": str(case_dir),
        "anchors_shown": int(len(anchor_indices)),
        "anchor_indices": anchor_indices.tolist(),
        "with_anchor_re": metrics.get("with_anchors", {}).get("result_Re"),
        "outputs": {
            "image2d": str(web_root / image_path.name),
            "registrationBefore": "",
            "registrationAfter": str(web_root / registration_path.name),
            "glb": "",
        },
        "image_render": image_metadata,
        "registration_render": registration_metadata,
    }
    destination.mkdir(parents=True, exist_ok=True)
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


def main() -> None:
    args = parse_args()
    if args.limit < 0 or args.max_anchor_pairs < 1 or args.dense_max_points < 1:
        raise ValueError("--limit must be non-negative; point and anchor counts must be positive")
    case_dirs = select_case_dirs(args)
    args.out_dir = args.out_dir.expanduser().resolve()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    rendered: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    for index, case_dir in enumerate(case_dirs, start=1):
        print(f"[{index:02d}/{len(case_dirs):02d}] {case_dir.name}", flush=True)
        try:
            rendered.append(render_case(case_dir, args))
        except Exception as exc:
            failures.append({"uid": case_dir.name, "error": repr(exc)})
            print(f"  failed: {exc}", file=sys.stderr, flush=True)

    manifest = {
        "results_root": str(args.results_root.expanduser().resolve()),
        "output_dir": str(args.out_dir),
        "rendered": rendered,
        "failures": failures,
    }
    manifest_path = args.out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    snippets = [
        {
            "title": item["uid"][:8],
            "image2d": item["outputs"]["image2d"],
            "registrationBefore": item["outputs"]["registrationBefore"],
            "registrationAfter": item["outputs"]["registrationAfter"],
            "glb": "",
        }
        for item in rendered
    ]
    snippet_path = args.out_dir / "main_results_config.json"
    snippet_path.write_text(json.dumps(snippets, indent=2), encoding="utf-8")

    print(f"Rendered: {len(rendered)}", flush=True)
    print(f"Failed:   {len(failures)}", flush=True)
    print(f"Manifest: {manifest_path}", flush=True)
    print(f"Config:   {snippet_path}", flush=True)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
