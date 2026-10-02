# Frijol Mágico

Frijol Mágico is a cultural association that brings together illustrators from the Coquimbo Region, Chile. This modern web platform, built as a Turborepo monorepo with Next.js, React, and TypeScript, serves as the digital hub for the Frijol Mágico Festival.

## About the Project

Frijol Mágico is more than just a festival; it's a community that seeks to showcase and empower the work of local illustrators. Through this platform, artists can:

- Stay informed about the latest news and events
- Participate in open calls for the annual festival
- Connect with other illustrators in the region
- Access resources and opportunities from the artistic community

## Tech Stack

This is a **Turborepo** monorepo with the following architecture:

- **Monorepo**: Turborepo + Bun workspaces
- **Frontend Framework**: Next.js 16 (App Router) with Turbopack
- **UI**: React 19, TypeScript (strict), Tailwind CSS v4
- **State**: Zustand
- **Animation**: GSAP with ScrollTrigger
- **Database**: Turso (libSQL) with Drizzle ORM
- **CMS**: Google Sheets via `google-spreadsheet`
- **Package Manager**: Bun

## Project Structure

```
├── apps/
│   ├── web/              # Main website (frijolmagico.cl) - Port 3000
│   └── admin/            # Admin panel - Port 3001
├── packages/
│   ├── database/         # Drizzle ORM + Turso
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/# Shared TS config
│   └── tailwind-config/  # Shared Tailwind config
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json with workspace scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Bun package manager (v1.2.2 or later)
- Turso CLI (only for authorized snapshot pulls or database management) - [Installation guide](https://docs.turso.tech/cli/installation)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/frijolmagico/frijolmagico.git
   cd frijolmagico
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   Copy the example env files and fill in the required values:

   ```bash
   # Root environment
   cp .env.example .env.local

   # App-specific environments (see each app's README for details)
   cp apps/web/.env.example apps/web/.env.local
   cp apps/admin/.env.example apps/admin/.env.local
   cp packages/database/.env.example packages/database/.env.local
   ```

   See each app's README for environment variable details. For remote database migrations, add the selected target's credentials manually to the ignored `packages/database/.env.local`; `bun run migrate:staging` and `bun run migrate:production` load it and select separate Drizzle configs for the same migration directory. Production also requires the exact `TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:<database-name>` confirmation. Direct Drizzle CLI output may include URLs or tokens; do not run with real credentials in shared logs. Pull commands remain `bun --no-env-file run pull:<target>` and do not load this file.

4. **Prepare a local snapshot (optional)**

   Root `bun run dev` uses `packages/database/local.dev.db`; `bun run dev:real` uses `packages/database/local.db`. To refresh either snapshot, stop all app processes first. From `packages/database/`, run the matching pull only after obtaining authorization to read that target: `bun --no-env-file run pull:staging` or, with separate production-read authorization, `bun --no-env-file run pull:production`. See [database setup and privacy guidance](packages/database/README.md). These pulls are explicit; app startup neither syncs snapshots nor reads Turso Cloud. Remote migrations are separate writes: `bun run migrate:staging` and `bun run migrate:production` each require separate authorization. Do not use the old `bun run db:migrate` command; it fails closed.

5. **Run development servers**

   ```bash
   bun run dev       # Uses local.dev.db
   bun run dev:real  # Uses local.db
   ```

   Both commands start the web and admin apps via Turborepo and inject a direct `file:` URL to the selected local SQLite snapshot. They preserve forwarded Turbo filters, for example `bun run dev -- --filter=@frijolmagico/web`. No local Turso database server is started, and neither command automatically refreshes or syncs a snapshot. `dev:real` still accesses only local `local.db`, never a remote database; the admin app can write to that file. Treat it as production data and use it carefully.

   - Web app: http://localhost:3000
   - Admin app: http://localhost:3001

## Available Scripts

### Root Level

```bash
# Development
bun run dev                    # Web + admin against packages/database/local.dev.db
bun run dev:real               # Web + admin against packages/database/local.db (admin can write)

# Build
bun run build                  # Production build (all apps)

# Quality
bun run lint                   # ESLint all apps
bun run lint:fix               # ESLint with auto-fix
bun run type-check             # TypeScript check all packages
bun run format                 # Prettier format

# Database (from packages/database/; remote writes require separate authorization)
bun run pull:staging           # Refresh local.dev.db from staging (authorized read)
bun run pull:production        # Refresh local.db from production (separate authorized read)
bun run migrate:staging        # Remote write to staging only (separate authorization)
bun run migrate:production     # Remote write to production only (new authorization)
# bun run db:migrate fails closed; it does not migrate any target
```

### Per-App Commands

Run these from `apps/web/` or `apps/admin/`:

```bash
bun run dev                    # Next.js dev with Turbopack
bun run build                  # Production build
bun run lint                   # ESLint
bun run lint:fix               # ESLint --fix
bun run type-check             # tsc --noEmit
```

Running an app's `bun run dev` directly from its app directory does not inherit the root script's database URL. Set `TURSO_DATABASE_URL` explicitly to the intended absolute `file:` URL first; without it, database access fails closed.

## Apps & Packages Documentation

For detailed documentation on each app and package, see:

- **[apps/web/README.md](apps/web/README.md)** - Main website documentation
- **[apps/admin/README.md](apps/admin/README.md)** - Admin panel documentation
- **[packages/database/README.md](packages/database/README.md)** - Database/Drizzle ORM documentation

### Agent Conventions

For development conventions and coding standards, see the AGENTS.md files:

- **[AGENTS.md](./AGENTS.md)** - Monorepo-wide conventions
- **[apps/web/AGENTS.md](./apps/web/AGENTS.md)** - Web app architecture
- **[apps/admin/AGENTS.md](./apps/admin/AGENTS.md)** - Admin app architecture
- **[packages/database/AGENTS.md](./packages/database/AGENTS.md)** - Database package

## Development Guidelines

For detailed development conventions and best practices, see **[AGENTS.md](AGENTS.md)**.

### Quick Reference

- **Component Naming**: PascalCase, named exports only
- **Hooks/Stores**: camelCase with `use` prefix
- **Utilities**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Strict TypeScript**: Never disable `strict` or `noImplicitAny`
- **App Router**: Prefer Server Components, mark Client Components with `'use client'`

## Deployment

- **Production URL**: [https://frijolmagico.cl](https://frijolmagico.cl)
- **Platform**: Vercel
- **Database**: Turso Cloud with edge replicas
- **Monorepo**: Turborepo with Remote Caching on Vercel

## Contributing

1. Follow the conventions in [AGENTS.md](AGENTS.md)
2. Run `bun run lint` and `bun run format` before committing
3. Ensure TypeScript checks pass: `bun run type-check`

---

Built with love by [Strocs](https://github.com/Strocs)
