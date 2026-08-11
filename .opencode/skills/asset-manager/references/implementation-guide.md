# Asset Manager — Consumer Integration Guide

This guide explains how to integrate a new entity with the assets-manager module (`apps/admin/src/shared/assets-manager/`). It covers the public API only: what exists, why, and how to use it. You do not need to understand internal implementation details.

## 1. Domain model

The module manages the full lifecycle of a user-uploaded file:

```
prepare -> enqueue -> upload -> persist -> cleanup
```

- **prepare**: validate and optimize the source file (output is always WebP).
- **enqueue**: create a queue job bound to one entity.
- **upload**: send the optimized blob to your storage endpoint.
- **persist**: write the managed reference into your domain, authorized by a signed receipt.
- **cleanup / discard**: compensate failed or cancelled flows (e.g. delete an already-uploaded object).

**Division of responsibility**

- The module owns: optimization, queueing, retries, progress, cancellation, receipts, storage transport.
- The consumer owns: what the asset means, its dimension policy, its domain reference, its conflict rules.

The final artifact is a `ManagedAssetReference { path: string | null, version: string | null }`. Your domain stores this reference and uses it to point at the asset.

## 2. Public API surface

### Contracts (`client/contracts.ts`)

| API                                                                  | Purpose                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ASSET_TARGET`                                                       | Registry of asset kinds. **Add your target here.**                                         |
| `PreparedAsset { blob, width, height, mimeType, extension? }`        | Optimized output of preparation.                                                           |
| `LocalPreviewHandle { url, release }`                                | Object-URL preview; the module releases it for you at terminal states.                     |
| `ResizeSpec { resolve(image), invalidDimensionsMessage?, quality? }` | Your dimension policy for preparation.                                                     |
| `ManagedAssetReference { path, version }`                            | The persisted reference your domain stores (`hasValidManagedAssetReference` validates it). |

### Preparation (`client/preparation.ts`)

| API                                      | Purpose                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `createPreparationController(codec)`     | Prepares files with cancellation. `prepare({ target, source, resize, onPhase? })`, `cancel()`. |
| `AssetSource { name, type, size, blob }` | What you hand to preparation (typically a `File`).                                             |
| `AssetCodec`                             | Decode/encode abstraction; default browser implementation: `createBrowserImageCodec()`.        |

### Runtime (`client/asset-operation-runtime.ts`)

| API                                                                      | Purpose                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `getSharedAssetOperationRuntime()`                                       | The singleton orchestrator for the whole app.                                  |
| `ensure(target, policy)` / `register(target, policy)`                    | Register your policy. `ensure` is idempotent; `register` throws on duplicates. |
| `canEnqueue(target, entityId)`                                           | Admission check; throws when your `admitEnqueue` rejects.                      |
| `enqueue(target, entityId, preparedAsset, preview?, input?)`             | Create the job; returns the job object.                                        |
| `cancel(jobId)` / `remove(jobId)`                                        | Cancel a job or drop it entirely.                                              |
| `retryUpload(jobId)` / `retryPersistence(jobId)` / `retryCleanup(jobId)` | Retry the failed step.                                                         |
| `subscribeCleanupFailures(listener)`                                     | Observe best-effort cleanup failures.                                          |

### Reactive store (`client/shared-asset-queue.ts`)

| API                          | Purpose                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getSharedAssetQueueStore()` | Zustand store mirroring the queue: `getState()`, `subscribe(selector?, listener)`. Use for progress bars, retry buttons, and per-entity job lookups (selectors: `selectJobById`, `selectActiveJob`, `selectNextEnqueuedJob`). |

### Server (`server/`)

| API                                                                           | Purpose                                                                                      |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `parseAssetUpload(request)`                                                   | Parses the multipart upload -> `{ target, entityId, blob, fields }`; enforces size and WebP. |
| `R2Adapter` + `createR2Config()`                                              | Object storage transport: `putObject(key, blob)` / `deleteObject(key)`.                      |
| `createProvisionalAssetReceipt(claims, { secret, deadlines })`                | Signs an authorization to persist or discard an upload.                                      |
| `verifyProvisionalAssetReceipt(receipt, { secret, purpose, validateClaims })` | Verifies signature and deadline; throws `INVALID_RECEIPT` otherwise.                         |
| `getAssetReceiptSecret()`                                                     | Reads `ASSET_RECEIPT_SECRET` (throws if unconfigured).                                       |

### Environment

`R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `ASSET_RECEIPT_SECRET`.

## 3. The policy — your main contract

Implement one `AssetOperationPolicy<TUpload, TPersist, TCleanup>` per target:

```ts
const policy: AssetOperationPolicy<Receipt, Reference, null> = {
  // Optional: reject a second in-flight job for the same entity.
  admitEnqueue({ target, entityId, snapshot }) {
    /* throw new Error('Upload already queued for this entity') when a non-terminal
       job for target + entityId exists */
  },
  // Upload the prepared blob to YOUR endpoint. Return whatever persist needs.
  async upload({ context, preparedAsset }) {
    const form = new FormData()
    form.append('assetTarget', ASSET_TARGET.YOUR_TARGET)
    form.append('entityId', context.entityId)
    form.append('blob', preparedAsset.blob, 'your-asset.webp')
    // ...your domain fields (expected state, activation flags, etc.)...
    const res = await fetch('/api/your-assets', {
      method: 'POST',
      body: form,
      signal: context.signal
    })
    if (!res.ok) {
      // Throw with a STABLE code for deterministic failures (e.g. 'YOUR_CONFLICT')
      throw new Error('YOUR_CONFLICT')
    }
    return { receipt: (await res.json()).receipt }
  },
  // Persist the reference into your domain, authorized by the receipt.
  async persist({ context, upload }) {
    const res = await fetch('/api/your-assets/persist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ receipt: upload.receipt }),
      signal: context.signal
    })
    if (!res.ok) throw new Error('Persistence failed')
    const persisted = await res.json() // your domain record with path/version
    return { persisted, cleanup: null }
  },
  // Optional: runs after successful persistence (release transient objects).
  async cleanup({ context, value }) {},
  // Optional: best-effort delete when the job is cancelled or replaced.
  async discardUpload({ context, upload }) {
    await fetch('/api/your-assets/discard', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ receipt: upload.receipt }),
      signal: context.signal
    })
  }
}
```

Bootstrap once, as a client module side effect (imported by your feature entry):

```ts
// your-feature/_lib/your-asset-composition.ts  ('use client')
import { getSharedAssetOperationRuntime } from '@/shared/assets-manager/client/asset-operation-runtime'
import { ASSET_TARGET } from '@/shared/assets-manager/client/contracts'
import { yourPolicy } from './your-asset-operation-policy'

export function ensureYourAssetPolicy(): void {
  getSharedAssetOperationRuntime().ensure(ASSET_TARGET.YOUR_TARGET, yourPolicy)
}
ensureYourAssetPolicy()
```

## 4. Server routes (yours, using module helpers)

- **POST upload**: `parseAssetUpload(request)` -> validate your domain rules -> `store.putObject(key, blob)` -> `createProvisionalAssetReceipt(claims, { secret, deadlines })` -> return `{ receipt }`.
- **POST persist**: `verifyProvisionalAssetReceipt(receipt, { secret, purpose: 'authorization', validateClaims })` -> write the reference in your domain -> return the persisted record (includes `path`/`version`).
- **POST discard**: `verifyProvisionalAssetReceipt(receipt, { secret, purpose: 'cleanup', validateClaims })` -> `store.deleteObject(path)`.

**Key naming**: derive stable storage keys from your domain identity (slug/id + version/timestamp). Keys are permanent — never reuse a key across versions.

## 5. Client controller

Controller pattern: prepare -> hold result -> enqueue on submit -> mirror job state.

```ts
const preparation = createPreparationController(createBrowserImageCodec())
const runtime = getSharedAssetOperationRuntime()
const store = getSharedAssetQueueStore()

async function onSelectFile(file: File) {
  const result = await preparation.prepare({
    target: ASSET_TARGET.YOUR_TARGET,
    source: file,
    resize: YOUR_RESIZE_SPEC
  })
  // result.phase === 'ready' -> keep preparedAsset + preview for enqueue
  // result.phase === 'error' -> show result.error to the user
}

function onSubmit(entityId: string) {
  runtime.canEnqueue(ASSET_TARGET.YOUR_TARGET, String(entityId))
  const job = runtime.enqueue(
    ASSET_TARGET.YOUR_TARGET,
    String(entityId),
    preparedAsset,
    preview,
    input
  )
}

store.subscribe((state) => {
  // jobId -> progress (sentBytes/totalBytes), failure (error, failedStep),
  // completion (COMPLETED -> reference now lives in your domain)
})
```

For React, wrap the controller in a hook using `useSyncExternalStore` over the controller snapshot plus the store subscription.

## 6. What the module does for you (observed behavior)

- **One active job at a time** globally; the rest wait enqueued.
- **One job per target + entity**: enqueuing again cancels the previous non-terminal job and discards its upload.
- **Automatic retries**: failed upload/persist steps retry with backoff (max 3) while the queue is idle; `job.failedStep` tells you which step failed.
- **Deterministic vs transient errors**: stable codes (conflicts, `INVALID_RECEIPT`) surface in `job.error`. Treat stable codes as non-retryable lifecycle outcomes and show them to the user; transient failures are retried by the queue.
- **Timeouts**: each operation step is bounded (30s); report progress via `context.reportProgress(bytes)`.
- **Receipts**: signed HMAC with short TTL and `persistUntil`/`discardUntil` deadlines. Verify with the matching `purpose`; a discard past its deadline fails.
- **Cleanup**: `cleanup` runs after successful persistence; failures are tracked and retryable via `retryCleanup`.
- **Previews**: object URLs are released automatically at terminal states — do not double-release.

## 7. Considerations & pitfalls

- Output is always WebP, max 1MB; source max 10MB (jpeg/png/webp only). Design the UX around these limits.
- Total upload request max 1.25MB (multipart limit) — keep domain form fields minimal.
- Never persist domain state without a verified receipt.
- `register` throws on duplicates; use `ensure` for idempotent bootstrap.
- Never call queue transitions directly — use the runtime API.
- Server helpers are `server-only`; policies run in the browser.
- Add unit tests mirroring `apps/admin/tests/unit/shared/assets-manager/*` patterns (policy, controller, server routes).

## 8. Verification checklist

- [ ] Target added to `ASSET_TARGET`
- [ ] Policy registered via `ensure` at module load
- [ ] Upload/persist/discard routes verify receipts with the correct `purpose`
- [ ] Controller handles preparing / ready / uploading / failed / cancelled states
- [ ] Retry UX respects `failedStep` and stable error codes
- [ ] `bun run type-check && bun run lint` pass
