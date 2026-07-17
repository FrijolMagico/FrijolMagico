'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { RefObject } from 'react'

import {
  getCategoryItems,
  getFestivalAnimationNodes
} from '../lib/festival-animation-dom'
import {
  FESTIVAL_ANIMATION_TIMING,
  getCategoryDurationMs
} from '../lib/festival-animation-timing'
import {
  readFestivalSpoilerStorage,
  writeFestivalSpoilerStorage
} from '../lib/festival-animation-storage'

gsap.registerPlugin(useGSAP)

type AnimationTarget = HTMLElement | HTMLElement[] | null

interface FestivalAnimationTimeline {
  to: (
    target: AnimationTarget,
    vars: gsap.TweenVars,
    position?: number
  ) => FestivalAnimationTimeline
  from: (
    target: AnimationTarget,
    vars: gsap.TweenVars,
    position?: number
  ) => FestivalAnimationTimeline
  fromTo: (
    target: AnimationTarget,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    position?: number
  ) => FestivalAnimationTimeline
  kill: () => void
}

export interface FestivalAnimationAdapter {
  set: (target: AnimationTarget, vars: gsap.TweenVars) => void
  timeline: (options?: gsap.TimelineVars) => FestivalAnimationTimeline
  schedule: (callback: () => void, delay: number) => number
  clearSchedule: (id: number) => void
  reducedMotion: () => boolean
  measure: (element: HTMLElement) => DOMRect
  readStorage: (slug: string) => string[]
  writeStorage: (slug: string, ids: string[]) => void
}

function createBrowserAnimationAdapter(): FestivalAnimationAdapter {
  return {
    set: gsap.set,
    timeline: (options) => gsap.timeline(options),
    schedule: (callback, delay) => window.setTimeout(callback, delay),
    clearSchedule: (id) => window.clearTimeout(id),
    reducedMotion: () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    measure: (element) => element.getBoundingClientRect(),
    readStorage: (slug) =>
      readFestivalSpoilerStorage(window.localStorage, slug),
    writeStorage: (slug, ids) =>
      writeFestivalSpoilerStorage(window.localStorage, slug, ids)
  }
}

function getBars(item: HTMLElement) {
  return Array.from(
    item.querySelectorAll<HTMLElement>('[data-spoiler-redaction]')
  )
}

function setItemInteraction(
  item: HTMLElement,
  enabled: boolean,
  animation: FestivalAnimationAdapter
) {
  const link = item.querySelector<HTMLElement>('[data-spoiler-link]')
  if (!link) return

  item.tabIndex = enabled ? -1 : 0
  if (enabled) item.removeAttribute('role')
  else item.setAttribute('role', 'button')
  link.setAttribute('aria-disabled', String(!enabled))
  link.setAttribute('tabindex', enabled ? '0' : '-1')
  link.classList.toggle('pointer-events-none', !enabled)
  animation.set(link, { pointerEvents: enabled ? 'auto' : 'none' })
}

function setCategoryInteraction(
  category: HTMLElement,
  enabled: boolean,
  animation: FestivalAnimationAdapter
) {
  getCategoryItems(category).forEach((item) =>
    setItemInteraction(item, enabled, animation)
  )
}

function setToggleAction(
  toggle: HTMLButtonElement,
  action: 'reveal' | 'conceal'
) {
  const isReveal = action === 'reveal'
  const label = isReveal ? 'Revelar participantes' : 'Ocultar participantes'
  toggle.setAttribute('aria-label', label)
  toggle.setAttribute('title', label)
  toggle
    .querySelector<HTMLElement>("[data-spoiler-toggle-icon='reveal']")
    ?.classList.toggle('hidden', !isReveal)
  toggle
    .querySelector<HTMLElement>("[data-spoiler-toggle-icon='conceal']")
    ?.classList.toggle('hidden', isReveal)
}

function restoreReadableState(
  root: HTMLElement,
  animation: FestivalAnimationAdapter
) {
  root
    .querySelectorAll<HTMLElement>('[data-spoiler-category]')
    .forEach((category) => {
      category.dataset.spoilerState = 'revealed'
      getCategoryItems(category).forEach((item) =>
        animation.set(getBars(item), {
          clearProps: 'width,opacity,transformOrigin'
        })
      )
      setCategoryInteraction(category, true, animation)
    })
}

export function useFestivalDetailAnimations(
  root: RefObject<HTMLDivElement | null>,
  slug: string,
  injectedAdapter?: FestivalAnimationAdapter
) {
  useGSAP(
    () => {
      const rootNode = root.current
      if (!rootNode) return
      const animation = injectedAdapter ?? createBrowserAnimationAdapter()

      try {
        const timelines = new Set<FestivalAnimationTimeline>()
        const timeouts = new Set<number>()
        const { header, poster, participants, categories, toggle } =
          getFestivalAnimationNodes(rootNode)
        if (animation.reducedMotion()) {
          restoreReadableState(rootNode, animation)
          if (toggle) toggle.hidden = true
          return
        }

        const states = new Map(
          categories.map((category) => [category, 'concealed'])
        )
        let locked = false
        const revealedIds = () =>
          categories
            .filter((category) => states.get(category) === 'revealed')
            .map((category) => category.dataset.spoilerCategory ?? '')
            .filter(Boolean)
        const syncToggle = () => {
          if (!toggle) return
          const allRevealed =
            categories.length > 0 &&
            categories.every((category) => states.get(category) === 'revealed')
          setToggleAction(toggle, allRevealed ? 'conceal' : 'reveal')
          toggle.disabled = locked
        }
        const setConcealed = (category: HTMLElement) => {
          states.set(category, 'concealed')
          category.dataset.spoilerState = 'concealed'
          getCategoryItems(category).forEach((item) =>
            animation.set(getBars(item), {
              width: '100%',
              opacity: 1,
              transformOrigin: 'left center'
            })
          )
          setCategoryInteraction(category, false, animation)
        }
        const transition = (
          category: HTMLElement,
          action: 'reveal' | 'conceal'
        ) => {
          const items = getCategoryItems(category)
          const ordered = action === 'reveal' ? items : [...items].reverse()
          const nextState = action === 'reveal' ? 'revealing' : 'concealing'
          states.set(category, nextState)
          category.dataset.spoilerState = nextState
          const timeline = animation.timeline({
            onComplete: () => {
              const finalState = action === 'reveal' ? 'revealed' : 'concealed'
              states.set(category, finalState)
              category.dataset.spoilerState = finalState
              setCategoryInteraction(
                category,
                finalState === 'revealed',
                animation
              )
              animation.writeStorage(slug, revealedIds())
              timelines.delete(timeline)
              syncToggle()
            },
            onInterrupt: () => restoreReadableState(rootNode, animation)
          })
          timelines.add(timeline)
          ordered.forEach((item, index) => {
            const bars = getBars(item)
            const at =
              index * (FESTIVAL_ANIMATION_TIMING.ITEM_STAGGER_MS / 1000)
            if (action === 'conceal')
              animation.set(bars, {
                width: '0%',
                opacity: 1,
                transformOrigin: 'left center'
              })
            bars.forEach((bar) => {
              timeline.to(
                bar,
                {
                  width: action === 'reveal' ? '0%' : '100%',
                  transformOrigin: 'left center',
                  duration: FESTIVAL_ANIMATION_TIMING.ITEM_DURATION_MS / 1000
                },
                at
              )
              if (action === 'reveal')
                timeline.to(
                  bar,
                  {
                    opacity: 0,
                    duration:
                      (FESTIVAL_ANIMATION_TIMING.ITEM_DURATION_MS * 0.25) / 1000
                  },
                  at + (FESTIVAL_ANIMATION_TIMING.ITEM_DURATION_MS * 0.7) / 1000
                )
            })
          })
        }
        const run = (selected: HTMLElement[], action: 'reveal' | 'conceal') => {
          if (locked || selected.length === 0) return
          locked = true
          syncToggle()
          selected.forEach((category) => transition(category, action))
          const timeout = animation.schedule(
            () => {
              timeouts.delete(timeout)
              locked = false
              syncToggle()
            },
            Math.max(
              ...selected.map((category) =>
                getCategoryDurationMs(getCategoryItems(category).length)
              )
            )
          )
          timeouts.add(timeout)
        }
        const onRootClick = (event: MouseEvent) => {
          const item = (event.target as HTMLElement).closest<HTMLElement>(
            '[data-spoiler-item]'
          )
          if (!item || !rootNode.contains(item)) return
          const category = item.closest<HTMLElement>('[data-spoiler-category]')
          if (!category) return
          if (states.get(category) !== 'revealed') event.preventDefault()
          if (!locked && states.get(category) === 'concealed')
            run([category], 'reveal')
        }
        const onToggle = () => {
          const allRevealed = categories.every(
            (category) => states.get(category) === 'revealed'
          )
          run(
            categories.filter((category) =>
              allRevealed
                ? states.get(category) === 'revealed'
                : states.get(category) === 'concealed'
            ),
            allRevealed ? 'conceal' : 'reveal'
          )
        }

        categories.forEach(setConcealed)
        const restored = new Set(animation.readStorage(slug))
        const restoreTimeout = animation.schedule(() => {
          categories.forEach((category) => {
            if (!restored.has(category.dataset.spoilerCategory ?? '')) return
            states.set(category, 'revealed')
            category.dataset.spoilerState = 'revealed'
            getCategoryItems(category).forEach((item) =>
              animation.set(getBars(item), {
                width: '0%',
                opacity: 0,
                transformOrigin: 'left center'
              })
            )
            setCategoryInteraction(category, true, animation)
          })
          timeouts.delete(restoreTimeout)
          syncToggle()
        }, FESTIVAL_ANIMATION_TIMING.RESTORE_DELAY_MS)
        timeouts.add(restoreTimeout)
        const onRootKeyDown = (event: KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          const item = (event.target as HTMLElement).closest<HTMLElement>(
            '[data-spoiler-item]'
          )
          if (!item || !rootNode.contains(item)) return
          const category = item.closest<HTMLElement>('[data-spoiler-category]')
          if (!category || states.get(category) === 'revealed') return
          event.preventDefault()
          if (!locked && states.get(category) === 'concealed')
            run([category], 'reveal')
        }
        rootNode.addEventListener('click', onRootClick)
        rootNode.addEventListener('keydown', onRootKeyDown)
        toggle?.addEventListener('click', onToggle)
        syncToggle()
        const entry = animation.timeline()
        timelines.add(entry)
        entry
          .from(header, {
            autoAlpha: 0,
            y: 16,
            duration: FESTIVAL_ANIMATION_TIMING.ENTRY_DURATION_MS / 1000
          })
          .from(poster, {
            autoAlpha: 0,
            y: 16,
            duration: FESTIVAL_ANIMATION_TIMING.ENTRY_DURATION_MS / 1000
          })
          .from(participants, {
            autoAlpha: 0,
            y: 16,
            duration: FESTIVAL_ANIMATION_TIMING.ENTRY_DURATION_MS / 1000
          })

        return () => {
          rootNode.removeEventListener('click', onRootClick)
          rootNode.removeEventListener('keydown', onRootKeyDown)
          toggle?.removeEventListener('click', onToggle)
          timeouts.forEach((timeout) => animation.clearSchedule(timeout))
          timelines.forEach((timeline) => timeline.kill())
        }
      } catch {
        restoreReadableState(rootNode, animation)
      }
    },
    { scope: root, dependencies: [slug, injectedAdapter], revertOnUpdate: true }
  )
}
