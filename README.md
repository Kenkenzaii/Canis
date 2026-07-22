# CANIS project page

Static project page for **CANIS: Canonicalize Your 3D Models**. The site has no build step,
external JavaScript dependency, or fixed deployment prefix.

## Preview locally

Run from this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Published assets

Only files used by the current page are kept:

- `assets/images/`: teaser and pipeline figures.
- `assets/main-results/`: 11 Main Results cases, each with three PNGs and one GLB.
- `assets/correspondences/`: 15 correspondence cases, each with one PNG and three GLBs.
- `assets/gifs/real/`: selected real-data Input/Output GIFs.
- `assets/gifs/partial/`: selected partial-data Input/Output GIFs.
- `vendor/three/`: local Three.js runtime and loaders.

Media ordering and labels are configured in `script.js`. All URLs are relative, so the same files
work at a domain root or under a repository subpath.

## Optional asset tools

Render Main Results images into the published asset directory:

```bash
python3 scripts/render_main_result_assets.py --overwrite
```

The orbit GIF source videos and intermediate candidates are intentionally excluded from the
published site. To regenerate candidates from an external source directory:

```bash
ORBIT_SOURCE_ROOT=/path/to/orbit_video bash scripts/build_orbit_gifs.sh all
```

Candidates are written to `build/orbit-gif-candidates/`. Copy only selected Input/Output GIFs into
`assets/gifs/real/` or `assets/gifs/partial/`, then update `script.js`.

## Deploy to GitHub Pages

Make this directory the repository root, commit it, then select **Settings > Pages > Deploy from a
branch > main / root**. The included `.nojekyll` file prevents Jekyll from filtering static files.

The largest current asset is below GitHub's 100 MB single-file limit. No build command is needed.
