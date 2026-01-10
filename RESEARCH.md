# Research — Information Architecture references for Frijol Mágico

## Goal

Provide information-architecture (IA) references and patterns for Frijol Mágico’s website evolution into an **institutional hub** with a **flagship annual festival**, a **festival archive by edition**, and an **artist catalog/directory** with cross-edition participation history.

This document intentionally focuses on **navigation, content taxonomy, and URL/routing patterns** (not visual design).

## Working assumptions (from project context)

- Frijol Mágico is an association with multiple programs/events (workshops, school activities, etc.) and an annual flagship: **Festival Frijol Mágico**.
- The site must support:
  - Current/next festival promotion (top priority)
  - **Artist catalog** with opt‑in profiles (second priority)
  - Archiving festival editions (posters/identity, program, selected artists)
  - Calls/convocatorias
  - News/press/sponsors
- Primary language: Spanish; bilingual later possible.
- Content pipeline remains: Google Sheets → import → Turso (libSQL).

## Current site IA (as implemented today)

- `src/app/(home)/page.tsx` — Home as card grid.
- `src/app/(sections)/catalogo/page.tsx` — `/catalogo` artist listing + filters.
- `src/app/(sections)/festivales/page.tsx` — `/festivales` timeline/history.
- `src/app/(sections)/festivales/(edicion)/2025/...` — `/festivales/2025` edition area, including `/programacion` and category pages.
- `src/app/(sections)/convocatoria/page.tsx` — `/convocatoria` exists but currently redirects to home.

Implication: the codebase already supports the key grouping concept **“festival edition as a route segment”** and a general **catalog** section.

---

## Reference set (IA patterns)

### 1) Festival / Fundación Chilemonos

**Why it’s relevant**: clear separation between **festival** identity and **foundation/programs** umbrella; supports **editions**, **calls**, **winners/selected**, and bilingual navigation.

**IA patterns observed**

- **Two layers**:
  - “Festival site” (public-facing edition programming, competitors/selected)
  - “Foundation site” (institutional umbrella + year-round programs)
- Festival content commonly grouped into:
  - Program / Agenda
  - Activities
  - Competencias / Selección / Ganadores
  - Industry/Professional area
  - News
  - About / Team / Sponsors

**Takeaways for Frijol Mágico**

- If the association grows, it can be beneficial to separate:
  - **Asociación** (year-round programs) vs **Festival** (edition-centric)
- Even if kept on one domain, navigation can reflect two modes:
  - “Festival (2026)” vs “Archivo” vs “Asociación”.

### 2) Fundación Teatro a Mil (GAM / festival ecosystem)

**Why it’s relevant**: best-in-class example of an institution that runs multiple programs and also provides a **historical catalog**.

**IA patterns observed**

- **Programs** as first-class navigation, not hidden under “About”.
- **Archive** is treated as a user-facing product:
  - A dedicated “Catálogo Histórico” section.
- Typical taxonomy includes:
  - Programación (current)
  - Archivos / Catálogo Histórico
  - Educación / Formación
  - Convocatorias
  - Noticias / Prensa

**Takeaways for Frijol Mágico**

- Make “Archivo” explicit, not a footer link.
- The archive can be searchable and structured by:
  - Edición/año
  - Actividad / tipo
  - Artista/compañía (people/participants)

### 3) Bienal de Artes Mediales (edition site)

**Why it’s relevant**: edition-centric structure with strong segmentation for program, works, participants.

**IA patterns observed**

- Edition site often organizes around:
  - Programa / Calendario
  - Obras / Proyectos
  - Artistas / Participantes
  - Sedes
  - Noticias
  - Información práctica

**Takeaways for Frijol Mágico**

- For each festival edition, the key IA objects are typically:
  - Program items (events)
  - Participants/artists
  - Venues
  - Editorial content (news/blog)

### 4) CChV (corporation / umbrella)

**Why it’s relevant**: strong example of an **umbrella org** listing multiple programs and showing “agenda + news + initiatives” patterns.

**IA patterns observed**

- “Agenda” as a persistent entrypoint.
- “Projects/Programs” list (each becomes its own landing page).

**Takeaways for Frijol Mágico**

- A “Programas” index page can scale beyond festival.
- A single cross-site “Agenda” reduces fragmentation.

### 5) MNBA (museum)

**Why it’s relevant**: demonstrates how an institution handles “what’s on now” + “archives/collections” simultaneously.

**IA patterns observed**

- “Cartelera/Actual” (current programming) is top-level.
- Separate “Colecciones/Archivo” areas.

**Takeaways for Frijol Mágico**

- Mirror the mental model:
  - “Ahora” (current festival + upcoming events)
  - “Archivo” (past editions)
  - “Catálogo” (artists)

### 6) Museo de la Memoria (MMDH)

**Why it’s relevant**: mixes events with a sizable catalog (audiovisual/collections), showing how “catalog” and “events” can co-exist.

**IA patterns observed**

- “Actividades” vs “Colecciones/Recursos” split.
- Search and filtering as primary UX.

**Takeaways for Frijol Mágico**

- Keep “Catálogo” distinct from “Archivo de ediciones”, but cross-link both.

### 7) Fundación CorpArtes

**Why it’s relevant**: institutional programming + education + news; shows how to keep “programming entries” and “resources” in parallel.

**IA patterns observed**

- Primary nav often includes:
  - Programación
  - Educación
  - Fundación
  - Noticias

**Takeaways for Frijol Mágico**

- “Educación/Formación” can be a program family under “Programas”, not necessarily a separate site.

---

## IA patterns that map well to Frijol Mágico

### Pattern A — Dual-mode navigation: “Now / Archive / Directory”

Top-level navigation that consistently answers:

- **What’s happening now?** (festival current edition + upcoming activities)
- **What has happened before?** (festival archive by edition + standout content)
- **Who participates?** (artist directory + participation history)

Proposed top-level labels (Spanish):

- `Festival` (defaults to current edition landing)
- `Archivo` (festival editions index)
- `Catálogo` (artists directory)
- `Programas` (year-round initiatives beyond the festival)
- `Agenda` (optional: unified calendar across festival + programs)
- `Asociación` (about, mission, team, partners)
- `Noticias` / `Prensa`
- `Convocatorias`

### Pattern B — Edition as a subtree with stable subpages

A stable “edition information architecture” that’s consistent year to year.

Recommended edition subtree:

- `/festival/{year}` — edition home/overview
- `/festival/{year}/programacion` — schedule/program
- `/festival/{year}/artistas` — participants for that edition (selected/guests)
- `/festival/{year}/seleccion` or `/festival/{year}/convocatoria` — call results
- `/festival/{year}/sedes` — venues and maps (if relevant)
- `/festival/{year}/galeria` — media
- `/festival/{year}/aliados` — sponsors/partners
- `/festival/{year}/equipo` — team (optional)

### Pattern C — Artist as a canonical entity, linked to editions

Instead of duplicating “selected artists per edition” pages without a canonical profile, treat the artist as the main node.

Recommended:

- `/catalogo/{artistSlug}` — canonical artist profile
- On profile: “Participaciones” timeline → links to `/festival/{year}` and optionally to program items.

Optional reverse links:

- On edition artists list: filters by discipline/category, each item links to the canonical artist profile.

### Pattern D — Programs as first-class objects (beyond festival)

If the association runs multiple recurring activity lines (workshops, school programs, etc.), model these as “programs” with landing pages.

Recommended:

- `/programas` — index
- `/programas/{programSlug}` — program landing
- `/programas/{programSlug}/archivo` — optional

### Pattern E — Calls/convocatorias have a lifecycle

Calls behave like products with phases.

Recommended:

- `/convocatorias` — list
- `/convocatorias/{slug}` — call detail (bases, dates, requirements)
- `/convocatorias/{slug}/resultados` — outcomes

For festival-specific calls:

- `/festival/{year}/convocatoria` can link/canonicalize to `/convocatorias/{festival-year}`.

---

## Suggested route taxonomy (conceptual)

These are conceptual; they can still map to Next.js route groups later.

### Minimal IA (fits current site direction)

- `/` — home
- `/festival` → redirects to current edition
- `/festival/{year}` — edition
- `/archivo` — list of editions
- `/catalogo` — artists list
- `/catalogo/{artistSlug}` — artist profile
- `/convocatorias` — list
- `/asociacion` — umbrella about
- `/noticias` — news

### Expanded IA (scales with more programs)

- `/agenda` — unified calendar
- `/programas` + `/programas/{programSlug}`
- `/prensa` — press kit (optional)
- `/aliados` — sponsors/partners (optional)

---

## Open questions to resolve before final IA

- Should “Festival” be a **section** (`/festival`) or keep current `/festivales` naming?
  - Recommendation: choose one canonical form and redirect the other.
- How should “catalog of artists” relate to “selected artists by edition/category”?
  - Recommendation: canonicalize on `/catalogo/{artistSlug}` and treat edition pages as curated views.
- What is the “unit” of programmatic content?
  - Just festival edition pages + static copy, OR fully modeled “events” with dates/venues?
- Bilingual: do we foresee Spanish-first with optional English pages later?
  - If yes, consider route prefix strategy early (`/en/...`) or i18n configuration.

---

## Next steps (recommended)

1. Add 6–12 more references (Chile/LatAm first): cultural associations + festivals with edition archives and participant lists.
2. Decide on 1 of 2 IA directions:
   - “Festival-first with institutional layer” (simpler)
   - “Institution-first with flagship festival” (scales best)
3. Translate the chosen taxonomy into:
   - CMS/DB entities (edition, artist, program, event, call)
   - Next.js routes and navigation components
