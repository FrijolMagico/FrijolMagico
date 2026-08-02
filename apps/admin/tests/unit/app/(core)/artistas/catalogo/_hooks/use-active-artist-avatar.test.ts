import { beforeEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'

import type { ActiveAvatar } from '@/core/artistas/catalogo/_lib/avatar-history-contracts'

let resolveAvatar: ((value: ActiveAvatar | null) => void) | null = null
let pendingAction: Promise<ActiveAvatar | null> = Promise.resolve(null)
const getArtistAvatarActionMock = mock((artistId: number) => {
  void artistId
  return pendingAction
})

mock.module('@/core/artistas/_actions/get-artist-avatar.action', () => ({
  getArtistAvatarAction: getArtistAvatarActionMock
}))

let testDocument: Document
class TestNode {
  nodeType = 1
  nodeName = 'DIV'
  tagName = 'DIV'
  parentNode: TestNode | null = null
  childNodes: TestNode[] = []
  ownerDocument = testDocument
  namespaceURI = 'http://www.w3.org/1999/xhtml'
  appendChild(node: TestNode) { node.parentNode = this; this.childNodes.push(node); return node }
  insertBefore(node: TestNode) { return this.appendChild(node) }
  removeChild(node: TestNode) { this.childNodes.splice(this.childNodes.indexOf(node), 1); return node }
  addEventListener() {}
  removeEventListener() {}
  setAttribute() {}
  removeAttribute() {}
}
const fakeDocument = { createElement: () => new TestNode(), createElementNS: () => new TestNode(), createTextNode: () => new TestNode(), createComment: () => new TestNode(), body: new TestNode(), documentElement: new TestNode(), activeElement: new TestNode(), defaultView: globalThis, addEventListener() {}, removeEventListener() {} }
testDocument = fakeDocument as unknown as Document
;(globalThis as unknown as Record<string, unknown>).document = testDocument
;(globalThis as unknown as Record<string, unknown>).window = globalThis
;(globalThis as unknown as Record<string, unknown>).Node = TestNode
;(globalThis as unknown as Record<string, unknown>).HTMLElement = TestNode
;(globalThis as unknown as Record<string, unknown>).Element = TestNode
;(globalThis as unknown as Record<string, unknown>).SVGElement = TestNode
;(globalThis as unknown as Record<string, unknown>).HTMLIFrameElement =
  TestNode
;(globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT =
  true

const { useActiveArtistAvatar } = await import('@/core/artistas/catalogo/_hooks/use-active-artist-avatar')

let hookResult: ReturnType<typeof useActiveArtistAvatar> | null = null
function Probe() {
  hookResult = useActiveArtistAvatar()
  return null
}

beforeEach(() => {
  pendingAction = new Promise<ActiveAvatar | null>((resolve) => {
    resolveAvatar = resolve
  })
  getArtistAvatarActionMock.mockClear()
})

test('late-drop: clear() drops an in-flight load response so it cannot repopulate', async () => {
  const root = createRoot(new TestNode() as unknown as Element)
  await act(async () => {
    root.render(createElement(Probe))
  })

  await act(async () => {
    hookResult!.load(42)
  })
  expect(getArtistAvatarActionMock).toHaveBeenCalledWith(42)

  await act(async () => {
    hookResult!.clear()
  })

  // The server response arrives after clear() — it must be discarded.
  await act(async () => {
    resolveAvatar!({ id: 10, path: 'artistas/late-avatar.webp', version: 'v1' })
  })

  expect(hookResult!.avatar).toBeNull()
  expect(hookResult!.error).toBeNull()

  await act(async () => {
    root.unmount()
  })
})

test('no-op: clear() with nothing pending leaves (null, null) and never invokes the action', async () => {
  const root = createRoot(new TestNode() as unknown as Element)
  await act(async () => {
    root.render(createElement(Probe))
  })

  await act(async () => {
    hookResult!.clear()
  })

  expect(hookResult!.avatar).toBeNull()
  expect(hookResult!.error).toBeNull()
  expect(getArtistAvatarActionMock).not.toHaveBeenCalled()

  await act(async () => {
    root.unmount()
  })
})

test('clear() also drops an avatar that already loaded', async () => {
  const root = createRoot(new TestNode() as unknown as Element)
  await act(async () => {
    root.render(createElement(Probe))
  })

  await act(async () => {
    hookResult!.load(42)
    resolveAvatar!({ id: 3, path: 'artistas/loaded.webp', version: 'v1' })
  })
  expect(hookResult!.avatar).toEqual({
    id: 3,
    path: 'artistas/loaded.webp',
    version: 'v1'
  })

  await act(async () => {
    hookResult!.clear()
  })

  expect(hookResult!.avatar).toBeNull()
  expect(hookResult!.error).toBeNull()

  await act(async () => {
    root.unmount()
  })
})
