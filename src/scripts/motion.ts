// The single scroll authority and the matchMedia scaffold — docs/motion-spec.md.
// Exactly one Lenis instance and exactly one gsap.ticker hook exist in this codebase and
// both are here. Step 07 was wiring only; step 08 adds the first real animation, the
// tier 2 triggered-reveal system.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, Flip, CustomEase)

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

/** Recompute every ScrollTrigger's start/end. Required after script-driven DOM mutation
 *  that changes document height — ScrollTrigger's own autoRefreshEvents cover load and
 *  resize, not a filter click. Used by Archive.astro after applyState() shows/hides rows. */
export function refreshTriggers() {
  ScrollTrigger.refresh()
}

/** The one triggered curve (docs/motion-spec.md's values table). motion-spec writes it as
 *  the CSS string `cubic-bezier(0.22, 1, 0.36, 1)`, which GSAP cannot parse —
 *  gsap.parseEase(that string) returns undefined and a tween using it silently falls back
 *  to power1.out, not the specified curve (confirmed against the installed gsap@3.15.0).
 *  This is the identical control points in the SVG-path form CustomEase does parse.
 *  Exported so steps 11-13 reuse this one definition rather than restating the curve. */
export const EASE_OUT = CustomEase.create('reveal', 'M0,0 C0.22,1 0.36,1 1,1')

/** Tier 2: triggered reveals. Fires once on arrival, plays itself, never reverses, never
 *  replays (docs/motion-spec.md). Values are the spec's: y 16, 600ms, EASE_OUT, trigger at
 *  top 85%. gsap.from() with its default immediateRender is what implements the
 *  initial-state pattern here: JS sets {y:16, opacity:0} and creates the tween that undoes
 *  it in the same call, so there is no separate gsap.set that could hide content a failed
 *  trigger never reveals.
 *
 *  `scoped` reflects the layout, not a preference. At >=768px a .rail puts its paragraph
 *  and its margin notes side by side with a shared top edge, so every [data-anim] inside
 *  one triggers off the rail ([data-anim-scope]) and the 200ms margin-note lag is literally
 *  a lag behind its own paragraph's arrival. Below 768px .rail collapses to one column and
 *  the notes stack under the prose (type.css), where a shared trigger would fire them
 *  while still below the fold — so each element triggers on its own arrival instead.
 *
 *  data-anim-played survives a matchMedia revert: crossing 768px, or toggling reduced
 *  motion, reverts this branch and recreates it, and without the flag every reveal already
 *  scrolled past would animate a second time. "Never replays" stays structural rather than
 *  relying on ScrollTrigger's own once:true, which is scoped to one branch's lifetime. */
function tier2Reveals(scoped: boolean) {
  gsap.utils.toArray<HTMLElement>('[data-anim]').forEach((el) => {
    if (el.dataset.animPlayed) return
    const scope = scoped ? el.closest<HTMLElement>('[data-anim-scope]') : null
    gsap.from(el, {
      y: 16,
      opacity: 0,
      duration: 0.6,
      ease: EASE_OUT,
      delay: el.dataset.delay ? parseFloat(el.dataset.delay) : 0,
      onComplete: () => {
        el.dataset.animPlayed = '1'
      },
      // clamp(): a plain 'top 85%' can compute a start position beyond the page's actual
      // max scroll for an element close to the true bottom (confirmed against this
      // element's own trigger, in-browser — Contact's paragraph, the last content block
      // with only the email link and padding beneath it, never fired without this).
      // clamp() is GSAP's own documented fix, confirmed in node_modules/gsap/ScrollTrigger.js
      // (the _startClamp path): it constrains the calculated start to the scroller's real
      // bounds instead of leaving it unreachable. No effect on any interior element, where
      // the unclamped position was already in range.
      scrollTrigger: { trigger: scope ?? el, start: 'clamp(top 85%)', once: true },
    })
  })
}

const mm = gsap.matchMedia()

mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  tier2Reveals(true)
  // steps 09-13: tier 1 scrubbed drawing, leader lines, Flip, hero, and the one pinned
  // set-piece. Cleanup is automatic on revert.
})

mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
  tier2Reveals(false)
  // steps 09-13: scrubbed rule only. Never pinned, no leader lines.
})

mm.add('(prefers-reduced-motion: reduce)', () => {
  // Final states, nothing animates. toArray guards the empty selector — gsap.set on a
  // selector matching nothing logs a "target not found" warning, and step 06's gate
  // expects a clean console. Also clears any inline style left behind if the reader
  // toggles reduced motion on mid-session, after the no-preference branch already ran
  // reveals and reverted.
  const anim = gsap.utils.toArray<HTMLElement>('[data-anim]')
  if (anim.length) gsap.set(anim, { clearProps: 'all' })
})
