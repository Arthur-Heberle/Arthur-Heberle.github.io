// The experience timeline's motion, loaded when the section nears the viewport (Experience.astro).
// Only transform and opacity. Nothing loops: every part shows its final state at rest, and the arrival
// plays once, when the timeline is in view. Reduced motion never gets past this guard: final states only.
import { gsap } from 'gsap'

// motion.ts's one curve (the CustomEase 'reveal'), by name; power4.out is the same shape if
// motion.ts has not registered it yet.
const ease = () => gsap.parseEase('reveal') ?? 'power4.out'

export function initTimeline(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const wide = matchMedia('(min-width: 768px)')
  const axisLine = root.querySelector<HTMLElement>('.xp-axis-line')
  const ticks = [...root.querySelectorAll<HTMLElement>('.xp-tick')]
  const arrows = [...root.querySelectorAll<SVGElement>('.xp-arrow')]
  const years = [...root.querySelectorAll<HTMLElement>('.xp-year')]
  const rows = [...root.querySelectorAll<HTMLElement>('.xp-row')]
  if (!axisLine || !wide.matches) return

  const parts = rows.map((row) => ({
    bar: row.querySelector<HTMLElement>('.xp-bar')!,
    open: row.querySelector<HTMLElement>('.xp-open'),
    lift: row.querySelector<HTMLElement>('.xp-lift')!,
    label: row.querySelector<HTMLElement>('.xp-label')!,
  }))

  // the drawing waits at its start until the timeline is seen. Transform only on the 3D parts: an
  // opacity below 1 would flatten each object's 3D chain while it plays.
  gsap.set(axisLine, { scaleX: 0 })
  gsap.set(ticks, { scaleY: 0 })
  gsap.set([...arrows, ...years], { opacity: 0 })
  parts.forEach((p) => {
    gsap.set(p.bar, { scaleX: 0 })
    gsap.set(p.lift, { z: 70 })
    gsap.set([p.label, p.open].filter(Boolean), { opacity: 0 })
  })

  const arrive = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      arrive.disconnect()
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([axisLine, ...ticks, ...arrows, ...years], { clearProps: 'transform,opacity' })
          parts.forEach((p) => gsap.set([p.bar, p.lift, p.label, p.open].filter(Boolean), { clearProps: 'transform,opacity' }))
        },
      })
      // the axis draws, left to right, its ticks standing up as the line reaches them
      tl.to(axisLine, { scaleX: 1, duration: 0.7, ease: ease() }, 0)
      tl.to(ticks, { scaleY: 1, duration: 0.25, ease: ease(), stagger: 0.7 / ticks.length }, 0.05)
      tl.to([...arrows, ...years], { opacity: 1, duration: 0.3 }, 0.4)
      // then row by row: the bar grows from its start date and the object is set down onto it
      parts.forEach((p, i) => {
        const at = 0.8 + i * 0.4
        tl.to(p.bar, { scaleX: 1, duration: 0.5, ease: ease() }, at)
        tl.to(p.lift, { z: 0, duration: 0.5, ease: ease() }, at + 0.1)
        tl.to([p.label, p.open].filter(Boolean), { opacity: 1, duration: 0.3 }, at + 0.35)
      })
    },
    { threshold: 0.25 },
  )
  arrive.observe(root)
}
