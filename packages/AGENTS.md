# Packages

Shared libraries consumed by apps and other packages.

## Adding a New Package

1. **Create directory** under `packages/<name>/` with `package.json`, `tsconfig.json`, `src/`
2. **Name scope:** `@frijolmagico/<kebab-case-name>`
3. **package.json:** Use `"workspace:*"` for internal deps, `"private": true`
4. **Update root `AGENTS.md`** — add the package to `Monorepo Structure > Packages` with one-line purpose
5. **Create `packages/<name>/AGENTS.md`** if non-trivial — document exports, commands, and conventions

## Export Rules

- **Named exports only.** No default exports.
- **Sub-path exports** via `package.json` `"exports"` field (e.g. `"./orm": "./src/orm.ts"`)
- **TypeScript strict.** Follow `@frijolmagico/typescript-config`.

## Conventions

- **Scope:** `@frijolmagico/<name>` in dependencies. Never `../` relative paths.
- **Imports:** Follow root conventions, dropping app-specific tiers (React/Next, `@/`).
