# Edition Activity Registration Specification

## Purpose

Define optional, time-bounded external registration for eligible festival-edition activities across database, admin, public data, and public activity-card behavior. This change applies only to the edition participation activity domain and excludes music activities and catalog/artist surfaces.

## Requirements

### Requirement: Registration database invariants

The system MUST represent registration as zero or one complete `activity_registration` row per participation activity. The row MUST use a required, unique `participation_activity_id` reference to `participacion_actividad` with cascade deletion, and MUST contain a URL, `start_at`, and `end_at`. Stored instants MUST be canonical UTC values. Registration URLs MUST use HTTPS, and `end_at` MUST be strictly later than `start_at`. The database and server-side domain controls MUST independently enforce applicable invariants, with database checks or triggers used where reliably supported.

#### Scenario: Valid registration has one complete row

- GIVEN an eligible participation activity
- WHEN a complete HTTPS URL and valid UTC start and end instants are persisted
- THEN exactly one registration row MAY be associated with that activity
- AND the row contains all required values

#### Scenario: Invalid registration is rejected

- GIVEN a registration submission with a non-HTTPS URL, missing field, equal boundary, or end before start
- WHEN the system validates or persists it
- THEN the operation MUST be rejected
- AND no invalid registration row MUST be committed

#### Scenario: Activity deletion cascades registration

- GIVEN a participation activity with a registration row
- WHEN the participation activity is deleted
- THEN its registration row MUST be deleted by the relationship

### Requirement: Authoritative admin configuration

The admin MUST allow an optional complete registration configuration for eligible, non-music edition participation activities. It MUST hide registration inputs for music as presentation, while server actions MUST remain authoritative. A submission MUST be interpreted as absent configuration, or one complete configuration; partial configuration MUST be rejected. The system MUST create, update, or delete the optional row accordingly and MUST reject registration configuration for music activities.

#### Scenario: Eligible activity saves registration

- GIVEN an eligible non-music activity
- WHEN an administrator submits a complete valid registration configuration
- THEN the server MUST persist the configuration for that activity

#### Scenario: Absent configuration clears registration

- GIVEN an eligible activity with an existing registration row
- WHEN an administrator submits no registration configuration
- THEN the registration row MUST be deleted

#### Scenario: Music configuration is rejected server-side

- GIVEN an activity whose authoritative type is music
- WHEN an administrator submits registration values, regardless of client visibility
- THEN the server MUST reject the configuration
- AND MUST NOT persist a registration row

### Requirement: Chile timezone conversion

The admin MUST accept local date and time values in `America/Santiago` and resolve them with timezone-aware rules to canonical UTC instants before persistence. The system MUST account for Chilean offset and daylight-saving transitions, and MUST reject invalid local input and ambiguous or nonexistent local instants that cannot be safely resolved. The persisted interval MUST remain strictly ordered after conversion.

#### Scenario: Local values are converted to UTC

- GIVEN valid Chile-local start and end date-time values
- WHEN an administrator saves the configuration
- THEN the server MUST resolve each value using `America/Santiago`
- AND MUST persist the corresponding UTC instants rather than a fixed-offset approximation

#### Scenario: Unsafe daylight-saving input is rejected

- GIVEN a local date-time that is nonexistent or ambiguously resolvable during a timezone transition
- WHEN the administrator submits it
- THEN validation MUST fail
- AND no registration change MUST be committed

### Requirement: Atomic aggregate mutation and music clearing

A save operation that changes participation activity data, activity details, activity type, or registration MUST have one server-side transaction boundary for those related changes. If an eligible activity changes to music, any existing registration row MUST be deleted in the same transaction. A failure in any participating mutation MUST roll back all mutations belonging to that save operation.

#### Scenario: Eligible-to-music change clears registration atomically

- GIVEN an eligible activity with registration
- WHEN its type is changed to music and the aggregate save succeeds
- THEN the type change and registration deletion MUST commit together
- AND no registration row MUST remain

#### Scenario: Aggregate failure rolls back registration and activity changes

- GIVEN an aggregate save that would change activity data and registration
- WHEN a participating mutation fails
- THEN all mutations in that save operation MUST be rolled back
- AND the prior coherent state MUST remain

### Requirement: Public registration data flow

The festival edition detail query MUST left join `activity_registration` through the participation activity and MUST propagate optional URL, start, and end instants through repository mapping, DTOs, and public festival activity types. The query MUST NOT filter rows by current time, and the browser MUST NOT require a database request to evaluate visibility. Serialized public data MAY contain a configured URL outside its active window. Music activities MUST remain represented by `MusicActivityItem` and MUST not expose registration data as registration UI.

#### Scenario: Configured data reaches a non-music activity card

- GIVEN an edition activity with a registration row
- WHEN the public festival detail is loaded
- THEN its optional registration URL and canonical boundaries MUST be available to the non-music activity-card path

#### Scenario: Missing registration remains valid

- GIVEN an edition activity without a registration row
- WHEN the public festival detail is loaded
- THEN the activity MUST remain renderable with absent registration fields

#### Scenario: Music remains excluded

- GIVEN a music activity with no registration configuration
- WHEN the public festival detail is mapped and rendered
- THEN it MUST use the music activity path
- AND MUST NOT render registration UI

### Requirement: Client-only visibility lifecycle

The public festival edition `ActivityItem` MUST render no registration badge or CTA in initial server output. After hydration, it MUST consider a registration active exactly when `now >= start_at && now <= end_at`. While active, it MUST show an `Inscríbete` badge in the card's top-right, including when native details are collapsed. When expanded content exists, it MUST show an `Inscríbete Aquí` link at the bottom of that expanded content, not in summary or collapsed-only markup. The client MUST recompute at the next start or end boundary and after window-focus and document-visibility changes. It MUST NOT poll or depend on background scheduling infrastructure.

#### Scenario: Initial output is hidden

- GIVEN a configured registration window
- WHEN the activity card is rendered before hydration
- THEN neither the badge nor CTA MUST be present in the server output

#### Scenario: Inclusive boundaries show registration

- GIVEN a configured registration window
- WHEN the hydrated client time equals the start or end instant
- THEN the `Inscríbete` badge MUST be visible
- AND the expanded `Inscríbete Aquí` link MUST be visible when expanded content exists

#### Scenario: Outside the window hides registration

- GIVEN a configured registration window
- WHEN the hydrated client time is before start or after end
- THEN neither registration affordance MUST be visible

#### Scenario: Lifecycle reconciliation updates visibility

- GIVEN an already-open page whose loaded registration window crosses a boundary or whose document regains focus or visibility
- WHEN the corresponding local timer or lifecycle event occurs
- THEN the card MUST recompute registration visibility without polling

### Requirement: Accessible external-link semantics

The active CTA MUST be a semantic link with the exact Spanish label `Inscríbete Aquí`, a usable keyboard focus state, and an accessible name that remains meaningful without visual context. It MUST open the HTTPS destination in a new tab and MUST include safe external-link `rel` attributes. The badge MUST use the exact Spanish label `Inscríbete` and MUST not be the only interactive mechanism when the expanded CTA is applicable.

#### Scenario: Active CTA exposes safe link semantics

- GIVEN an active non-music activity with expanded content
- WHEN a user navigates to the CTA by keyboard or assistive technology
- THEN it MUST be announced as an `Inscríbete Aquí` link
- AND activating it MUST open the configured HTTPS destination in a new tab with safe `rel` attributes

#### Scenario: CTA placement preserves native details semantics

- GIVEN a non-music activity rendered with native expandable details
- WHEN the details are collapsed
- THEN the badge MAY remain visible in the card
- AND the CTA MUST NOT appear in the summary or collapsed-only markup

### Requirement: Cache invalidation and temporal behavior

Registration-related admin saves MUST use the existing save-time cache invalidation mechanism and MUST invalidate the public festival edition detail tags required for subsequent public requests to observe changes. Public visibility during a loaded window MUST be determined by client time and lifecycle reconciliation, not cache expiration. The system MUST NOT add time-based cache invalidation, polling, cron, queues, TTL infrastructure, or workers for this feature. Already-open tabs MUST NOT be required to receive later admin edits in real time.

#### Scenario: Save invalidates public edition data

- GIVEN an administrator creates, updates, or clears registration
- WHEN the aggregate save commits
- THEN the relevant existing and public festival edition detail cache tags MUST be invalidated
- AND a later public request MUST be able to observe the saved configuration

#### Scenario: Window passage does not require cache expiry

- GIVEN a cached public response containing canonical registration boundaries
- WHEN the visitor's current time crosses a boundary
- THEN the hydrated client MUST update visibility locally
- AND no database request or cache revalidation MUST be required solely because time crossed the boundary

### Requirement: Scope and non-goals

The change MUST be limited to the edition-to-participation-to-activity-to-activity-type domain. It MUST NOT change catalog or artist data, queries, cards, or CTAs; redesign the generalized activity card; add analytics or click tracking; check remote URL reachability; introduce realtime propagation to open tabs; or add unrequested URL/window indexes. Changes to `MusicActivityItem` MUST be limited to regression protection confirming registration remains absent.

#### Scenario: Out-of-scope surfaces remain unchanged

- GIVEN a catalog or artist surface, or a music activity card
- WHEN the edition activity registration feature is exercised
- THEN that surface MUST not gain registration configuration or registration UI

#### Scenario: No reachability or scheduling dependency is introduced

- GIVEN a valid HTTPS registration destination and an active or inactive window
- WHEN the configuration is saved or displayed
- THEN the system MUST not require remote URL reachability
- AND MUST not require cron, queue, worker, polling, or time-based cache infrastructure
