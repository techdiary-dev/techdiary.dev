---
name: release-note
description: Generate a semver-compliant release note from git history
user-invocable: true
---

Generate a release note for this project following https://semver.org/.

## Steps

### 1. Gather git history

```bash
git tag --sort=-version:refname | head -5
```

Then get commits since the last tag (or last 30 if no tags exist):

```bash
# with tags:
git log <last-tag>..HEAD --oneline --no-merges
# no tags:
git log --oneline --no-merges -30
```

### 2. Determine current version

- If a version tag exists (e.g. `v1.2.3`) → that is the **current version**
- If no tags exist → current version is `v0.0.0`

### 3. Categorize commits

| Category | Bump | Signals |
|---|---|---|
| **Breaking Changes** | MAJOR | `BREAKING CHANGE:`, `!` after type (e.g. `feat!:`), words "breaking", "incompatible" |
| **Features** | MINOR | `feat:`, `feature:`, "add ", "new ", "implement" |
| **Bug Fixes** | PATCH | `fix:`, `bugfix:`, "fix ", "resolve ", "correct " |
| **Other** | PATCH | `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `ci`, `build` |

Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes when present; otherwise classify by message keywords.

### 4. Calculate next version

Apply the **highest** bump found:
- Any BREAKING CHANGE → bump MAJOR, reset minor + patch to 0
- Any feat (no breaking) → bump MINOR, reset patch to 0
- Only fixes/other → bump PATCH

> **Pre-1.0 rule:** If current major is `0`, treat BREAKING as MINOR (semver §4).

### 5. Print draft release note

```
## Release v<next> — <YYYY-MM-DD>

> Suggested bump: <MAJOR|MINOR|PATCH>  (v<current> → v<next>)

### 💥 Breaking Changes
- <message> (<sha>)

### ✨ Features
- <message> (<sha>)

### 🐛 Bug Fixes
- <message> (<sha>)

### 🔧 Other Changes
- <message> (<sha>)
```

Omit empty sections.

### 6. Ask for confirmation

After the draft, ask the user:

> **Does `v<next>` look right?**
> - Confirm → finalize and print the clean release note
> - Provide a different version (e.g. `v2.0.0`) → reformat with that version
> - Cancel → discard

Once confirmed:

1. **Update `package.json`** — read the file, set `"version"` to the confirmed version (without the `v` prefix, e.g. `"1.3.0"`), and write it back.

2. **Update `CHANGELOG.md`** — prepend the new release section (without the `> Suggested bump:` line) to the top of the entries in `CHANGELOG.md`. If the file doesn't exist, create it with a standard header:
   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   This project adheres to [Semantic Versioning](https://semver.org/).

   ---
   ```
   Then append the release section below the `---` separator.

3. **Output the final release note** ready to paste into a GitHub Release or PR description.
