# Activity rich-text description

- Issue: https://github.com/FrijolMagico/FrijolMagico/issues/194
- Branch/worktree: `feat/activity-rich-text-description` at `/home/strocs/dev/FrijolMagico-activity-richtext`, based on `dev` (`ce713d4b`).
- Objective: Let administrators format the public `actividad.descripcion` for participation activities and display that formatting safely on festival activity cards.
- Why: Current Admin forms accept plain text and `ActivityItem` escapes the stored description as text.
- Scope: activity creation/editing, existing HTML editor integration, safe web display and relevant tests. Excludes participation internal notes, organization page, PR/push and schema change unless proven necessary.
- Constraints: preserve legacy plain text and nulls; allow only supported editor formatting and safe links; do not trust persisted HTML. Follow repository instructions and do not modify the original worktree.
- TDD: not configured explicitly in project/session; ordinary checks, exact runner `bun run test --filter=@frijolmagico/admin` and `bun run test --filter=@frijolmagico/web` (confirm workspace package names). RDD: off (session-rendered). Delivery: ask-on-risk, forecast ~250–400 authored lines, revisit if >400.

## Tasks
- [x] A1 — Integrate existing rich-text editor into create/edit activity forms with controlled form values; verify persisted and reloaded formatting using focused Admin tests. Route: delegated writer (2 non-trivial files). Evidence: 2 focused tests pass, Admin type-check passes, parent reran focused test; editor itself mocked in form tests. Commit: pending.
- [ ] W1 — Render activity description safely with supported HTML and links while preserving plain-text/null behavior; test formatted, unsafe and legacy data. Route: delegated writer (component + tests). Evidence: pending. Commit: pending.

## Acceptance and checks
- Creation/editing persists and reloads bold, italic, lists, links, paragraphs.
- Web output supports those tags and safe URLs but rejects unsafe HTML, event handlers and URL protocols.
- Existing plain text and empty descriptions remain usable; no invalid nested paragraphs.
- Focused workspace tests and applicable full checks recorded per task; no PR until `status:approved`.

## Progress
- A1 complete after correcting RHF/editor remount on activity refresh; focused tests and Admin type-check pass. Next: W1.
