---
description: "Prompt and workflow for generating conventional commit messages. Guides users to create standardized, descriptive commit messages in line with the Conventional Commits specification, including instructions, examples, and validation."
tools: ["execute/runInTerminal", "execute/getTerminalOutput"]
agent: agent
---

# Conventional Commit Messages

This guide helps you create standardized, descriptive commit messages following the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

## Workflow

### Follow these steps

1. **Review all changes**: Run `git status` to see all changed files
2. **Inspect changes in detail**: Run `git diff` to review the actual code changes
3. **Group related changes**: Identify logical groups of changes that belong together:
   - Documentation updates (README, guides, etc.)
   - Feature implementations (new functionality)
   - Bug fixes (corrections to existing code)
   - Tests (new or updated test files)
   - Configuration changes (settings, CI/CD, etc.)
   - Refactoring (code improvements without behavior changes)
   - Infrastructure/tooling (build scripts, development tools)
4. **Commit each group separately**:
   - Stage files for one logical group: `git add <file1> <file2>`
   - Review staged changes: `git diff --cached`
   - Construct your commit message using the XML structure below
   - Copilot will run: `git commit -m "type(scope): description"`
   - Repeat for each logical group
5. **Verify**: Run `git log` to review your commit history

### Benefits of logical grouping

- Easier code review and understanding of changes
- Cleaner git history that tells a story
- Simpler to revert specific changes if needed
- Better collaboration with team members

### Commit Message Structure

```
type(scope): description

[optional body]

[optional footer]
```

**Components:**

- **type**: The kind of change (required)
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, semicolons, etc.)
  - `refactor`: Code refactoring without behavior change
  - `perf`: Performance improvements
  - `test`: Adding or updating tests
  - `build`: Build system or external dependencies
  - `ci`: CI/CD configuration changes
  - `chore`: Maintenance tasks
  - `revert`: Revert a previous commit

- **scope**: Component or area affected (optional but recommended)
  - Examples: `parser`, `ui`, `api`, `auth`, `standards`, `tooling`

- **description**: Brief summary in imperative mood (required)
  - Use "add" not "added", "fix" not "fixed"
  - Keep it concise (< 50 characters ideal)

- **body**: Detailed explanation (optional)
  - Explain what and why, not how
  - Separate from description with blank line

- **footer**: Breaking changes or issue references (optional)
  - Use `BREAKING CHANGE:` for breaking changes
  - Reference issues: `Closes #123` or `Fixes #456`

### Examples

**Simple commits:**

```
feat(parser): add ability to parse arrays
fix(ui): correct button alignment
docs: update README with usage instructions
refactor: improve performance of data processing
chore: update dependencies
```

**Breaking change:**

```
feat!: send email on registration

BREAKING CHANGE: email service configuration is now required
```

### Logical Grouping Examples

**Scenario: Multiple untracked files in .github/**

```
Untracked files:
  .github/copilot-instructions.md
  .github/instructions/core-standards.instructions.md
  .github/instructions/development-standards.instructions.md
  .github/instructions/testing-standards.instructions.md
  .github/prompts/commit.prompt.md
  .github/agents/.plan.agent.md
```

**Recommended grouping:**

1. **First commit** - Project documentation:

   ```bash
   git add .github/copilot-instructions.md
   git commit -m "docs: add project overview and architecture documentation"
   ```

2. **Second commit** - Coding standards:

   ```bash
   git add .github/instructions/core-standards.instructions.md
   git add .github/instructions/development-standards.instructions.md
   git add .github/instructions/testing-standards.instructions.md
   git commit -m "docs(standards): add coding, development, and testing standards"
   ```

3. **Third commit** - Development tools:
   ```bash
   git add .github/prompts/commit.prompt.md
   git add .github/agents/.plan.agent.md
   git commit -m "chore(tooling): add commit prompt template and planning agent"
   ```

### Best Practices

- ✅ Use imperative mood: "add feature" not "added feature"
- ✅ Keep description under 50 characters when possible
- ✅ Use scope to provide context about what area changed
- ✅ Include body for non-obvious changes
- ✅ Reference issues in footer when applicable
- ✅ Mark breaking changes with `!` or `BREAKING CHANGE:`
- ❌ Don't use past tense in descriptions
- ❌ Don't end description with a period
- ❌ Don't be vague ("fix stuff", "update things")

### Committing

Once you've staged your changes and constructed your message:

```bash
# Simple commit
git commit -m "type(scope): description"

# Commit with body
git commit -m "type(scope): description" -m "Detailed explanation of the change and reasoning."

# Commit with body and footer
git commit -m "type(scope): description" -m "Detailed explanation." -m "Closes #123"
```
