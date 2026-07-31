import { expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'

import type { AssetQueueSnapshot } from '@/shared/assets-manager/client/queue'
import { ASSET_QUEUE_STATUS } from '@/shared/assets-manager/client/queue'

const refresh = mock(() => {})
let snapshot: AssetQueueSnapshot
const listeners = new Set<(next: AssetQueueSnapshot) => void>()
const store = {
  getState: () => snapshot,
  subscribe: (listener: (next: AssetQueueSnapshot) => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
}

mock.module('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
mock.module('@/shared/assets-manager/client/shared-asset-queue', () => ({
  getSharedAssetQueueStore: () => store
}))

let testDocument: Document
class Node {
  nodeType = 1
  nodeName = 'DIV'
  tagName = 'DIV'
  parentNode: Node | null = null
  childNodes: Node[] = []
  ownerDocument = testDocument
  namespaceURI = 'http://www.w3.org/1999/xhtml'
  appendChild(node: Node) { node.parentNode = this; this.childNodes.push(node); return node }
  insertBefore(node: Node) { return this.appendChild(node) }
  removeChild(node: Node) { this.childNodes.splice(this.childNodes.indexOf(node), 1); return node }
  addEventListener() {}
  removeEventListener() {}
  setAttribute() {}
  removeAttribute() {}
}
const document = { createElement: () => new Node(), createElementNS: () => new Node(), createTextNode: () => new Node(), createComment: () => new Node(), body: new Node(), documentElement: new Node(), activeElement: new Node(), defaultView: globalThis, addEventListener() {}, removeEventListener() {} }
testDocument = document as unknown as Document
globalThis.document = testDocument
globalThis.window = globalThis as unknown as Window & typeof globalThis
globalThis.Node = Node as unknown as typeof Node
globalThis.HTMLElement = Node as unknown as typeof HTMLElement
globalThis.Element = Node as unknown as typeof Element
globalThis.SVGElement = Node as unknown as typeof SVGElement
globalThis.HTMLIFrameElement = Node as unknown as typeof HTMLIFrameElement
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { useCatalogAvatarCompletionRefresh } = await import('@/core/artistas/catalogo/_hooks/use-catalog-avatar-completion-refresh')

test('the rendered completion-refresh hook refreshes once after exact persistence completes', async () => {
  const job = { jobId: 'exact', target: 'artist-avatar' as const, entityId: '42', preparedAsset: { blob: new Blob(), width: 1, height: 1, mimeType: 'image/webp' as const }, preview: null, status: ASSET_QUEUE_STATUS.PERSISTING, sentBytes: 0, totalBytes: 0, error: null, failedStep: null }
  snapshot = { jobs: [job], activeJobId: job.jobId }
  refresh.mockClear()
  const root = createRoot(new Node() as unknown as Element)
  function Probe() { useCatalogAvatarCompletionRefresh(42); return null }
  await act(async () => { root.render(createElement(Probe)) })
  await act(async () => {
    snapshot = { jobs: [{ ...job, status: ASSET_QUEUE_STATUS.COMPLETED }], activeJobId: null }
    for (const listener of listeners) listener(snapshot)
  })
  expect(refresh).toHaveBeenCalledTimes(1)
  await act(async () => { root.unmount() })
})
