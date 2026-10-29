Agent configuration as code.

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
└── skills/                    # 48 skills
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

48 skill directories in `skills/<name>/SKILL.md`. Skills are loaded by the
model through the `skill` tool, on demand. They are not slash commands.

Three sources:

| Source | Count | Notes |
|---|---|---|
| caveman suite | 9 | `caveman*`, `megacave`, `ultracave`, `cavecrew` |
| [no-ai-slop](https://github.com/petergyang/no-ai-slop) | 1 | removes AI writing patterns |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 38 | engineering and productivity workflows |

All three are MIT licensed and vendored here as plain files.

`mattpocock/skills` teaches a full workflow: `grill-me` / `grill-with-docs` to
interrogate a plan, `to-spec` and `to-tickets` to split the work, `implement`
and `tdd` to build it, `code-review` and `pr` to close it out. Run
`setup-matt-pocock-skills` once per repo that uses that flow.

### Updating

**ponytail** (npm):

```sh
opencode plugin update
```

**mattpocock/skills** — the installer always writes to `~/.agents/skills`, so
move the result back into this repo:

```sh
npx skills@latest add mattpocock/skills -a opencode --global --yes
mv ~/.agents/skills/* opencode/.config/opencode/skills/
rmdir ~/.agents/skills ~/.agents
git add -A opencode/.config/opencode/skills && git commit -m "chore(skills): update mattpocock/skills"
```

The `mv` does not delete skills removed upstream; prune those by hand.

**no-ai-slop**:

```sh
cp skills/no-ai-slop/{SKILL.md,eval.md} opencode/.config/opencode/skills/no-ai-slop/
```

### Gitignored

Runtime files the app writes, kept out of git:

- `.config/opencode/service.json` — contains a credential
- `.config/opencode/.ponytail-active` — current ponytail mode

`cli.json` is tracked on purpose: it holds TUI settings worth versioning. The
app rewrites it on settings changes, which shows up as a normal diff.

### Notes

- No `stow` for this package. The whole directory is one symlink; per-file
  links would break whenever the app rewrites a file.
- App upgrades may add runtime files here. Check `git status` afterwards and
  extend the ignore file if needed.
- Deleting this repository directory deletes the live configuration.

## Adding a harness

Create `<harness>/` at the repo root, mirroring the paths that harness reads
from `$HOME`, then symlink the directory into place. Keep each harness's
runtime state out of git with a local `.gitignore`.
