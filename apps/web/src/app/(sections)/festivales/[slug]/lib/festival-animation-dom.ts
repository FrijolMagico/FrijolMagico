export function getFestivalAnimationNodes(root: HTMLElement) {
  return {
    header: root.querySelector<HTMLElement>("[data-festival-entry='header']"),
    poster: root.querySelector<HTMLElement>("[data-festival-entry='poster']"),
    participants: root.querySelector<HTMLElement>(
      "[data-festival-entry='participants']"
    ),
    categories: Array.from(
      root.querySelectorAll<HTMLElement>('[data-spoiler-category]')
    ),
    toggle: root.querySelector<HTMLButtonElement>(
      '[data-spoiler-global-toggle]'
    )
  }
}

export function getCategoryItems(category: HTMLElement) {
  return Array.from(
    category.querySelectorAll<HTMLElement>('[data-spoiler-item]')
  )
}
