#!/usr/bin/env bash
set -euo pipefail

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENDOR="$(cd "$SELF/../vendor" && pwd)"

case "${1:-}" in
  vi)
    shift
    exec python3 "$VENDOR/vi_summary.py" "$@"
    ;;
  class|private)
    shift
    exec python3 "$SELF/lv_private.py" "$@"
    ;;
  *)
    echo "usage: lv.sh vi <file.vi> | class <file.lvclass> [outdir] | private <file.lvclass> [outdir]" >&2
    exit 2
    ;;
esac
