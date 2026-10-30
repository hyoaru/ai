#!/usr/bin/env bash
set -euo pipefail

CACHE="${LABVIEW_VI_READER:-${XDG_CACHE_HOME:-$HOME/.cache}/labview-vi-reader}"
SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$CACHE/vi_summary.py" ]]; then
  mkdir -p "$(dirname "$CACHE")"
  git clone --depth 1 https://github.com/junior941230/labview-vi-reader.git "$CACHE"
fi

cmd="${1:-}"
shift || true

case "$cmd" in
  vi)
    exec python3 "$CACHE/vi_summary.py" "$@"
    ;;
  class|private)
    exec python3 "$SELF/lv_private.py" "$@"
    ;;
  *)
    echo "usage: lv.sh vi <file.vi> | class <file.lvclass> [outdir] | private <file.lvclass> [outdir]" >&2
    exit 2
    ;;
esac
