#!/usr/bin/env bash
set -Eeuo pipefail

# Convert every rendernorm/sourcecano orbit-video pair into reviewable GIFs.
# Configuration can be overridden with environment variables; see usage().

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
SOURCE_ROOT=${ORBIT_SOURCE_ROOT:-"$PROJECT_DIR/orbit_video"}
OUTPUT_DIR=${ORBIT_OUTPUT_DIR:-"$PROJECT_DIR/build/orbit-gif-candidates"}
FPS=${ORBIT_FPS:-8}
CELL_SIZE=${ORBIT_CELL_SIZE:-280}
DURATION=${ORBIT_DURATION:-6}
SATURATION=${ORBIT_SATURATION:-1.18}
JOBS=${ORBIT_JOBS:-1}
FORCE=${ORBIT_FORCE:-0}
PAIR_ONLY=${ORBIT_PAIR_ONLY:-0}
LIMIT=${ORBIT_LIMIT:-0}
DATASET=${1:-all}

usage() {
  cat <<'EOF'
Usage:
  bash scripts/build_orbit_gifs.sh [all|real|partial]

Optional environment variables:
  ORBIT_FPS=8             Frames per second in each GIF.
  ORBIT_CELL_SIZE=280     Width and height of each square video cell.
  ORBIT_DURATION=6        Seconds to keep; use 0 for full video length.
  ORBIT_SATURATION=1.18   Color saturation multiplier.
  ORBIT_JOBS=1            Number of cases converted in parallel.
  ORBIT_PAIR_ONLY=0       Set to 1 to generate only side-by-side GIFs.
  ORBIT_FORCE=0           Set to 1 to regenerate existing GIFs.
  ORBIT_LIMIT=0           Process only N cases; 0 means all cases.
  ORBIT_OUTPUT_DIR=...    Destination directory.
  ORBIT_SOURCE_ROOT=...  Optional orbit_video source directory.
  FFMPEG_BIN=...    Explicit ffmpeg executable.

Examples:
  bash scripts/build_orbit_gifs.sh all
  ORBIT_JOBS=4 ORBIT_FPS=10 ORBIT_CELL_SIZE=320 bash scripts/build_orbit_gifs.sh real
  ORBIT_PAIR_ONLY=1 ORBIT_LIMIT=3 bash scripts/build_orbit_gifs.sh partial
EOF
}

if [[ "$DATASET" == "-h" || "$DATASET" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "$DATASET" != "all" && "$DATASET" != "real" && "$DATASET" != "partial" ]]; then
  echo "Unknown dataset: $DATASET" >&2
  usage >&2
  exit 2
fi

for numeric_value in "$FPS" "$CELL_SIZE" "$JOBS" "$LIMIT"; do
  if ! [[ "$numeric_value" =~ ^[0-9]+$ ]]; then
    echo "FPS, CELL_SIZE, JOBS, and LIMIT must be non-negative integers." >&2
    exit 2
  fi
done
if (( FPS < 1 || CELL_SIZE < 32 || JOBS < 1 )); then
  echo "FPS and JOBS must be at least 1; CELL_SIZE must be at least 32." >&2
  exit 2
fi

configure_ffmpeg() {
  if [[ -n "${FFMPEG_BIN:-}" ]]; then
    return
  fi

  if command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG_BIN=$(command -v ffmpeg)
    return
  fi

  local conda_root=/home/lkd_23/miniconda3
  local bundled_ffmpeg="$conda_root/pkgs/ffmpeg-8.0.1-heee01a6_5/bin/ffmpeg"
  if [[ ! -x "$bundled_ffmpeg" ]]; then
    echo "ffmpeg was not found. Set FFMPEG_BIN to an ffmpeg executable." >&2
    exit 1
  fi

  FFMPEG_BIN=$bundled_ffmpeg
  local newest_stdlib
  local package_libs
  newest_stdlib=$(find "$conda_root/pkgs" -maxdepth 2 -type d -path '*/libstdcxx-[0-9]*/lib' | sort -V | tail -n 1)
  package_libs=$(find "$conda_root/pkgs" -maxdepth 2 -type d -name lib | paste -sd: -)
  export LD_LIBRARY_PATH="${newest_stdlib:+$newest_stdlib:}$package_libs:$conda_root/lib:${LD_LIBRARY_PATH:-}"
}

configure_ffmpeg
if ! "$FFMPEG_BIN" -version >/dev/null 2>&1; then
  echo "ffmpeg exists but cannot start: $FFMPEG_BIN" >&2
  echo "Try setting FFMPEG_BIN to a working ffmpeg executable." >&2
  exit 1
fi

duration_args=()
if [[ "$DURATION" != "0" ]]; then
  duration_args=(-t "$DURATION")
fi

single_filter() {
  printf '%s' "fps=${FPS},scale=${CELL_SIZE}:${CELL_SIZE}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${CELL_SIZE}:${CELL_SIZE}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,hue=s=${SATURATION},colorlevels=rimin=0.015:gimin=0.015:bimin=0.015:rimax=0.985:gimax=0.985:bimax=0.985,split[s0][s1];[s0]palettegen=max_colors=192:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle"
}

gif_is_complete() {
  local gif_path=$1
  local trailer
  [[ -s "$gif_path" ]] || return 1
  trailer=$(tail -c 1 -- "$gif_path" | od -An -tu1 | tr -d '[:space:]')
  [[ "$trailer" == "59" ]]
}

make_single_gif() {
  local source_video=$1
  local output_gif=$2
  if [[ "$FORCE" != "1" ]] && gif_is_complete "$output_gif"; then
    return
  fi

  "$FFMPEG_BIN" -nostdin -hide_banner -loglevel error -y \
    "${duration_args[@]}" -i "$source_video" \
    -filter_complex "$(single_filter)" \
    -loop 0 "$output_gif"
}

make_pair_gif() {
  local input_video=$1
  local output_video=$2
  local output_gif=$3
  if [[ "$FORCE" != "1" ]] && gif_is_complete "$output_gif"; then
    return
  fi

  local normalize="fps=${FPS},scale=${CELL_SIZE}:${CELL_SIZE}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${CELL_SIZE}:${CELL_SIZE}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,hue=s=${SATURATION},colorlevels=rimin=0.015:gimin=0.015:bimin=0.015:rimax=0.985:gimax=0.985:bimax=0.985"
  "$FFMPEG_BIN" -nostdin -hide_banner -loglevel error -y \
    "${duration_args[@]}" -i "$input_video" \
    "${duration_args[@]}" -i "$output_video" \
    -filter_complex "[0:v]${normalize}[input];[1:v]${normalize}[output];[input][output]hstack=inputs=2:shortest=1,split[s0][s1];[s0]palettegen=max_colors=192:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle" \
    -loop 0 "$output_gif"
}

process_pair() {
  local dataset_name=$1
  local input_video=$2
  local output_video=$3
  local stem=$4
  local dataset_output="$OUTPUT_DIR/$dataset_name"

  local log_file="$dataset_output/logs/$stem.log"
  mkdir -p "$dataset_output/input" "$dataset_output/output" "$dataset_output/pairs" "$dataset_output/logs"
  echo "[$dataset_name] $stem"

  if ! {
    if [[ "$PAIR_ONLY" != "1" ]]; then
      make_single_gif "$input_video" "$dataset_output/input/$stem.gif"
      make_single_gif "$output_video" "$dataset_output/output/$stem.gif"
    fi
    make_pair_gif "$input_video" "$output_video" "$dataset_output/pairs/$stem.gif"
  } 2>"$log_file"; then
    echo "  ffmpeg log: $log_file" >&2
    return 1
  fi
  rm -f -- "$log_file"
}

pids=()
job_names=()
failures=0

stop_jobs() {
  trap - INT TERM
  local pid
  for pid in "${pids[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo "Interrupted; completed GIFs are kept and can be resumed." >&2
  exit 130
}
trap stop_jobs INT TERM

wait_for_first_job() {
  local pid=${pids[0]}
  local job_name=${job_names[0]}
  if ! wait "$pid"; then
    echo "Failed: $job_name" >&2
    failures=$((failures + 1))
  fi
  pids=("${pids[@]:1}")
  job_names=("${job_names[@]:1}")
}

launch_job() {
  local dataset_name=$1
  local input_video=$2
  local output_video=$3
  local stem=$4
  process_pair "$dataset_name" "$input_video" "$output_video" "$stem" </dev/null &
  pids+=("$!")
  job_names+=("$dataset_name/$stem")
  if (( ${#pids[@]} >= JOBS )); then
    wait_for_first_job
  fi
}

processed=0
missing=0
queued_items=()

queue_dataset() {
  local dataset_name=$1
  local source_dir="$SOURCE_ROOT/${dataset_name}_data"
  if [[ ! -d "$source_dir" ]]; then
    echo "Missing source directory: $source_dir" >&2
    exit 1
  fi

  local input_video
  local -a input_videos=()
  mapfile -d '' -t input_videos < <(find "$source_dir" -maxdepth 1 -type f -name '*_rendernorm.mp4' -print0 | sort -z)

  for input_video in "${input_videos[@]}"; do
    if (( LIMIT > 0 && processed >= LIMIT )); then
      break
    fi

    local filename
    local stem
    local output_video
    input_video=$(realpath -e -- "$input_video")
    filename=$(basename "$input_video")
    if [[ "$filename" == *__rendernorm.mp4 ]]; then
      stem=${filename%__rendernorm.mp4}
      output_video="$source_dir/${stem}__sourcecano.mp4"
    else
      stem=${filename%_rendernorm.mp4}
      output_video="$source_dir/${stem}_sourcecano.mp4"
    fi

    if [[ ! -f "$output_video" ]]; then
      echo "Skipping unmatched input: $filename" >&2
      missing=$((missing + 1))
      continue
    fi
    output_video=$(realpath -e -- "$output_video")

    launch_job "$dataset_name" "$input_video" "$output_video" "$stem"
    queued_items+=("$dataset_name|$stem")
    processed=$((processed + 1))
  done
}

SOURCE_ROOT=$(realpath -e -- "$SOURCE_ROOT")
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR=$(cd "$OUTPUT_DIR" && pwd)
printf 'Source root: %s\nOutput dir:  %s\n\n' "$SOURCE_ROOT" "$OUTPUT_DIR"
if [[ "$DATASET" == "all" || "$DATASET" == "real" ]]; then
  queue_dataset real
fi
if [[ "$DATASET" == "all" || "$DATASET" == "partial" ]]; then
  queue_dataset partial
fi
while (( ${#pids[@]} > 0 )); do
  wait_for_first_job
done

verify_outputs() {
  local expected_per_case=3
  if [[ "$PAIR_ONLY" == "1" ]]; then
    expected_per_case=1
  fi

  local expected_count=$((${#queued_items[@]} * expected_per_case))
  local complete_count=0
  local item
  for item in "${queued_items[@]}"; do
    local dataset_name=${item%%|*}
    local stem=${item#*|}
    local pair_gif="$OUTPUT_DIR/$dataset_name/pairs/$stem.gif"
    if gif_is_complete "$pair_gif"; then
      complete_count=$((complete_count + 1))
    else
      echo "Missing or incomplete: $pair_gif" >&2
    fi

    if [[ "$PAIR_ONLY" != "1" ]]; then
      local input_gif="$OUTPUT_DIR/$dataset_name/input/$stem.gif"
      local output_gif="$OUTPUT_DIR/$dataset_name/output/$stem.gif"
      if gif_is_complete "$input_gif"; then
        complete_count=$((complete_count + 1))
      else
        echo "Missing or incomplete: $input_gif" >&2
      fi
      if gif_is_complete "$output_gif"; then
        complete_count=$((complete_count + 1))
      else
        echo "Missing or incomplete: $output_gif" >&2
      fi
    fi
  done

  printf 'Verified GIFs: %s / %s\n' "$complete_count" "$expected_count"
  [[ "$complete_count" == "$expected_count" ]]
}

verification_failed=0
if ! verify_outputs; then
  verification_failed=1
fi

write_index() {
  local index_file="$OUTPUT_DIR/index.html"
  cat > "$index_file" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Orbit GIF candidates</title>
  <style>
    :root { color-scheme: light; font-family: Inter, Arial, sans-serif; color: #272321; background: #f5f3f0; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    header { position: sticky; z-index: 5; top: 0; display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1px solid #dcd6d1; background: rgba(255,255,255,.96); }
    h1 { margin: 0 auto 0 0; font: 500 21px Georgia, serif; }
    input[type="search"] { width: min(280px, 34vw); padding: 9px 11px; border: 1px solid #cec7c1; border-radius: 5px; background: white; }
    button { padding: 9px 12px; border: 1px solid #bb5837; border-radius: 5px; color: white; background: #c85b36; cursor: pointer; }
    main { width: min(1440px, calc(100% - 36px)); margin: 34px auto 70px; }
    section + section { margin-top: 48px; }
    h2 { margin: 0 0 16px; font: 500 18px Georgia, serif; text-transform: capitalize; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
    .card { position: relative; display: block; overflow: hidden; border: 1px solid #d9d2cc; border-radius: 6px; background: white; cursor: pointer; }
    .card.selected { border-color: #128c84; box-shadow: 0 0 0 2px #128c84; }
    .card img { display: block; width: 100%; aspect-ratio: 2 / 1; object-fit: contain; background: #f8f7f5; }
    .meta { display: flex; align-items: center; gap: 9px; padding: 11px 12px; border-top: 1px solid #e4dfdb; }
    .meta strong { min-width: 0; overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .meta span { margin-left: auto; color: #8a817a; font-size: 9px; }
    .empty { color: #837b75; font-family: Georgia, serif; }
    @media (max-width: 620px) { header { flex-wrap: wrap; padding: 13px; } h1 { width: 100%; } input[type="search"] { width: 100%; } main { width: calc(100% - 24px); } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Orbit GIF candidates</h1>
    <input id="search" type="search" placeholder="Filter case name" aria-label="Filter case name" />
    <span><b id="selected-count">0</b> selected</span>
    <button id="export" type="button">Export selection</button>
  </header>
  <main>
EOF

  local dataset_name
  for dataset_name in real partial; do
    printf '    <section data-dataset="%s">\n      <h2>%s data</h2>\n      <div class="grid">\n' "$dataset_name" "$dataset_name" >> "$index_file"
    local found=0
    while IFS= read -r -d '' pair_gif; do
      found=1
      local stem
      stem=$(basename "$pair_gif" .gif)
      printf '        <label class="card" data-name="%s"><img src="%s/pairs/%s.gif" alt="%s input and output GIF" loading="lazy" /><span class="meta"><input type="checkbox" value="%s/%s" /><strong>%s</strong><span>Input | Output</span></span></label>\n' \
        "$stem" "$dataset_name" "$stem" "$stem" "$dataset_name" "$stem" "$stem" >> "$index_file"
    done < <(find "$OUTPUT_DIR/$dataset_name/pairs" -maxdepth 1 -type f -name '*.gif' -print0 2>/dev/null | sort -z)
    if (( found == 0 )); then
      printf '        <p class="empty">No GIFs generated for this dataset.</p>\n' >> "$index_file"
    fi
    printf '      </div>\n    </section>\n' >> "$index_file"
  done

  cat >> "$index_file" <<'EOF'
  </main>
  <script>
    const checks = [...document.querySelectorAll('input[type="checkbox"]')];
    const count = document.querySelector('#selected-count');
    const update = () => {
      checks.forEach((check) => check.closest('.card').classList.toggle('selected', check.checked));
      count.textContent = checks.filter((check) => check.checked).length;
    };
    checks.forEach((check) => check.addEventListener('change', update));
    document.querySelector('#search').addEventListener('input', (event) => {
      const query = event.target.value.trim().toLowerCase();
      document.querySelectorAll('.card').forEach((card) => {
        card.hidden = !card.dataset.name.toLowerCase().includes(query);
      });
    });
    document.querySelector('#export').addEventListener('click', () => {
      const selected = checks.filter((check) => check.checked).map((check) => check.value);
      const blob = new Blob([selected.join('\n') + (selected.length ? '\n' : '')], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'selected_cases.txt';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  </script>
</body>
</html>
EOF
}

write_index

echo
echo "Processed pairs: $processed"
echo "Unmatched inputs: $missing"
echo "Failed pairs: $failures"
echo "Review page: $OUTPUT_DIR/index.html"

if (( failures > 0 || verification_failed > 0 )); then
  exit 1
fi
