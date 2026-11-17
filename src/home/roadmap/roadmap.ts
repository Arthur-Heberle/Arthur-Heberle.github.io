// The roadmap's behaviour, loaded as the section nears the viewport (Roadmap.astro):
//  - each row's last item loses its stretch of line (nothing beside it to reach);
//  - a timeline's waves draw themselves once when it enters view (stroke-dashoffset), and ripple gently while
//    the pointer is over it (the repeated path slides by one wavelength, on a loop, inside its clipping SVG);
//    reduced motion: drawn and still;
//  - a pill's popover opens at the pill instead of the middle of the window, and follows it on scroll.
import { gsap } from 'gsap'

const WAVELENGTH = 24 // px, the wave's period in Roadmap.astro
const GAP = 10 // px between a pill and its popover
const EDGE = 16 // px a popover keeps from the window's edges

function place(pop: HTMLElement, pill: HTMLElement) {
  const at = pill.getBoundingClientRect()
  pop.setAttribute('data-placed', '')
  const vw = document.documentElement.clientWidth
  // before it opens (beforetoggle) it has no box yet: its CSS width, and a height of 0 until the next frame
  const w = pop.offsetWidth || Math.min(320, vw - 32)
  const h = pop.offsetHeight
  const vh = window.innerHeight
  const left = Math.min(Math.max(at.left + at.width / 2 - w / 2, EDGE), vw - w - EDGE)
  let top = at.bottom + GAP + 18 // under the pill and its month
  if (top + h > vh - EDGE) top = Math.max(at.top - GAP - h, EDGE)
  pop.style.left = `${Math.round(left)}px`
  pop.style.top = `${Math.round(top)}px`
}

function popovers(root: HTMLElement) {
  let open: { pop: HTMLElement; pill: HTMLElement } | null = null
  const follow = () => {
    if (open) place(open.pop, open.pill)
  }
  root.querySelectorAll<HTMLElement>('.rm-pop').forEach((pop) => {
    const pill = root.querySelector<HTMLElement>(`[popovertarget="${pop.id}"]`)
    if (!pill) return
    pop.addEventListener('beforetoggle', (event) => {
      if ((event as ToggleEvent).newState === 'open') {
        open = { pop, pill }
        place(pop, pill)
        requestAnimationFrame(follow) // again, now that it has a height
      } else if (open?.pop === pop) {
        open = null
      }
    })
  })
  window.addEventListener('scroll', follow, { passive: true })
  window.addEventListener('resize', follow)
}

function rowEnds(root: HTMLElement) {
  const lists = [...root.querySelectorAll<HTMLElement>('.rm-items')]
  const mark = () =>
    lists.forEach((list) => {
      const items = [...list.querySelectorAll<HTMLElement>('[data-rm-item]')]
      items.forEach((item, i) => {
        const next = items[i + 1]
        item.toggleAttribute('data-row-end', !!next && next.offsetTop !== item.offsetTop)
      })
    })
  mark()
  const ro = new ResizeObserver(mark)
  lists.forEach((list) => ro.observe(list))
}

function waves(root: HTMLElement) {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const off: Array<() => void> = []
    root.querySelectorAll<HTMLElement>('[data-rm-timeline]').forEach((timeline) => {
      const paths = [...timeline.querySelectorAll<SVGPathElement>('[data-rm-wave]')]
      if (!paths.length) return

      // draw: pathLength is 1 and the path is longer than its clip, so each one is revealed only across the
      // part that shows (its SVG's width over the path's length), then left whole for the ripple
      gsap.set(paths, { strokeDasharray: '1 1', strokeDashoffset: 1 })
      const draw = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          draw.disconnect()
          paths.forEach((path, i) => {
            const shown = Math.min((path.ownerSVGElement?.clientWidth ?? 0) / path.getTotalLength(), 1)
            gsap.to(path, {
              strokeDashoffset: 1 - shown,
              duration: 0.7,
              delay: i * 0.25,
              ease: 'power1.inOut',
              onComplete: () => gsap.set(path, { strokeDashoffset: 0 }),
            })
          })
        },
        { threshold: 0.4 },
      )
      draw.observe(timeline)

      // ripple: slide one wavelength on a loop while hovered; on leave, finish the current cycle and stop at
      // the start (the same picture, since the wave repeats every wavelength)
      let hovering = false
      const loop = gsap.to(paths, {
        x: -WAVELENGTH,
        duration: 1.6,
        ease: 'none',
        repeat: -1,
        paused: true,
        onRepeat: () => {
          if (!hovering) loop.pause(0)
        },
      })
      const enter = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        hovering = true
        if (loop.paused()) loop.play()
      }
      const leave = () => {
        hovering = false
      }
      timeline.addEventListener('pointerenter', enter)
      timeline.addEventListener('pointerleave', leave)
      off.push(() => {
        draw.disconnect()
        loop.kill()
        gsap.set(paths, { clearProps: 'all' })
        timeline.removeEventListener('pointerenter', enter)
        timeline.removeEventListener('pointerleave', leave)
      })
    })
    return () => off.forEach((f) => f())
  })
}

export function initRoadmap(root: HTMLElement) {
  rowEnds(root)
  popovers(root)
  waves(root)
}
