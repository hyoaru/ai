# Agent configuration as code

One directory per harness at the repo root, each mirroring the paths that
harness reads from `$HOME`. Today that is OpenCode only; Codex and Claude Code
would slot in beside it as `codex/` and `claude/` when needed.

```
ai/
├── README.md
└── opencode/.config/opencode/     # linked to ~/.config/opencode
```

## OpenCode

`~/.config/opencode` is a symlink to this directory, so the app reads and writes
these files directly. Edit either path; there is no copy step.

```sh
ln -s ~/ai/opencode/.config/opencode ~/.config/opencode
```

### Layout

```
opencode/.config/opencode/
├── AGENTS.md                  # global rules for every session
├── opencode.jsonc             # plugin registration
├── cli.json                   # TUI settings, written by the app
├── agents/                    # 3 subagents (cavecrew)
├── commands/                  # 8 custom slash commands
├── plugins/caveman/           # local caveman plugin
└── skills/                    # 16 skills
```

### Agents

`agents/cavecrew-*.md` — three subagents that keep the main context small:
`builder` (1–2 file edits), `investigator` (read-only code location),
`reviewer` (diff review). Output is compressed, one line per finding.

### Commands

Custom slash commands live in `commands/*.md`. OpenCode only turns files here
into `/commands`; skills never become slash commands.

| Command | Does |
|---|---|
| `/caveman` | Turn terse mode on, off, or report status |
| `/ultracave` | Maximum compression |
| `/megacave` | Classical Chinese register |
| `/caveman-commit` | Conventional commit message, compressed |
| `/caveman-review` | One-line-per-finding code review |
| `/caveman-compress` | Compress a memory file, keep a backup |
| `/caveman-stats` | Token usage for the session |
| `/caveman-help` | Quick reference |

### Plugins

`opencode.jsonc` registers two plugins under different keys, one per API
generation:

```jsonc
{
  "plugin": ["./plugins/caveman/plugin.js"],   // local path
  "plugins": ["@dietrichgebert/ponytail"]      // npm package
}
```

- **caveman** — local, vendored. Tracks the active mode and exposes the
  `/caveman` commands through the plugin API.
- **ponytail** — installed from npm, cached in `~/.cache/opencode/npm/`.
  Injects the "lazy senior dev" ruleset every turn and registers its own six
  skills (`ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`,
  `ponytail-gain`, `ponytail-help`). Update with `opencode plugin update`.

A plugin path entry must point at a directory for the v2 API, which is why
ponytail is registered by package name rather than by file.

### Skills

16 skill directories in `skills/<name>/SKILL.md`. Skills are loaded by the
model through the `skill` tool, on demand. They are not slash commands.

Three sources:

| Source | Count | Notes |
|---|---|---|
| caveman suite | 6 | `caveman*`, `megacave`, `ultracave`, `cavecrew` |
| [no-ai-slop](https://github.com/petergyang/no-ai-slop) | 1 | removes AI writing patterns |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 9 | engineering and productivity workflows |

All three are MIT licensed and vendored here as plain files.

Nine of these come from `mattpocock/skills`: `grilling`, `tdd`,
`diagnosing-bugs`, `code-review`, `pr`, `retro`, `research`, `handoff` and
`writing-for-agents`.

### Catalogue

| Skill | What | When |
|---|---|---|
| `caveman` | Terse voice, facts kept | "be brief", "less tokens" |
| `ultracave` | Fragments, each fact once | maximum compression |
| `megacave` | Classical Chinese register | `/megacave` |
| `caveman-commit` | Conventional commit, compressed | write a commit |
| `caveman-review` | One line per finding | review a diff |
| `cavecrew` | Route work to cavecrew subagents | keep main context small |
| `no-ai-slop` | Strip AI writing patterns, or detect them | draft sounds like AI |
| `writing-for-agents` | Write skills, `AGENTS.md`, `CLAUDE.md` | authoring agent docs |
| `grilling` | Relentless interview about a plan | stress-test thinking |
| `tdd` | Red-green-refactor, vertical slices | test-first work |
| `diagnosing-bugs` | Reproduce, minimise, instrument, fix, regress | hard bug or perf drop |
| `code-review` | Standards and spec axes, parallel subagents | review branch or PR |
| `pr` | PR body shape, before/after evidence | writing a PR |
| `retro` | Improve the agent environment after a session | end of session |
| `research` | Cited Markdown from primary sources | need facts gathered |
| `handoff` | Compact conversation into a handoff doc | switching agent |

**Ponytail** (npm plugin, not in `skills/`)

| Skill | What | When |
|---|---|---|
| `ponytail` | Lazy senior dev ladder, levels `lite`/`full`/`ultra` | any coding task |
| `ponytail-review` | Over-engineering review of current changes | review a diff |
| `ponytail-audit` | Whole-repo over-engineering audit | audit a codebase |
| `ponytail-debt` | Collect `shortcut:` comments into a ledger | track deferred work |
| `ponytail-gain` | Measured impact from the benchmark | show savings |
| `ponytail-help` | Command card | reminder |
