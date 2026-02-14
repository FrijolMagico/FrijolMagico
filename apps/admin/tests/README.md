# Testing Architecture

This directory follows a strict **External Test Structure** that mirrors the source code organization.

## Directory Structure

```text

__tests__/
├── e2e/                    # Playwright E2E Tests
│   └── (authenticated)/    # Mirrors src/app/(authenticated)
│       └── (admin)/
│           └── catalogo/
│
├── unit/                   # Vitest/Jest Unit Tests
│   └── shared/             # Mirrors src/shared
│       └── ui-state/
│
└── fixtures/               # Shared Test Fixtures (Page Objects, Auth)

```

## Conventions

### 1. E2E Tests (`e2e/`)

- **Mirror the URL/Route Structure**: Test files should be placed in paths that match the Next.js App Router structure in `src/app`.
- **Naming**: Use `.spec.ts` for Playwright test files.
- **Do NOT Import Components**: Interact with the DOM via locators. Only import types, constants, and helpers.
- **Use Page Objects**: Encapsulate page logic in `fixtures/` or `pages/` (if created) and inject them via `fixtures/admin-test.ts`.

### 2. Unit Tests (`unit/`)

- **Mirror the File Structure**: Test files should match the source file path in `src/`.
- **Naming**: Use `.test.ts` for Unit test files.
- **Import Components/Logic**: Directly import the code you are testing.

### 3. Fixtures (`fixtures/`)

- Contains reusable test setup/teardown logic.
- **admin-test.ts**: The main entry point for E2E tests. Extend this to add custom fixtures (Page Objects, Auth state).

### 4. Utils (`utils/`)

- Helper functions that don't depend on the test runner (e.g., data generators, database seeders).

## Running Tests

```bash
# Run E2E Tests
bun run test:e2e

# Run Unit Tests (if configured)
bun run test:unit
```
