#!/usr/bin/env bash
set -euo pipefail

# Symlink built files to their platform-specific installation locations
# Usage: ./link.sh [install|remove]
#   install: Create symlinks (default)
#   remove: Remove symlinks

# Get mode from first argument, default to install
MODE="${1:-install}"

# Resolve paths
SCRIPT_DIR=$(cd $(dirname $0) && pwd)
PROJECT_ROOT=$(cd $SCRIPT_DIR/.. && pwd)

# File mappings: source_file:destination_path
# Maps dist/ files to their installation locations with platform-specific suffixes
FILES=(
  # GitHub Copilot (VS Code)
  "dist/copilot/agents/cloudformation-security-analyst.md:$HOME/Library/Application Support/Code/User/prompts/cloudformation-security-analyst.agent.md"
  "dist/copilot/commands/commit.md:$HOME/Library/Application Support/Code/User/prompts/commit.prompt.md"

  # TODO: OpenCode - add paths when available
  "dist/opencode/commands/commit.md:$HOME/.config/opencode/commands/commit.md"
)

# Process each file mapping
for entry in "${FILES[@]}"; do
  # Parse source and destination from entry (format: src:dest)
  src="${entry%%:*}"
  dest="${entry#*:}"

  if [[ "$MODE" == "install" ]]; then
    # Create destination directory and symlink source file
    mkdir -p "$(dirname "$dest")"
    ln -sf "$PROJECT_ROOT/$src" "$dest"
    echo "Linked $src → $dest"
  elif [[ "$MODE" == "remove" ]]; then
    # Remove the symlink
    rm -f "$dest"
    echo "Removed $dest"
  else
    echo "Error: Unknown mode: $MODE" >&2
    exit 1
  fi
done
