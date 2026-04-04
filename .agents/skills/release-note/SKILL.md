---
name: release-note
description: Generate a semver-compliant release note from git history; on user confirmation, bump version, update CHANGELOG, create git tag, and publish a GitHub Release with gh
user-invocable: true
---

Generate a release note for this project following https://semver.org/. When the user **confirms** the version, also **commit** (if needed), **tag**, **push the tag**, and **`gh release create`** using the final notes as the release description.

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
> - **Confirm** → finalize files, **create git tag**, **create GitHub Release** with the release notes as the description (see step 7)
> - Provide a different version (e.g. `v2.0.0`) → reformat with that version
> - **Cancel** → discard (no file writes, no tag, no release)

### 7. After confirmation — files, tag, and GitHub Release

Use the **confirmed** version as `v<next>` (e.g. `v0.4.0`). The **final release body** is the same content as in `CHANGELOG.md` for that version: title `## Release v<next> — <YYYY-MM-DD>` plus sections (omit empty ones). Do **not** include the draft-only line `> Suggested bump: ...`.

1. **Update `package.json`** — set `"version"` to the semver without `v` (e.g. `"0.4.0"`).

2. **Update `CHANGELOG.md`** — prepend the final release section (same as the GitHub Release description). If the file does not exist, create it with:
   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   This project adheres to [Semantic Versioning](https://semver.org/).

   ---
   ```

3. **Commit** the version bump and changelog (if the repo should record the release commit before tagging):
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore(release): v<next>"
   git push origin HEAD
   ```
   Skip commit/push only if the user already committed these changes or explicitly asks not to.

4. **Create an annotated tag** at the release commit:
   ```bash
   git tag -a "v<next>" -m "Release v<next>"
   git push origin "v<next>"
   ```
   If the tag already exists locally or on the remote, stop and resolve (delete mistaken tag or bump version) before continuing.

5. **Create the GitHub Release** with the same notes as `CHANGELOG` for this version:
   ```bash
   # Write the final body to a temp file, then:
   gh release create "v<next>" --title "Release v<next>" --notes-file /tmp/release-v<next>.md
   ```
   Alternatively pass `--notes` with the full markdown string. Do not use `--generate-notes` if you want the curated changelog to match `CHANGELOG.md`.

   Requirements: `gh` CLI authenticated (`gh auth status`), and permission to create releases on the repo.

6. **Output** the final release note in chat for the user’s records (same text as in the Release description).

#### If `gh release create` should create the tag (alternative)

Some teams skip the local annotated tag and let GitHub create the tag from the default branch when publishing the release:

```bash
gh release create "v<next>" --title "Release v<next>" --notes-file /tmp/release-v<next>.md --target <branch>
```

Prefer the **annotated tag + push + `gh release create`** flow (steps 4–5) so the tag exists locally and matches the release commit; use `--target` only when aligning with a specific branch policy.
