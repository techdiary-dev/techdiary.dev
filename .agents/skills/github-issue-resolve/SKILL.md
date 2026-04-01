---
name: github-issue-resolve
description: >-
  Resolves a numbered GitHub issue using the GitHub CLI (gh): fetch full
  context, implement the fix, then post a structured summary comment on the
  issue. Use when the user asks to fix, solve, or implement a GitHub issue by
  number; mentions gh issue view or GitHub CLI for issues; or says to comment
  back on the issue after fixing.
---

# GitHub issue resolve (gh CLI)

## When this applies

Use this workflow when the user gives an issue number (e.g. “fix #57”, “solve issue 42”) and expects the work tracked on GitHub with a **comment**, not only local code changes.

## Prerequisites

- `gh` installed and authenticated: `gh auth status` (if it fails, run `gh auth login`).
- Shell with `network` permission when calling `gh`.
- Run `gh` from the **git repo root** so `gh issue view` targets the correct repository.

## 1. Load the issue

Always fetch the issue before coding so title, body, labels, and images/links are grounded in real data.

```bash
gh issue view <N>
```

Useful additions:

```bash
gh issue view <N> --json title,body,state,labels,assignees,comments --jq .
```

If discussion matters:

```bash
gh issue view <N> --comments
```

**Images in the body**: GitHub stores them as URLs; open or fetch if the visual is required to understand the bug.

## 2. Implement the fix

- Follow the repo’s normal patterns (read surrounding code first; minimal diff).
- Run targeted checks (e.g. `eslint` on touched files, `bun run build` if appropriate). Fix anything **introduced** by the change.

## 3. Summary for GitHub (before commenting)

Draft a short, professional summary the maintainer can skim:

- **What** was wrong (1–2 sentences, tied to the issue).
- **What changed** (bullet list of files or areas; no huge pasted code).
- **How to verify** (e.g. steps or pages to open).
- Optional: **Follow-ups** only if truly out of scope.

Do **not** include secrets, tokens, `.env` values, or internal-only URLs in the comment.

## 4. Post the comment on the issue

Post the summary as an **issue comment** (does not close the issue unless the user asked to close it).

**Option A — body from stdin:**

```bash
gh issue comment <N> --body "$(cat <<'EOF'
## Summary

[your markdown here]
EOF
)"
```

**Option B — file:**

Write the body to a temp file, then:

```bash
gh issue comment <N> --body-file /path/to/comment.md
```

Prefer markdown headings (`##`) and bullets for readability.

## 5. Close the issue (only if asked)

If the user explicitly wants the issue closed after the fix:

```bash
gh issue close <N> --comment "Fixed in [branch/PR description]. See comment above for details."
```

Otherwise leave it **open** for human review or PR merge.

## Checklist

- [ ] Fetched issue with `gh issue view` (and JSON/comments if needed).
- [ ] Implemented and validated the change locally.
- [ ] Wrote a concise summary (no secrets).
- [ ] Posted `gh issue comment <N>`.
- [ ] Closed the issue only if the user requested it.
