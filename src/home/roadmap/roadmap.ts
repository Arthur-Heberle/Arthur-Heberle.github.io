// The roadmap's behaviour, loaded as the section nears the viewport (Roadmap.astro). Three things:
//  - the wave follows the pointer a little: sideways and in height, transform only, eased back on leave
//    (not under reduced motion, not on touch, where there is no hover);
//  - a node's popover opens at its node instead of the middle of the window, and follows it on scroll;
//  - a timeline that scrolls sideways fades at the edge that has more.
import { gsap } from 'gsap'

const GAP = 10 // px between a node and its popover
const EDGE = 16 // px a popover keeps from the window's edges

function place(pop: HTMLElement, button: HTMLElement) {
  const box = button.querySelector<HTMLElement>('.rm-box') ?? button
  const anchor = box.getBoundingClientRect()
  const node = button.getBoundingClientRect()
  pop.setAttribute('data-placed', '')
  const vw = document.documentElement.clientWidth
  // before it opens (beforetoggle) it has no box yet: its CSS width, and a height of 0 until the next frame
  const w = pop.offsetWidth || Math.min(320, vw - 32)
  const h = pop.offsetHeight
  const vh = window.innerHeight
  const centre = anchor.left + anchor.width / 2
  const left = Math.min(Math.max(centre - w / 2, EDGE), vw - w - EDGE)
  // under the node's text if it fits, else above its box
  let top = node.bottom + GAP
  if (top + h > vh - EDGE) top = Math.max(anchor.top - GAP - h, EDGE)
  pop.style.left = `${Math.round(left)}px`
  pop.style.top = `${Math.round(top)}px`
}

function popovers(root: HTMLElement) {
  let open: { pop: HTMLElement; button: HTMLElement } | null = null
  const follow = () => {
    if (open) place(open.pop, open.button)
  }
  root.querySelectorAll<HTMLElement>('.rm-pop').forEach((pop) => {
    const button = root.querySelector<HTMLElement>(`[popovertarget="${pop.id}"]`)
    if (!button) return
    pop.addEventListener('beforetoggle', (event) => {
      if ((event as ToggleEvent).newState === 'open') {
        open = { pop, button }
        // measured before it paints, so it never shows in the middle first
        requestAnimationFrame(follow)
        place(pop, button)
      } else if (open?.pop === pop) {
        open = null
      }
    })
  })
  window.addEventListener('scroll', follow, { passive: true })
  window.addEventListener('resize', follow)
  root.querySelectorAll<HTMLElement>('[data-rm-track]').forEach((track) =>
    track.addEventListener('scroll', follow, { passive: true }),
  )
}

function edges(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-rm-track]').forEach((track) => {
    const update = () => {
      const more = track.scrollLeft + track.clientWidth < track.scrollWidth - 2
      const less = track.scrollLeft > 2
      track.toggleAttribute('data-more', more)
      track.toggleAttribute('data-less', less)
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    new ResizeObserver(update).observe(track)
  })
}

function waves(root: HTMLElement) {
  const mm = gsap.matchMedia()
  mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
    const off: Array<() => void> = []
    root.querySelectorAll<HTMLElement>('[data-rm-line]').forEach((line) => {
      const wave = line.querySelector<SVGGElement>('[data-rm-wave]')
      if (!wave) return
      gsap.set(wave, { transformOrigin: '50% 50%' })
      const toX = gsap.quickTo(wave, 'x', { duration: 0.9, ease: 'power3.out' })
      const toY = gsap.quickTo(wave, 'scaleY', { duration: 0.9, ease: 'power3.out' })
      // the viewBox is wider than a screen pixel by this much, so the shift is a few px whatever the width
      const units = () => {
        const svg = line.querySelector('svg')!
        return svg.viewBox.baseVal.width / Math.max(svg.getBoundingClientRect().width, 1)
      }
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        // against the visible part of the timeline (its scroller), not its full width
        const rect = (line.parentElement ?? line).getBoundingClientRect()
        const r = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1) - 0.5 // -0.5 .. 0.5
        const near = 1 - Math.min(Math.abs((event.clientY - rect.top - 24) / 120), 1) // 1 on the line
        toX(-r * 28 * units())
        toY(1 + 0.35 * near)
      }
      const leave = () => {
        toX(0)
        toY(1)
      }
      line.addEventListener('pointermove', move)
      line.addEventListener('pointerleave', leave)
      off.push(() => {
        line.removeEventListener('pointermove', move)
        line.removeEventListener('pointerleave', leave)
      })
    })
    return () => off.forEach((f) => f())
  })
}

export function initRoadmap(root: HTMLElement) {
  popovers(root)
  edges(root)
  waves(root)
}
