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
  "dist/copilot/agents/least-privilege-policy-action-generator.md:$HOME/Library/Application Support/Code/User/prompts/least-privilege-policy-action-generator.agent.md"
  "dist/copilot/commands/commit.md:$HOME/Library/Application Support/Code/User/prompts/commit.prompt.md"
  "dist/copilot/commands/grill-me.md:$HOME/Library/Application Support/Code/User/prompts/grill-me.prompt.md"
  "dist/copilot/commands/to-prd.md:$HOME/Library/Application Support/Code/User/prompts/to-prd.prompt.md"
  "dist/copilot/commands/to-issues.md:$HOME/Library/Application Support/Code/User/prompts/to-issues.prompt.md"

  "dist/opencode/commands/commit.md:$HOME/.config/opencode/commands/commit.md"
  "dist/opencode/commands/grill-me.md:$HOME/.config/opencode/commands/grill-me.md"
  "dist/opencode/commands/to-prd.md:$HOME/.config/opencode/commands/to-prd.md"
  "dist/opencode/commands/to-issues.md:$HOME/.config/opencode/commands/to-issues.md"
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
