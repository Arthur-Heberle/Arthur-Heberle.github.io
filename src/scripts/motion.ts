// The single scroll authority and the matchMedia scaffold — docs/motion-spec.md.
// Exactly one Lenis instance and exactly one gsap.ticker hook exist in this codebase and
// both are here. Step 07 is wiring only: nothing in this file animates, and the three
// matchMedia branches are deliberately empty until steps 08-13 fill them.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, Flip)

// respectReducedMotion defaults to true: under prefers-reduced-motion: reduce Lenis forces
// lerp to 1 and makes programmatic scrolls jump instantly. So the instance is created
// unconditionally — as motion-spec.md writes it — and still honours the degradation
// contract without a guard of our own.
export const lenis = new Lenis()

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0) // required, or scroll-linked tweens lag the scroll position

/** Nudge scroll by `delta` px with no animation. Lenis owns scroll position from here on,
 *  so window.scrollBy would fight it. Used by Archive.astro's filter/show-all compensation. */
export function scrollByPx(delta: number) {
  lenis.scrollTo(lenis.actualScroll + delta, { immediate: true })
}

const mm = gsap.matchMedia()

mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  // steps 08-13: tier 2 reveals, tier 1 scrubbed drawing, leader lines, Flip, hero,
  // and the one pinned set-piece. Cleanup is automatic on revert.
})

mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
  // steps 08-13: scrubbed rule + tier 2 reveals only. Never pinned, no leader lines.
})

mm.add('(prefers-reduced-motion: reduce)', () => {
  // Final states, nothing animates. toArray guards the empty selector — gsap.set on a
  // selector matching nothing logs a "target not found" warning, and step 06's gate
  // expects a clean console. No [data-anim] exists until step 08; this is a no-op today.
  const anim = gsap.utils.toArray<HTMLElement>('[data-anim]')
  if (anim.length) gsap.set(anim, { clearProps: 'all' })
})
