#!/bin/bash
set -euo pipefail

MODE="${1:-install}"
BASE_DIR="$(realpath "$(dirname "${BASH_SOURCE[0]}")")"

FILES=(
  # VS Code
  "agents/cloudformation-security-analyst.md:$HOME/Library/Application Support/Code/User/prompts/cloudformation-security-analyst.agent.md"
  "commands/commit.md:$HOME/Library/Application Support/Code/User/prompts/commit.prompt.md"

  # OpenCode
  # ...
)

for entry in "${FILES[@]}"; do
  src="${entry%%:*}"
  dest="${entry#*:}"

  if [[ "$MODE" == "install" ]]; then
    echo "Linking $src → $dest"
    mkdir -p "$(dirname "$dest")"
    ln -sf "$BASE_DIR/$src" "$dest"
  elif [[ "$MODE" == "remove" ]]; then
    echo "Removing $dest"
    rm -f "$dest"
  else
    echo "Unknown mode: $MODE"
    exit 1
  fi
done
