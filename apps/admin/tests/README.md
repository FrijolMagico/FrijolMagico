# Testing Architecture

This directory follows a strict **External Test Structure** that mirrors the source code organization.

## Directory Structure

```text

__tests__/
├── unit/                   # Vitest/Jest Unit Tests
│   └── shared/             # Mirrors src/shared
│       └── ui-state/

```

## Conventions

### 2. Unit Tests (`unit/`)

- **Mirror the File Structure**: Test files should match the source file path in `src/`.
- **Naming**: Use `.test.ts` for Unit test files.
- **Import Components/Logic**: Directly import the code you are testing.

## Running Tests

```bash
# Run Unit Tests (if configured)
bun test
```
