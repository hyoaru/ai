# Agentic Development Configuration

My personal collection of custom AI agents and command prompts, designed to enhance development workflows with specialized AI assistance across multiple platforms.

## Overview

This is my personal AI configuration repository that provides:

- **Custom AI Agents**: Specialized agents for specific tasks (e.g., CloudFormation security analysis)
- **Command Prompts**: Standardized workflows and prompts (e.g., conventional commit messages)
- **Platform Agnostic**: Single source generates configurations for GitHub Copilot, OpenCode, and future platforms
- **Easy Installation**: Automated build and symlinking system for IDE integration

## Installation

Build and install the AI configurations:

```bash
make link
```

This will build platform-specific files and symlink them to your editor's configuration directory.

**Currently configured for**:

- GitHub Copilot: `~/Library/Application Support/Code/User/prompts/`

## Uninstallation

Remove the installed configurations:

```bash
make unlink
```

## How It Works

The system uses a platform-agnostic approach:

1. **Source files** in `src/` contain:
   - `base.md` - Shared prompt content (platform-independent)
   - `{platform}.md` - Platform-specific headers (frontmatter)

2. **Build process** (`make build`):
   - Concatenates platform header + base content
   - Outputs to `dist/{platform}/{type}/{prompt}.md`

3. **Link process** (`make link`):
   - Symlinks built files to platform installation directories
   - Adds platform-specific file suffixes

## Project Structure

```
.
├── Makefile              # Build and installation commands
├── scripts/
│   ├── build.sh         # Builds platform-specific files
│   └── link.sh          # Symlinks files to installation paths
├── src/                 # Source files
│   ├── agents/
│   │   └── cloudformation-security-analyst/
│   │       ├── base.md      # Shared content
│   │       └── copilot.md   # GitHub Copilot header
│   └── commands/
│       └── commit/
│           ├── base.md      # Shared content
│           └── copilot.md   # GitHub Copilot header
└── dist/                # Generated files (gitignored)
    └── copilot/
        ├── agents/
        └── commands/
```

## Requirements

- Bash shell
- A working brain

## License

This is my personal configuration repository for development workflow enhancement. Feel free to fork and adapt for your own use.
