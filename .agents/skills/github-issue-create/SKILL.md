---
name: github-issue-create
description: >-
  Creates a new GitHub issue using the GitHub CLI (gh issue create): title,
  body, labels, assignees, milestone, template, or target repo. Use when the
  user asks to open, file, or create a GitHub issue via gh; wants gh issue new;
  or says to track work on GitHub without an existing issue number.
---

# GitHub issue create (gh CLI)

## When this applies

Use when the user wants a **new** issue recorded on GitHub and agrees to use **`gh`** (not only local notes). If they only want a draft, produce markdown they can paste instead of running `gh`.

## Prerequisites

- `gh` installed and authenticated: `gh auth status` (else `gh auth login`).
- Network access when running `gh`.
- Prefer the **git repo root** so the default remote matches the intended repository.
- Another repo: pass `-R owner/repo` (or `HOST/owner/repo` for GitHub Enterprise).

## 1. Gather content

Before running `gh`, confirm:

- **Title** — short, imperative or problem-focused (e.g. “Profile articles tab shows blank when empty”).
- **Body** — context, steps to reproduce, expected vs actual, screenshots/links as markdown. Do **not** paste secrets, tokens, or full `.env` contents.

Optional metadata from the user:

- **Labels** (`-l`): repeat per label or comma-separated per `gh` examples.
- **Assignee** (`-a`): logins or `@me`.
- **Milestone** (`-m`): exact name as on GitHub.
- **Project** (`-p`): project title; requires `gh auth refresh -s project` if GitHub returns project permission errors.
- **Template** (`-T`): must match a template filename in `.github/ISSUE_TEMPLATE/` (if the repo uses them).

## 2. Create the issue

**Simple (inline):**

```bash
gh issue create --title "Your title" --body "Your body (markdown OK in quotes; use a file for long text)."
```

**Long body or complex markdown — use a file:**

```bash
gh issue create --title "Your title" --body-file path/to/issue-body.md
```

**Stdin:**

```bash
gh issue create --title "Your title" --body-file -
# then paste body, end with Ctrl-D
```

**Labels and self-assign:**

```bash
gh issue create -t "Title" -b "Body" -l bug -l "help wanted" -a "@me"
```

**Editor (title + body in one buffer — first line is title):**

```bash
gh issue create -e
```

**Web UI:**

```bash
gh issue create -w
```

**Explicit repo:**

```bash
gh issue create -R owner/repo -t "Title" -b "Body"
```

**From template:**

```bash
gh issue create --template "Bug Report"
```

Alias: `gh issue new` is equivalent to `gh issue create`.

## 3. After create

`gh` prints the new issue URL. Share it with the user. Optionally mention the related skill for fixing issues: `github-issue-resolve`.

## Safety

- Do **not** run `gh issue create` without a clear title and body the user (or task) actually wants on the public tracker.
- If intent is ambiguous, ask once for title, body, and labels before creating.

## Checklist

- [ ] Title and body ready; no secrets in the body.
- [ ] Correct repo (`cwd` or `-R`).
- [ ] Labels / assignee / milestone / project / template applied if requested.
- [ ] Command run; URL returned to the user.
