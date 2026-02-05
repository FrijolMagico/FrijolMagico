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
- Turso CLI (for database management) - [Installation guide](https://docs.turso.tech/cli/installation)

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

   See each app's README for environment variable details.

4. **Run database migrations**

   ```bash
   bun run db:migrate
   ```

5. **Run development servers**

   ```bash
   bun run dev
   ```

   This starts all apps via Turborepo:
   - Web app: http://localhost:3000
   - Admin app: http://localhost:3001

## Available Scripts

### Root Level

```bash
# Development
bun run dev                    # Start all apps with Turborepo

# Build
bun run build                  # Production build (all apps)

# Quality
bun run lint                   # ESLint all apps
bun run lint:fix               # ESLint with auto-fix
bun run type-check             # TypeScript check all packages
bun run format                 # Prettier format

# Database
bun run db:migrate             # Run pending migrations
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
