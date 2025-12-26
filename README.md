# Frijol Mágico Cultural Association

Frijol Mágico is a space that brings together illustrators from the Coquimbo Region, creating various opportunities to enhance their work. This modern web platform, built with Next.js, React, and TypeScript, serves as the digital hub for the Frijol Mágico Festival, facilitating communication, open calls, and artist participation in the annual event.

## About the Project

Frijol Mágico is more than just a festival; it's a community that seeks to showcase and empower the work of local illustrators. Through this platform, artists can:

- Stay informed about the latest news and events
- Participate in open calls for the annual festival
- Connect with other illustrators in the region
- Access resources and opportunities from the artistic community

The website serves as a digital meeting point for this community, providing information about the upcoming festival, important dates, and ways to participate.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Bun (preferred) or npm package manager
- Turso CLI (for database management) - [Installation guide](https://docs.turso.tech/cli/installation)
- Geni (for database migrations) - `brew install geni`
- Google Cloud Platform account (for Google Sheets API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/frijolmagico/frijolmagico.git
   cd frijolmagico
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in the required values (see Environment Variables section).

4. **Run database migrations**

   ```bash
   bun run db:migrate
   ```

5. **Run development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Technologies Used

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: React 19 and TypeScript
- **Styling**: Tailwind CSS with custom variants and `tailwind-variants`
- **Database**: Turso (libSQL) for data persistence
- **Migrations**: Geni for database schema management
- **Content Management**: Google Sheets as headless CMS (via `google-spreadsheet`)
- **State Management**: Zustand
- **Animation**: GSAP and ScrollTrigger (via `@gsap/react`)
- **Code Quality**: ESLint and Prettier
- **Package Manager**: Bun (preferred) or npm
- **Additional Libraries**:
  - `clsx` and `tailwind-merge` for conditional styling
  - `react-markdown` for markdown content rendering
  - `next-sitemap` for SEO sitemap generation
  - `lucide-react` for iconography

## Environment Variables

Create a `.env.local` file in the root directory. See `.env.example` for a complete reference.

### Required Variables

```bash
# Turso Database (used by the application)
TURSO_DATABASE_URL=https://your-database-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token
TURSO_DATABASE_NAME=your-database-name

# Google Sheets API Configuration
GOOGLE_API_KEY=your_google_api_key_here
CATALOG_SHEET_ID=your_catalog_sheet_id_here
```

### Development Only (Geni Migrations)

These variables are only needed locally for running database migrations:

```bash
# Geni Migration Tool
DATABASE_URL=https://your-database-org.turso.io  # Same as TURSO_DATABASE_URL
DATABASE_TOKEN=your-auth-token                    # Same as TURSO_AUTH_TOKEN
DATABASE_MIGRATIONS_FOLDER=./db/migrations
```

**Note**: In development mode, you can use a local SQLite database or connect to Turso directly.

## Project Structure

```
src/
├── app/              # Next.js app directory with App Router
│   ├── (home)/       # Home page and its components
│   ├── (sections)/   # Main sections (catalogo, festivales, convocatoria, etc.)
│   │   └── */store/  # Section-specific Zustand stores
│   └── layout.tsx    # Root layout
├── components/       # Shared UI components (Header, Footer, Grid, etc.)
│   └── ui/           # UI primitives (Button, Pagination, etc.)
├── config/           # App configuration (paths, etc.)
├── data/             # Static site data (site.json, etc.)
├── infra/            # Infrastructure (database adapters, importers)
├── schemas/          # Zod schemas for data validation
├── services/         # Data fetching and integration (Google Sheets, etc.)
├── styles/           # Global and section-specific styles
│   └── palettes/     # Color palette system
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

db/
├── migrations/       # Database migrations (Geni)
└── seed/             # Seed data

public/
├── fonts/            # Local fonts
├── images/           # Shared images
└── sections/         # Section-specific images and assets
```

## Scripts

### Development

- `bun run dev`: Start development server with Turbopack
- `bun run build`: Create production build
- `bun run start`: Start production server
- `bun run lint`: Run ESLint for code quality

### Database

- `bun run db:migrate`: Run pending migrations
- `bun run db:rollback`: Rollback last migration
- `bun run db:status`: Show pending migrations
- `bun run db:new <name>`: Create new migration (e.g., `bun run db:new add_sponsors_table`)
- `bun run db:seed`: Seed database with initial data
- `bun run db:import`: Import data from Google Sheets to Turso

## Database

The application uses a multi-layer data management system with Turso as the primary database.

### Data Flow

```
Google Sheets (CMS) → db:import → Turso (Database) → Application
```

1. **Google Sheets**: Acts as an easy-to-use CMS for content editors to manage artist data, events, and other content.
2. **Import Process**: The `db:import` command synchronizes data from Google Sheets to the Turso database.
3. **Turso Database**: Serves as the primary data store for the application, providing fast queries and reliable data persistence.
4. **Application**: Reads data directly from Turso for rendering pages.

### Turso (libSQL)

The project uses [Turso](https://turso.tech), a SQLite-compatible database optimized for edge deployments. It provides:

- Low-latency reads with edge replicas
- SQLite compatibility
- Simple authentication with tokens

### Migrations with Geni

[Geni](https://github.com/emilpriver/geni) is a standalone migration tool that manages database schema changes.

#### Creating a New Migration

```bash
# Generate migration files
bun run db:new add_new_feature

# This creates:
# db/migrations/20251226123456_add_new_feature.up.sql   (changes to apply)
# db/migrations/20251226123456_add_new_feature.down.sql (rollback)
```

#### Applying Migrations

```bash
# Check pending migrations
bun run db:status

# Apply all pending migrations
bun run db:migrate

# Rollback last migration
bun run db:rollback
```

#### Migration Best Practices

- Use `IF NOT EXISTS` / `IF EXISTS` for idempotent migrations
- One logical change per migration
- Always write the `.down.sql` rollback (even if SQLite has limitations)
- Use descriptive names: `add_website_to_artista`, `create_sponsors_table`

### Local Development

#### Option 1: Turso Dev Server (Recommended)

```bash
# Start local libSQL server
turso dev

# Your app connects to:
# DATABASE_URL="http://127.0.0.1:8080"
```

#### Option 2: SQLite File

```bash
# Create a dump from remote database
turso db shell $TURSO_DATABASE_NAME .dump > db/dump.sql

# Create local SQLite file
cat db/dump.sql | sqlite3 db/local.db

# Your app connects to:
# DATABASE_URL="file:db/local.db"
```

#### Option 3: Remote Database

Connect directly to Turso Cloud during development (simplest, but consumes quota).

## Advanced Styling Features

### Flexible Color Palette System

- **Dynamic Theming**: Uses `[data-palette]` attributes for context-specific styling
- **CSS-in-Tailwind**: Custom CSS themes defined in `@theme` blocks
- **Flexible Tokens**: Color tokens that can be overridden per section/component
- **Festival-Specific Palettes**: Dedicated color schemes for different festival years

### Custom Animations

- **Card Slides**: Infinite scrolling animations for promotional content
- **Soft Bounce**: Subtle hover effects and micro-interactions
- **Keyframe System**: Custom CSS animations integrated with Tailwind
- **Accessibility**: Respects `prefers-reduced-motion` for accessibility

### Responsive Design

- **Mobile-First**: Progressive enhancement from mobile to desktop
- **Custom Breakpoints**: Tailored breakpoints for optimal viewing experience
- **Grid System**: Flexible grid components for complex layouts

## Deployment

- **Production URL**: [https://frijolmagico.cl](https://frijolmagico.cl)
- **Platform**: Optimized for Vercel deployment
- **Database**: Turso Cloud with edge replicas
- **SEO**: Automatic sitemap generation via `next-sitemap`
- **Performance**: Static generation with dynamic data fetching
- **Environment Handling**: Automatic environment detection and configuration

## Development Guidelines

### Component Conventions

- **Naming**: PascalCase for components; section-specific components in dedicated folders
- **Structure**: Co-locate components with their styles, types, and tests
- **Composition**: Prefer composition over inheritance; use compound components pattern

### TypeScript Standards

- **Strict Typing**: All code is strongly typed with strict TypeScript configuration
- **Type Organization**: Types in `src/types/` for global types, section-specific types in respective folders
- **Interface Naming**: Use descriptive interface names with proper suffixes (Props, State, Config)

### Styling Guidelines

- **Tailwind CSS**: Primary styling solution with custom variants and extensions
- **Class Composition**: Use `clsx` and `tailwind-merge` for conditional and merged classes
- **Component Variants**: Leverage `class-variance-authority` for component API design
- **Custom CSS**: Minimal custom CSS; prefer Tailwind utilities and custom theme tokens

### State Management

- **Zustand**: Preferred for client-side state management
- **Local State**: Use React's built-in state for component-specific data
- **URL State**: Sync filters and navigation state with URL parameters
- **Server State**: Fetch data at build time when possible; use dynamic fetching sparingly

### Data Fetching

- **Static Generation**: Preferred approach for most content
- **Database Queries**: Direct queries to Turso for dynamic data
- **Error Boundaries**: Implement proper error handling and user feedback
- **Loading States**: Provide skeleton loaders and loading indicators

### Accessibility

- **Semantic HTML**: Use proper HTML elements and structure
- **ARIA Labels**: Provide meaningful labels for screen readers
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Image Alt Text**: Descriptive alt text for all images and graphics
- **Motion Preferences**: Respect user preferences for reduced motion

### Performance

- **Image Optimization**: Use Next.js `<Image />` component for all images
- **Code Splitting**: Leverage Next.js automatic code splitting
- **Bundle Analysis**: Monitor bundle size and optimize imports
- **Core Web Vitals**: Maintain excellent performance scores

### File Organization

- **Images**: Store in `public/sections/` for section-specific assets
- **Fonts**: Local fonts in `public/fonts/` with proper loading strategies
- **Icons**: Use `lucide-react` for consistent iconography
- **Data**: Static data in `src/data/`, dynamic data via services

---

Built with love by [Strocs](https://github.com/Strocs)
