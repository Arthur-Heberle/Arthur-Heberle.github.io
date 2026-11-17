// The roadmap's two buttons, loaded as the section nears the viewport (Roadmap.astro):
//  - "Expand all" opens every subtheme (<details>), then reads "Collapse all"; it follows the subthemes the
//    visitor opens or closes one by one;
//  - full screen shows the box on its own (Fullscreen API); stays hidden where the browser has none (iPhone).
// Both are rendered hidden, so without JS nothing on the page is dead.

function expandAll(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>('[data-rm-expand]')
  const label = root.querySelector<HTMLElement>('[data-rm-expand-label]')
  const subs = [...root.querySelectorAll<HTMLDetailsElement>('[data-rm-sub]')]
  if (!button || !label || !subs.length) return
  const sync = () => {
    const all = subs.every((d) => d.open)
    label.textContent = (all ? button.dataset.collapse : button.dataset.expand) ?? ''
  }
  button.addEventListener('click', () => {
    const open = !subs.every((d) => d.open)
    subs.forEach((d) => (d.open = open))
    sync()
  })
  subs.forEach((d) => d.addEventListener('toggle', sync))
  button.hidden = false
  sync()
}

function fullscreen(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>('[data-rm-full]')
  if (!button || !document.fullscreenEnabled || !root.requestFullscreen) return
  button.addEventListener('click', () => {
    if (document.fullscreenElement === root) document.exitFullscreen()
    else root.requestFullscreen().catch(() => {})
  })
  document.addEventListener('fullscreenchange', () => {
    const on = document.fullscreenElement === root
    button.setAttribute('aria-label', (on ? button.dataset.exit : button.dataset.enter) ?? '')
    button.toggleAttribute('data-on', on)
  })
  button.hidden = false
}

export function initRoadmap(root: HTMLElement) {
  expandAll(root)
  fullscreen(root)
}
