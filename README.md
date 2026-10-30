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
├── commands/                  # 9 custom slash commands
├── plugins/caveman/           # local caveman plugin
└── skills/                    # 47 skills
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
| `/impeccable` | Design critique, audit, polish, live variants |

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

47 skill directories in `skills/<name>/SKILL.md`. Skills are loaded by the
model through the `skill` tool, on demand. They are not slash commands.

Three sources:

| Source | Count | Notes |
|---|---|---|
| caveman suite | 9 | `caveman*`, `megacave`, `ultracave`, `cavecrew` |
| [no-ai-slop](https://github.com/petergyang/no-ai-slop) | 1 | removes AI writing patterns |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 32 | engineering and productivity workflows |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 1 | page design with browser checks |
| [impeccable](https://github.com/pbakaus/impeccable) | 1 | design vocabulary, critique and slop detector |
| [svg-diagram](https://github.com/bybit-exchange/svg-diagram) | 1 | hand-written SVG diagrams plus a zero-dependency linter |
| local | 1 | `labview-project-reader`, vendors [junior941230/labview-vi-reader](https://github.com/junior941230/labview-vi-reader) |
| [awesome-copilot](https://github.com/github/awesome-copilot) | 1 | ImageMagick recipes for resize, convert, metadata |

All are MIT except `impeccable` (Apache-2.0). All vendored here as plain files.

Catalogue below lists every skill.

### Catalogue

**Voice and brevity**

| Skill | What | When |
|---|---|---|
| `caveman` | Terse voice, facts kept | "be brief", "less tokens" |
| `ultracave` | Fragments, each fact once | maximum compression |
| `megacave` | Classical Chinese register | `/megacave` |
| `caveman-commit` | Conventional commit, compressed | write a commit |
| `caveman-review` | One line per finding | review a diff |
| `caveman-compress` | Shrink a memory file, keep a backup | `AGENTS.md` too long |
| `caveman-stats` | Token and cache usage | check spend |
| `caveman-help` | Command card | reminder |
| `cavecrew` | Route work to cavecrew subagents | keep main context small |

**Writing**

| Skill | What | When |
|---|---|---|
| `no-ai-slop` | Strip AI writing patterns, or detect them | draft sounds like AI |
| `writing-for-agents` | Write skills, `AGENTS.md`, `CLAUDE.md` | authoring agent docs |
| `writing-fragments` | Mine raw fragments, no structure | early ideation |
| `writing-shape` | Shape material paragraph by paragraph | drafting an article |
| `writing-beats` | Assemble material into a journey of beats | structuring a piece |

**Think and decide**

| Skill | What | When |
|---|---|---|
| `grilling` | Relentless interview primitive | stress-test thinking |
| `grill-me` | Same, non-code use | refine a plan |
| `grill-with-docs` | Grill, building glossary and ADRs | plan needs shared language |
| `ask-matt` | Router: which skill fits | unsure what to use |
| `loop-me` | Grill specs for workspace workflows | designing a workflow |
| `to-questionnaire` | Turn a blocked decision into a questionnaire | answer needs someone else |

**Spec and tickets**

| Skill | What | When |
|---|---|---|
| `setup-matt-pocock-skills` | Configure tracker, labels, doc layout | once per repo, first |
| `to-spec` | Synthesize conversation into a spec | conversation settled |
| `to-tickets` | Split plan or spec into tracer-bullet tickets | ready to break down work |
| `triage` | Move issues and PRs through triage states | backlog needs sorting |
| `wayfinder` | Map work too big for one session | multi-session epic |

**Build**

| Skill | What | When |
|---|---|---|
| `implement` | Build one spec or ticket | work defined |
| `implement-spec` | Whole spec, parallel subagents | big spec |
| `tdd` | Red-green-refactor, vertical slices | test-first work |
| `diagnosing-bugs` | Reproduce, minimise, instrument, fix, regress | hard bug or perf drop |
| `prototype` | Throwaway prototype | "does this model feel right" |

**Review and close**

| Skill | What | When |
|---|---|---|
| `code-review` | Standards and spec axes, parallel subagents | review branch or PR |
| `pr` | PR body shape, before/after evidence | writing a PR |
| `retro` | Improve the agent environment after a session | end of session |
| `improve-codebase-architecture` | Survey deepening opportunities | every few days |

**Design**

| Skill | What | When |
|---|---|---|
| `codebase-design` | Deep-module vocabulary | designing an interface |
| `domain-modeling` | Sharpens glossary and ADRs | terminology drift |

**Frontend design**

| Skill | What | When |
|---|---|---|
| `design-taste-frontend` | Deals an art direction, real photos, browser check | build or redesign a page |
| `impeccable` | 24 commands: critique, polish, audit, live variants | steer or review existing UI |

**Diagrams**

| Skill | What | When |
|---|---|---|
| `svg-diagram` | House style for hand-written SVG: layout, colour, `svg-lint` | flowchart or architecture figure |

**Context and research**

| Skill | What | When |
|---|---|---|
| `handoff` | Compact conversation into a handoff doc | switching agent |
| `chief-of-staff` | Long goal, subagents in one session | multi-hour task |
| `wait-what` | Re-pitch a message that missed | "didn't land" |
| `research` | Cited Markdown from primary sources | need facts gathered |
| `labview-project-reader` | Reads `.vi`, `.lvclass`, `.lvproj` without LabVIEW | legacy LabVIEW project |
| `image-manipulation-image-magick` | ImageMagick: resize, convert, batch, metadata | image batch work |

**Learning and ops**

| Skill | What | When |
|---|---|---|
| `teach` | Teach a concept over sessions | learning something |
| `wizard` | Bash wizard for human-only steps | infra, secrets, dashboards |

**Ponytail** (npm plugin, not in `skills/`)

| Skill | What | When |
|---|---|---|
| `ponytail` | Lazy senior dev ladder, levels `lite`/`full`/`ultra` | any coding task |
| `ponytail-review` | Over-engineering review of current changes | review a diff |
| `ponytail-audit` | Whole-repo over-engineering audit | audit a codebase |
| `ponytail-debt` | Collect `shortcut:` comments into a ledger | track deferred work |
| `ponytail-gain` | Measured impact from the benchmark | show savings |
| `ponytail-help` | Command card | reminder |
