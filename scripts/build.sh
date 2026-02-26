#!/bin/sh
set -euo pipefail

# Resolve paths
SCRIPT_DIR=$(cd $(dirname $0) && pwd)
PROJECT_ROOT=$(cd $SCRIPT_DIR/.. && pwd)
SRC_DIR="$PROJECT_ROOT/src"
DIST_DIR="$PROJECT_ROOT/dist"

# Clean and recreate output directory
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Iterate through each type directory (agents, commands, etc.)
for type_dir in "$SRC_DIR"/*/; do
  [[ ! -d "$type_dir" ]] && continue
  type=$(basename "$type_dir")

  # Iterate through each prompt directory within type
  for prompt_dir in "$type_dir"/*/; do
    [[ ! -d "$prompt_dir" ]] && continue

    prompt=$(basename "$prompt_dir")
    base="$prompt_dir/base.md"
    [[ ! -f "$base" ]] && {
      echo "Error: Missing $base" >&2
      continue
    }

    # Iterate through each platform header file
    for header in "$prompt_dir"/*.md; do
      [[ "$(basename "$header")" == "base.md" ]] && continue
      [[ ! -f "$header" ]] && continue

      platform=$(basename "$header" .md)

      # Concatenate platform header + base content → output
      output="$DIST_DIR/$platform/$type/$prompt.md"
      mkdir -p "$(dirname "$output")"
      cat "$header" "$base" >"$output"
      echo "Built $platform/$type/$prompt.md"
    done
  done
done

echo "Done. Output: $DIST_DIR"
