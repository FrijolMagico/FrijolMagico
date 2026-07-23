# Utils Package

Pure utility functions. No side effects. No infra dependencies.

## Exports

Import as `@frijolmagico/utils/<name>`:

| Export | File | Purpose |
|---|---|---|
| `cn` | `cn.ts` | Conditional Tailwind class merging |
| `css` | `css.ts` | CSS utility helpers |
| `string` | `string.ts` | String manipulation |
| `url` | `url.ts` | URL formatting and parsing |
| `rrss` | `rrss.ts` | Social media URL handling |
| `version` | `version.ts` | Version comparison and semver |
| `cdn` | `cdn.ts` | CDN URL builder |
| `shallow-diff` | `shallow-diff.ts` | Shallow object diff |

## Conventions

- **Pure functions only.** No classes, no side effects, no `process.env`.
- **No `@frijolmagico/*` deps.** Zero workspace imports.
- **Tree-shakeable.** Each export is its own file. Import only what you need.
- **Tests co-located.** `*.test.ts` next to source (e.g. `version.test.ts`).
