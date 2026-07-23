# Shared Modules

Cross-feature, domain-agnostic. No domain knowledge. Generic only: UI, validation, utilities, types.

## Structure

```
shared/
├── components/       # UI components (shadcn/ui + custom)
├── hooks/            # Reusable custom hooks
├── lib/              # Utilities, infra, configs
├── schemas/          # Zod schemas cross-module
└── types/            # TypeScript types cross-module
```

## Rules

### Facade Pattern
Consumer calls API, never knows impl. Swap libs in shared/ only. Zero feature changes.

### Single Responsibility
One file = one job. No `utils/index.ts` god-object.

### Zero Domain Knowledge
- **NEVER** import from `app/(core)/*`, `app/(auth)/*`, or any feature module
- **NEVER** use domain terms in file names (`artist.`, `event.`, `festival.`)
- Generic names only: `pagination.schema.ts`, `date.utils.ts`, `error.types.ts`

### Open for Extension, Closed for Modification
New variant = new file. Don't edit shared for one feature.

### Interface Segregation
Small focused modules. Split by concern, not convenience.

## What goes in shared

| What | Example |
|---|---|
| UI primitives | `components/ui/button.tsx`, `components/ui/dialog.tsx` |
| Layout components | Navbar, Sidebar, PageShell |
| Reusable hooks | `use-debounce.ts`, `use-media-query.ts` |
| Pure utilities | `date.utils.ts`, `string.utils.ts`, `cn.ts` |
| Cross-module schemas | `pagination.schema.ts`, `pagination.types.ts` |

## What stays OUT of shared

| Do NOT put here | Where it goes |
|---|---|
| Domain mappers | Feature `_lib/` or `adapters/` |
| Domain schemas | Feature `_schemas/` |
| Repositories | Feature `_lib/` |
| Server Actions | Feature `_actions/` |
| Zustand stores | Feature `_store/` |
| Feature config | Feature `_constants/` |
| Code that imports from a feature | That feature's directory |
