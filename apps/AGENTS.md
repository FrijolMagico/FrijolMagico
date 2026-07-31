# App Shared Rules (web + admin)

Rules that apply to both Next.js apps. Packages ignore these.

## App Router Only
- **NEVER** Pages Router. App Router only.

## Naming
- **Route folder names** = Spanish (`catalogo/`, `festivales/`, `artistas/`)
- **Everything else** = English (files, sub-folders, identifiers)

## Components
- **Server-first.** `'use client'` = exception.
- **Atomize** `'use client'` per element. Never wrap parent for interactivity.
- **Client state:** Zustand stores. Never lift `'use client'` for state.
- **Named exports.** Exception: `page.tsx`, `layout.tsx` only.

## Server Actions
- **`'use server'` + `server-only`** package required for all Server Actions.

## Language
- **UI** = Spanish
- **Code** = English

## Vercel
- **Functions:** Stateless, ephemeral. No durable state.
- **Edge Functions:** Deprecated. Use Vercel Functions.
- **KV/Postgres:** Discontinued. Use Marketplace Redis/Postgres.
- **Secrets:** Vercel Env. See Security in root AGENTS.md for `NEXT_PUBLIC_*`.
- **`waitUntil`:** Post-response. Not `context` param.
- **Region:** Near data. No cross-region.
- **Runtime Cache:** Regional cache + tag invalidation. NOT global KV.
- **AI Gateway:** `AI_GATEWAY_KEY`. Query models endpoint first.
- **Workflow + Sandbox:** Durable loops + untrusted code. Vercel MCP for infra.
