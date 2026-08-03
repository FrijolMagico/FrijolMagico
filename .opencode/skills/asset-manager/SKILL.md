---
name: asset-manager
description: 'Trigger: new entity with asset uploads, assets-manager integration, asset queue, image preparation, R2 upload. Guides agents through the assets-manager consumer contract: which APIs exist, their purpose, and the exact steps to integrate a new asset target.'
license: Apache-2.0
metadata:
  author: 'Strocs'
  version: '1.0'
---

# Asset Manager Integration

## Activation Contract

Load when a task adds or changes a consumer of the assets-manager module (`apps/admin/src/shared/assets-manager/`): a new entity needs file/image uploads, a new asset target, upload queue integration, image preparation, or R2-backed storage.

## Hard Rules

- **Consumer contract only.** Integrate through the public API; never modify module internals to fit a consumer.
- **Abstract examples only.** Never mention existing consumer implementations or domain features; keep examples generic (`your-target`, `entityId`).
- **Register first.** The target must exist in `ASSET_TARGET` and a policy must be registered before any enqueue.
- **Server-only boundary.** Storage, receipts, and multipart helpers are `server-only`; policies and the runtime run in the browser.
- **Receipts authorize persistence.** Never write the domain reference without verifying the receipt.

## Decision Gates

| Need                                  | Implement                                                |
| ------------------------------------- | -------------------------------------------------------- |
| Validate + optimize only              | `createPreparationController` + `ResizeSpec`             |
| Full upload lifecycle                 | Target + policy + bootstrap + server routes + controller |
| Reactive UI (progress, retry, cancel) | `getSharedAssetQueueStore` subscription                  |
| Compensation on cancel/failure        | `discardUpload` / `cleanup` policy steps                 |

## Execution Steps

1. Read `references/implementation-guide.md` in full.
2. Add the target constant to `ASSET_TARGET`.
3. Define the preparation spec (`ResizeSpec`); use the default browser codec.
4. Implement `AssetOperationPolicy` (upload, persist, cleanup; discardUpload and admitEnqueue when relevant).
5. Bootstrap the policy once via `runtime.ensure` at client module load.
6. Build server routes: upload (multipart -> store -> receipt), persist (verify receipt -> domain write -> reference), discard (verify cleanup purpose -> delete).
7. Build the controller/hook: prepare -> enqueue -> subscribe store -> retry/cancel/remove.
8. Verify with `bun run type-check && bun run lint` and add unit tests mirroring `apps/admin/tests/unit/shared/assets-manager/*` patterns.

## Output Contract

Return: target added, policy file, bootstrap point, server routes, controller/hook, env vars used, and verification results (type-check/lint/tests).

## References

- `references/implementation-guide.md` — consumer-facing API guide with abstract examples and integration steps.
