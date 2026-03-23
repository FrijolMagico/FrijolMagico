# Skill Registry

Project: FrijolMagico admin (`apps/admin`)
Generated: 2026-03-23
Purpose: Resolved skill and convention registry for sub-agent launches in this app.

## Active Persistence
- Preferred SDD artifact store: `engram`
- Note: `.atl/skill-registry.md` is infrastructure and is written regardless of SDD mode.
- Existing legacy file-based SDD artifacts were detected under `openspec/` and left untouched.

## Resolved Skills

### Project-Level Skills
| Skill | Path | Scope | Trigger Summary |
| --- | --- | --- | --- |
| `better-auth-best-practices` | `/home/strocs/dev/FrijolMagico/apps/admin/.opencode/skills/better-auth-best-practices/SKILL.md` | app | Better Auth integration and auth architecture |
| `frontend-design` | `/home/strocs/dev/FrijolMagico/.opencode/skills/frontend-design/SKILL.md` | workspace | High-quality UI/page/component design work |
| `next-best-practices` | `/home/strocs/dev/FrijolMagico/.opencode/skills/next-best-practices/SKILL.md` | workspace | Next.js App Router, RSC boundaries, routing, data patterns |
| `vercel-composition-patterns` | `/home/strocs/dev/FrijolMagico/.opencode/skills/vercel-composition-patterns/SKILL.md` | workspace | Compound components, render props, scalable React APIs |
| `vercel-react-best-practices` | `/home/strocs/dev/FrijolMagico/.opencode/skills/vercel-react-best-practices/SKILL.md` | workspace | React/Next.js performance and rendering patterns |
| `web-design-guidelines` | `/home/strocs/dev/FrijolMagico/.opencode/skills/web-design-guidelines/SKILL.md` | workspace | UI/UX/accessibility review against web guidelines |

### User-Level Skills
| Skill | Path | Scope | Trigger Summary |
| --- | --- | --- | --- |
| `go-testing` | `/home/strocs/.config/opencode/skills/go-testing/SKILL.md` | user | Go and Bubbletea testing workflows |
| `playwright` | `/home/strocs/.config/opencode/skills/playwright/SKILL.md` | user | Playwright E2E testing patterns |
| `react-19` | `/home/strocs/.config/opencode/skills/react-19/SKILL.md` | user | React 19 + React Compiler component patterns |
| `router` | `/home/strocs/.config/opencode/skills/router/SKILL.md` | user | Delegation and sub-agent routing decisions |
| `skill-creator` | `/home/strocs/.config/opencode/skills/skill-creator/SKILL.md` | user | Creating new agent skills |
| `tailwind-4` | `/home/strocs/.config/opencode/skills/tailwind-4/SKILL.md` | user | Tailwind CSS v4 styling conventions |
| `typescript` | `/home/strocs/.config/opencode/skills/typescript/SKILL.md` | user | Strict TypeScript patterns |
| `zod-4` | `/home/strocs/.config/opencode/skills/zod-4/SKILL.md` | user | Zod 4 validation patterns |
| `zustand-5` | `/home/strocs/.config/opencode/skills/zustand-5/SKILL.md` | user | Zustand 5 state management patterns |

## Convention Files

### Primary App Conventions
- `AGENTS.md` — admin app structure, route groups, DAL pattern, auth rules, validation guidance, testing commands

### Referenced / Inherited Conventions
- `/home/strocs/dev/FrijolMagico/AGENTS.md` — monorepo structure, workspace packages, root scripts, shared coding rules
- `/home/strocs/dev/FrijolMagico/packages/database/AGENTS.md` — Drizzle/Turso package structure and migration rules
- `/home/strocs/.config/opencode/AGENTS.md` — global agent behavior, delegation rules, memory protocol

### Referenced But Missing
- `shared/AGENTS.md` — referenced by `apps/admin/AGENTS.md`, not present at initialization time

## Launch Guidance
- For Next.js route or data-flow work, load: `next-best-practices`, `react-19`, `typescript`
- For auth work, also load: `better-auth-best-practices`
- For styling/UI work, also load: `tailwind-4`; add `frontend-design` for new UI creation and `web-design-guidelines` for audits
- For client state work, also load: `zustand-5`
- For schema validation work, also load: `zod-4`
- For component API refactors, also load: `vercel-composition-patterns`
- For performance-oriented React/Next work, also load: `vercel-react-best-practices`

## Initialization Notes
- `openspec/changes/migrate-ediciones-architecture/` already exists with `proposal.md`, `spec.md`, and `design.md`
- Because this init uses `engram`, no `openspec` files were created or modified
- Use topic key `sdd-init/FrijolMagico` for project context recovery