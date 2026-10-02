// The datasheet's motion. Arrival, once: the frame and the section rules draw in
// (stroke-dashoffset), then the sections fade in from top to bottom (opacity, with a small y).
// The three drawings reuse the spine's note drawings (noteDrawings.ts): the languages slot plays when
// its table enters view and on hover of its row; the knight and the string play on arrival and on hover.
// Nothing loops. Without JavaScript, or under reduced motion, every part stays in its final state
// (the markup ships that way; the start states are only ever set here).
import { gsap } from 'gsap'
import { makeArt } from '../spine/noteDrawings'

const ease = () => gsap.parseEase('reveal') ?? 'power4.out'

export function initDatasheet() {
  const root = document.querySelector<HTMLElement>('[data-datasheet]')
  if (!root) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')

  const lines = [...root.querySelectorAll<SVGGeometryElement>('[data-ds-line]')]
  const parts = [...root.querySelectorAll<HTMLElement>('[data-ds-part]')]

  // drawings: [svg wrapper, art, plays on arrival of what]
  const row = root.querySelector<HTMLElement>('[data-ds-row="languages"]')
  const langSvg = row?.querySelector<SVGSVGElement>('svg.note-art') ?? null
  const inline = [...root.querySelectorAll<HTMLElement>('[data-ds-hover]')]
  const arts = [
    ...(langSvg && row ? [{ art: makeArt(langSvg, 'languages'), hover: row, arrive: row }] : []),
    ...inline.map((el) => {
      const svg = el.querySelector<SVGSVGElement>('svg.note-art')!
      return { art: makeArt(svg, svg.classList.contains('note-art-chess') ? 'chess' : 'guitar'), hover: el, arrive: el }
    }),
  ]

  const replay = (art: ReturnType<typeof makeArt>) => {
    if (art && !reduced.matches && !art.running()) art.play()
  }
  for (const { art, hover } of arts) {
    hover.addEventListener('pointerenter', () => replay(art))
    hover.addEventListener('focusin', (e) => {
      if ((e.target as HTMLElement).matches(':focus-visible')) replay(art)
    })
  }

  if (reduced.matches) return

  // start states, set here only so nothing flashes and no-JS / reduced motion keep the final markup
  const len = (_: number, el: Element) => (el as SVGGeometryElement).getTotalLength()
  // what fades in: each section's children except its rule (which draws instead)
  const kidsOf = (part: HTMLElement) => [...part.children].filter((c) => !c.matches('svg.ds-rule'))
  const faders = parts.flatMap(kidsOf)
  gsap.set(lines, { strokeDasharray: len, strokeDashoffset: len })
  gsap.set(faders, { opacity: 0, y: 8 })
  for (const { art } of arts) art?.reset()

  // the drawings wait for the sections to fade in; the languages slot plays when the table is in view
  const played = new Set<HTMLElement>()
  const artIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || !started) continue
        const el = e.target as HTMLElement
        artIo.unobserve(el)
        played.add(el)
        arts.find((a) => a.arrive === el)?.art?.play(0.9)
      }
    },
    { rootMargin: '0px 0px -15% 0px' },
  )

  let started = false
  const start = () => {
    started = true
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' })
        gsap.set(faders, { clearProps: 'opacity,transform' })
      },
    })
    // the frame, then each rule a beat after the last
    tl.to(lines[0], { strokeDashoffset: 0, duration: 0.9, ease: ease() }, 0)
    tl.to(lines.slice(1), { strokeDashoffset: 0, duration: 0.5, ease: ease(), stagger: 0.08 }, 0.25)
    // then the sections, top to bottom
    parts.forEach((part, i) => {
      tl.to(kidsOf(part), { opacity: 1, y: 0, duration: 0.5, ease: ease() }, 0.6 + i * 0.12)
    })
    for (const { arrive } of arts) artIo.observe(arrive)
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      start()
    },
    { rootMargin: '0px 0px -15% 0px' },
  )
  io.observe(root.querySelector('.ds-frame') ?? root)

  reduced.addEventListener('change', () => {
    if (!reduced.matches) return
    gsap.killTweensOf([...lines, ...faders])
    gsap.set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' })
    gsap.set(faders, { clearProps: 'opacity,transform' })
    for (const { art } of arts) art?.settle()
  })
}
