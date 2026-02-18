# Agentic Development Configuration

My personal collection of custom AI agents and command prompts, designed to enhance development workflows with specialized AI assistance.

## Overview

This is my personal AI configuration repository that provides:

- **Custom AI Agents**: Specialized agents for specific tasks (e.g., CloudFormation security analysis)
- **Command Prompts**: Standardized workflows and prompts (e.g., conventional commit messages)
- **Easy Installation**: Simple stow-like symlinking system for IDE integration

## Installation

First, make the installation script executable:

```bash
chmod +x .link.sh
```

Then install the AI configurations:

```bash
make link
```

This will symlink the agent and command files to your editor's configuration directory.

**Currently configured for**:

- VS Code: `~/Library/Application Support/Code/User/prompts/`

## Uninstallation

Remove the installed configurations:

```bash
make unlink
```

## Project Structure

```
.
├── Makefile    # Installation commands
├── .link.sh    # Symlinking script
├── agents/    # Custom AI agents
│   └── cloudformation-security-analyst.md
└── commands/    # Command prompts
    └── commit.md
```

## Requirements

- Bash shell
- A working brain

## License

This is my personal configuration repository for development workflow enhancement. Feel free to fork and adapt for your own use.
