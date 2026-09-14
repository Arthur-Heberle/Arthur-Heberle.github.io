# Motion spec

Read before steps 7–13. The code below is the intended implementation, not an example to
improvise around. Where a value is given, use that value.

---

## Three tiers

**Tier 1, scrubbed.** Tied to scroll position. Reversible. Stops where the reader stops.
The drawing layer only: the rule descending the page, leader lines, build progress,
parallax depth. **Never text.** Scrubbed text jitters on trackpads and fights reading.

**Tier 2, triggered.** Fires once on arrival, plays itself, never reverses, never
replays. Content: text blocks, section headers, margin notes.

**Tier 3, set-pieces.** Longer sequences owning a section. At most one pinned per page.

---

## Values

| Thing | Value |
|---|---|
| triggered ease | `cubic-bezier(0.22, 1, 0.36, 1)` |
| scrubbed ease | `none` — always linear |
| interactive feedback | 120ms |
| reveal duration | 600ms |
| sibling stagger | 60ms |
| margin note lag | 200ms after its paragraph |
| drawing layer scrub | `0.8` — never `true` |
| reveal trigger point | element top crossing 85% viewport height |
| hero sequence total | ≤ 1.6s |
| Flip duration | ≤ 400ms |

Two durations and one curve for everything in tier 2. Resist adding a third.

---

## Animatable properties

`transform`, `opacity`, `stroke-dashoffset` only.

Never `width`, `height`, `top`, `left`, `color`, `background`, `box-shadow`, `filter`,
`blur`. This is a hard constraint: breaking it drops frames, and motion below 60fps feels
worse than no motion at all.

---

## One scroll authority

Lenis owns scroll position and drives GSAP. Exactly one Lenis instance and one ticker
hook in the entire codebase. No second smooth-scroll library, no nested instance, no
separate `requestAnimationFrame` loop anywhere.

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, Flip)

const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

`lagSmoothing(0)` is required, otherwise scroll-linked animations lag behind the scroll
position.

---

## The initial-state pattern

This is the single most important structural decision in the motion layer.

Markup ships every element and every SVG in its **final** state. JavaScript sets initial
states on load. Never the reverse.

```js
// correct
gsap.set('[data-anim]', { y: 16, opacity: 0 })

// wrong: CSS hiding what JS will reveal
// .anim { opacity: 0 }   <-- a visitor without JS sees nothing
```

Consequences, all required: a visitor with JS disabled sees a complete, readable page. A
visitor with reduced motion sees a complete page. A failed GSAP load degrades to a
static site rather than a blank one.

---

## matchMedia scaffold

Every animation lives inside `gsap.matchMedia()`. Nothing outside it. This is what makes
reduced motion and mobile degradation structural rather than retrofitted.

```js
const mm = gsap.matchMedia()

// desktop, motion allowed: everything
mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  // tier 1 scrubbed drawing, tier 2 reveals, pinned set-pieces
  return () => { /* cleanup is automatic on revert */ }
})

// small screens, motion allowed: no pinning, no leader lines
mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
  // scrubbed rule only, plus tier 2 reveals
})

// reduced motion, any width: final states, nothing animates
mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.set('[data-anim]', { clearProps: 'all' })
  // draw the rule fully, render set-pieces in final state
})
```

Degradation contract:

| Context | Behaviour |
|---|---|
| reduced motion | all final states, no scrub, no pin, no reveals, filter cross-fades |
| below 768px | unpinned, no leader lines, set-pieces static, scrubbed rule kept |
| JS disabled | identical to the step 06 static site |

---

## Tier 2 reveals

```js
gsap.utils.toArray('[data-anim]').forEach((el) => {
  gsap.from(el, {
    y: 16,
    opacity: 0,
    duration: 0.6,
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    delay: el.dataset.delay ? parseFloat(el.dataset.delay) : 0,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  })
})
```

`once: true` is what stops replay on scroll-back. Margin notes carry
`data-delay="0.2"`.

Archive rows get **no** `data-anim`. Animating twenty list items in sequence is the most
common mistake in this genre.

---

## Tier 1 drawing layer

```js
gsap.from('#rule path', {
  drawSVG: '0%',
  ease: 'none',
  scrollTrigger: {
    trigger: 'main',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    invalidateOnRefresh: true,
  },
})
```

`DrawSVGPlugin` reveals a stroke by controlling `stroke-dashoffset` and
`stroke-dasharray`, so the path needs an actual `stroke` and `stroke-width` set in CSS or
as SVG attributes first, or nothing will appear.

`invalidateOnRefresh: true` is required, otherwise resizing breaks the mapping.

Leader lines use the same approach with their own triggers, one per marker.

---

## Archive filter, Flip

```js
const state = Flip.getState('.archive-row')
// mutate the DOM: apply the filter
Flip.from(state, { duration: 0.4, ease: 'cubic-bezier(0.22, 1, 0.36, 1)', absolute: true })
```

Guard against rapid clicking so rows aren't left stranded mid-flight. Focus must not be
lost during the animation.

---

## Hero sequence

Once per session, ≤1.6s, and non-blocking.

```js
if (!sessionStorage.getItem('hero-played')) {
  // timeline: origin marks, construction lines, display line per word, rule starts
  sessionStorage.setItem('hero-played', '1')
}
```

The display line and the contact link must be present and readable if this never runs.
`SplitText` on the display line only, split **per word, not per character**. Per
character is everywhere now and reads as a default.

---

## Pinning

At most one pinned ScrollTrigger per page, and only inside a set-piece.

Pinning eats scroll length, is the worst offender on touch devices, and causes scroll
jumps when a page is refreshed mid-scroll. Below 768px, nothing is ever pinned.

---

## Checklist before calling any motion step done

- [ ] scroll down, up, down again: nothing replays
- [ ] reduced motion: page appears identical to the static build
- [ ] JS disabled: page appears identical to the static build
- [ ] trackpad scroll: no jitter in scrubbed elements
- [ ] window resize: scrubbed mappings recalculate
- [ ] only `transform`, `opacity`, `stroke-dashoffset` in tween properties
- [ ] one Lenis instance, one ticker hook
- [ ] iOS Safari: no scroll fighting, no pin breakage
