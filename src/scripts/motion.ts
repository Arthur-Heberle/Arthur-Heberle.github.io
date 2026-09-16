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

const SCRUB = 0.8 // motion-spec.md's value. Never `true`.
const TICK_DRAW_PX = 80 // scroll distance over which one tick draws
const LEADER_DRAW_PX = 120 // a leader is ~4x a tick's length; it earns a longer draw window
const RULE_LENGTH = 100 // #rule path's exact length in user units (d="M0.5 0 V100")

// Resolved once, guarded: motion.ts loads on every page via Base.astro, and /type-test
// has no rule. `.page-main`, not a bare `main` — progress.md already logged that a bare
// element selector reaches /type-test's own unrelated <main>.
const rulePath = document.querySelector<SVGPathElement>('#rule path')
const pageMain = rulePath?.closest<HTMLElement>('.page-main') ?? null

/** Tier 1: the page rule, scrubbed to scroll position (docs/motion-spec.md). Reversible by
 *  design — scrolling up runs the drawing backwards — so it needs no data-anim-played
 *  guard; a matchMedia rebuild re-derives the correct state from the current scroll
 *  position. `ease: 'none'`: an eased scrub feels broken (design-spec §8).
 *
 *  Bypasses DrawSVGPlugin on purpose — measured in-browser, not assumed: removing
 *  `vector-effect="non-scaling-stroke"` from `#rule path` (so DrawSVGPlugin's own
 *  getTotalLength()-based measurement, which otherwise mis-scales ~30x inside this
 *  non-proportional `viewBox="0 0 1 100"` box, works) makes Lighthouse mobile CLS jump
 *  0.004 -> 0.089 and performance drop from 94 to ~91 — confirmed by bisection, reverting
 *  only that one attribute restores baseline CLS with everything else unchanged. The
 *  attribute has to stay. So the rule skips DrawSVGPlugin's automatic measurement
 *  entirely: the path's length is exactly 100 user units by construction
 *  (`d="M0.5 0 V100"`, RULE_LENGTH), so `strokeDasharray` is set once to that fixed value
 *  and only `strokeDashoffset` is tweened — the classic length-100 line-draw technique,
 *  and literally the one property CLAUDE.md's animate-only list names. gsap.fromTo()
 *  keeps the initial-state pattern: both ends are set in the one call, so a failed GSAP
 *  load leaves the markup's already fully-drawn rule (`strokeDasharray` never applies
 *  without this script running). `.tick` keeps DrawSVGPlugin — its 1:1 viewBox is exactly
 *  the proportional case the plugin measures correctly (see Rule.astro). */
function tier1Rule(rule: SVGPathElement, main: HTMLElement) {
  gsap.set(rule, { strokeDasharray: RULE_LENGTH })
  gsap.fromTo(
    rule,
    { strokeDashoffset: RULE_LENGTH },
    {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: main,
        start: 'top top',
        end: 'bottom bottom',
        scrub: SCRUB,
        invalidateOnRefresh: true, // required, or resizing breaks the mapping
      },
    },
  )
}

/** Scroll position at which the rule's own drawn tip reaches `el`'s vertical centre. The
 *  rule is drawn `p` of its own length at scroll progress `p`, and the trigger's range is
 *  `mainTop -> mainTop + (mainH - vh)`, so the drawn tip sits `p * vh` below the viewport
 *  top — near the top of the screen early on the page, near the bottom at the end. A
 *  trigger keyed to the element's own arrival (e.g. `top 90%`) would therefore draw it
 *  hundreds of px below the line meant to be drawing it, early in the page. Inverting for
 *  an element at document position T: f = (T - mainTop) / mainH is its fraction along the
 *  rule, and mainTop + f * (mainH - vh) is the scroll position when the tip reaches it.
 *
 *  Extracted in step 10 (was inline in tier1Ticks() since step 09) so ticks and leader
 *  lines share one derivation and can't drift apart. Returned as a closure, not a plain
 *  number: both callers pass it straight to ScrollTrigger's function-valued start/end,
 *  which are absolute scroll positions (ScrollTrigger.js's _parsePosition skips
 *  element-bounds parsing for a function returning a number) re-evaluated on every
 *  refresh — what keeps them right across resize and the archive filter's height changes. */
function tipScrollFor(el: Element, main: HTMLElement, drawPx: number) {
  return () => {
    const mainBox = main.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    // Lenis drives real window scroll, so window.scrollY is the true position here.
    const mainTop = mainBox.top + window.scrollY
    const centre = box.top + box.height / 2 + window.scrollY
    const f = gsap.utils.clamp(0, 1, (centre - mainTop) / main.offsetHeight)
    const at = mainTop + f * (main.offsetHeight - window.innerHeight)
    // Same lesson as step 08's clamp(): a start position past the scroller's real max is
    // simply never reached, and the element would sit undrawn forever.
    return Math.min(at, ScrollTrigger.maxScroll(window) - drawPx)
  }
}

/** Tier 1: the section ticks, each drawn at the scroll position where the rule's own drawn
 *  tip passes it — see tipScrollFor() above for why this, not the tick's own arrival. */
function tier1Ticks(main: HTMLElement) {
  gsap.utils.toArray<SVGSVGElement>('.tick').forEach((tick) => {
    const path = tick.querySelector('path')
    if (!path) return
    const at = tipScrollFor(tick, main, TICK_DRAW_PX)
    gsap.from(path, {
      drawSVG: '0%',
      ease: 'none',
      scrollTrigger: {
        trigger: tick,
        start: at,
        end: () => at() + TICK_DRAW_PX,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    })
  })
}

/** Tier 1: the five leader lines, each drawn as the rule's own drawn tip passes it — the
 *  line branches out of the rule rather than arriving with its note (same tip-sync
 *  geometry as tier1Ticks(), see tipScrollFor()).
 *
 *  Bypasses DrawSVGPlugin, like tier1Rule() — measured live, not assumed from the viewBox
 *  math alone (docs/plans/step-09.md's mistake the first time around, corrected here
 *  before it shipped): `.leader`'s 32x24 viewBox and its `aspect-ratio: 4/3` CSS box are
 *  proportional on paper, but getScreenCTM() on the built page returns scaleX/scaleY that
 *  differ at the 4th decimal (~0.7499 vs ~0.7498) from ordinary subpixel layout rounding —
 *  DrawSVGPlugin.js:146 rounds to exactly 4 decimals and fires its "length cannot be
 *  measured" warning on precisely that gap. `.tick` has no such gap (`width: 8px` against
 *  `aspect-ratio: 1` forces literal width===height in pixels, not just a ratio, so
 *  scaleX === scaleY exactly) and stays on DrawSVGPlugin, unaffected.
 *
 *  The gap is small enough here not to visibly mis-scale the draw the way the rule's ~30x
 *  gap did, but the console warning alone fails the clean-console gate, so leaders use the
 *  rule's own hand-measured strokeDasharray/strokeDashoffset technique instead of drawSVG.
 *  Each path's length comes from the native, CTM-independent getTotalLength() (SVG path
 *  length is defined in user-space units and untouched by vector-effect or any transform)
 *  rather than a hardcoded constant — cheap, and avoids transcribing an irrational number
 *  (18 + sqrt(14^2 + 8^2)) by hand. `.leader-base` and `.leader-hi` share one identical
 *  `d`, so one length serves both, and one tween moves both — the highlight can never be
 *  drawn ahead of the construction line beneath it. */
function tier1Leaders(main: HTMLElement) {
  gsap.utils.toArray<SVGSVGElement>('.leader').forEach((leader) => {
    const paths = Array.from(leader.querySelectorAll<SVGPathElement>('path'))
    if (!paths.length) return
    const length = paths[0].getTotalLength()
    gsap.set(paths, { strokeDasharray: length })
    const at = tipScrollFor(leader, main, LEADER_DRAW_PX)
    gsap.fromTo(
      paths,
      { strokeDashoffset: length },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: leader,
          start: at,
          end: () => at() + LEADER_DRAW_PX,
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      },
    )
  })
}

const FLIP_DURATION = 0.4 // motion-spec.md: Flip duration <= 400ms
const FADE_FEEDBACK = 0.12 // tokens.css --dur-feedback; the reduced-motion cross-fade

type FilterTransition = (mutate: () => void) => void

// Keyed by branch, not a single mutable variable: crossing 768px fires two matchMedia
// listeners (one branch stopping, one starting), and whichever cleanup happens to run
// last would otherwise clobber the other's registration. Distinct keys make the result
// order-independent. Both no-preference branches register the identical function under
// 'motion', so their relative order never matters; 'reduce' is checked first so reduced
// motion always wins regardless of registration order.
const filterTransitions = new Map<string, FilterTransition>()

function registerFilterTransition(key: string, fn: FilterTransition) {
  filterTransitions.set(key, fn)
  return () => filterTransitions.delete(key)
}

/** Archive.astro's one entry point for a filter/show-all change. Runs whichever
 *  transition the active matchMedia branch registered, or the bare mutation if none has
 *  (no branch matched yet, or GSAP failed to load) — the filter must keep working either
 *  way (motion-spec.md's initial-state pattern: a failed GSAP load degrades gracefully). */
export function filterTransition(mutate: () => void) {
  const run = filterTransitions.get('reduce') ?? filterTransitions.get('motion')
  run ? run(mutate) : mutate()
}

/** Full-motion archive filter (step 11, docs/motion-spec.md's Flip snippet). Surviving
 *  rows travel to their new position; a row leaving the filtered set just disappears
 *  (Flip splices unchanged/entering/leaving comps out of the tweened set on its own,
 *  Flip.js:640-697, so "no exit animation" costs nothing extra here) and a row newly
 *  matching fades in via onEnter, which Flip adds into its own timeline at time 0
 *  (Flip.js:322) — so it can't be left stranded mid-fade by a second click.
 *
 *  No `absolute: true` (motion-spec.md's literal value): verified live that it makes
 *  every row position: absolute for the flight (Flip.js:257's _filterComps short-circuits
 *  entirely when the option is `true`), collapsing <ul>'s height to zero and visibly
 *  dropping everything below the archive (show-all button, changelog, contact) for
 *  400ms. With this step's decided enter/leave behaviour no row is ever painted outside
 *  the document flow, so the option buys nothing here and costs a full-page reflow.
 *
 *  No manual rapid-click guard needed: Flip.getState() calls FlipState.update(), which
 *  runs this.interrupt() (Flip.js:937) and force-completes any in-progress flip on these
 *  targets before recording new state (Flip.js:881-894) — a second click always starts
 *  from clean, settled values. */
function flipFilter(mutate: () => void) {
  const state = Flip.getState('.archive-row')
  mutate()
  Flip.from(state, {
    duration: FLIP_DURATION,
    ease: EASE_OUT,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: FLIP_DURATION, ease: EASE_OUT }),
  })
}

/** Reduced-motion archive filter: motion-spec.md's degradation table calls for "filter
 *  cross-fades" here. Kept fully separate from flipFilter() rather than a shared function
 *  with a conditional duration — the spec's two-durations-and-one-curve rule
 *  (motion-spec.md:36) means this uses FADE_FEEDBACK (120ms, tokens.css --dur-feedback),
 *  not FLIP_DURATION, since this is post-click feedback, not a reveal. No travel, no
 *  exit animation — only newly-visible rows fade in. `overwrite: true` stands in for
 *  flipFilter's Flip.getState()-driven interrupt, since there's no Flip call here to do
 *  it: a second rapid click must overwrite (not stack onto) a fade already in flight on
 *  the same rows. */
function crossfadeFilter(mutate: () => void) {
  const rows = gsap.utils.toArray<HTMLElement>('.archive-row')
  const wasHidden = rows.map((row) => row.hidden)
  mutate()
  const entering = rows.filter((row, i) => wasHidden[i] && !row.hidden)
  if (entering.length) {
    gsap.fromTo(
      entering,
      { opacity: 0 },
      { opacity: 1, duration: FADE_FEEDBACK, ease: EASE_OUT, overwrite: true, clearProps: 'opacity' },
    )
  }
}

const mm = gsap.matchMedia()

mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', (ctx) => {
  tier2Reveals(true)
  if (rulePath && pageMain) {
    tier1Rule(rulePath, pageMain)
    tier1Ticks(pageMain)
    tier1Leaders(pageMain)
  }
  // step 11: the click-triggered filter transition also lives inside matchMedia
  // (motion-spec.md:100, "nothing outside it") via ctx.add(), which wraps flipFilter so
  // every tween it creates at click time is tracked by this branch's Context and
  // reverted with it if the branch stops matching mid-flight.
  return registerFilterTransition('motion', ctx.add('archiveFilter', flipFilter) as FilterTransition)
  // steps 12-13: hero, and the one pinned set-piece.
})

mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', (ctx) => {
  tier2Reveals(false)
  // design-spec.md §8: below 768px the drawing layer keeps the scrubbed rule only — no
  // ticks (.tick is display:none there anyway, so tier1Ticks is skipped, not just hidden)
  // and no leader lines (motion-spec.md's degradation contract; .leader is also
  // display:none there — creating the tween anyway would warn on an unmeasurable
  // hidden element, DrawSVGPlugin.js:109).
  if (rulePath && pageMain) tier1Rule(rulePath, pageMain)
  // step 11: Flip runs at this width too — motion-spec.md's degradation contract strips
  // pinning, leader lines and set-pieces below 768px, not the filter transition, and the
  // filter is a click-triggered interaction, not a scroll-linked one.
  return registerFilterTransition('motion', ctx.add('archiveFilter', flipFilter) as FilterTransition)
  // steps 12-13: never pinned here either.
})

mm.add('(prefers-reduced-motion: reduce)', (ctx) => {
  // Final states, nothing animates. toArray guards the empty selector — gsap.set on a
  // selector matching nothing logs a "target not found" warning, and step 06's gate
  // expects a clean console. Also clears any inline style left behind if the reader
  // toggles reduced motion on mid-session, after the no-preference branch already ran
  // reveals and reverted.
  const anim = gsap.utils.toArray<HTMLElement>('[data-anim]')
  if (anim.length) gsap.set(anim, { clearProps: 'all' })
  // Same, for tier 1: a reader who toggles reduced motion on mid-scroll, after the scrub
  // branch already wrote inline dash styles, must see the rule and ticks snap to fully
  // drawn rather than being stranded mid-draw. These three properties are exactly what
  // DrawSVG's own style-saver tracks.
  const drawn = gsap.utils.toArray<SVGPathElement>('#rule path, .tick path, .leader path')
  if (drawn.length) gsap.set(drawn, { clearProps: 'strokeDasharray,strokeDashoffset,strokeMiterlimit' })
  return registerFilterTransition('reduce', ctx.add('archiveFilter', crossfadeFilter) as FilterTransition)
})
