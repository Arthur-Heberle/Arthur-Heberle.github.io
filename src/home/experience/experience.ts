// The experience section's motion, loaded when the section nears the viewport (Experience.astro).
// Only transform, opacity and stroke-dashoffset. Nothing loops and nothing is pinned or hijacked: the page
// scrolls normally. Every part shows its final state at rest.
//
// With the stage (900px and up, JavaScript): the text block in the middle band of the viewport becomes the
// active one, its object slides onto the stage (CSS, on [data-state]) and its action plays the first time
// only; later visits show the final state. Below 900px each object's action plays once as it scrolls into
// view. Reduced motion gets final states only, and the swaps are instant (CSS).
import { gsap } from 'gsap'
import { lenis } from '../../shared/motion'

// motion.ts's one curve (the CustomEase 'reveal'), by name; power4.out is the same shape if
// motion.ts has not registered it yet.
const ease = () => gsap.parseEase('reveal') ?? 'power4.out'

// ---- the four objects' actions ----
// Each is `{ reset, run }`: reset puts the object at the start of its action, run returns the timeline
// that plays it and leaves the object on its final state (the resting markup).
type Action = { reset: () => void; run: () => gsap.core.Timeline }

const CLEAR = 'transform,opacity,strokeDasharray,strokeDashoffset'

/** Strokes that draw in: dasharray set to their length, offset from the length to 0. */
function strokes(paths: SVGGeometryElement[]) {
  const lens = paths.map((p) => p.getTotalLength())
  return {
    reset: () =>
      paths.forEach((p, i) => {
        p.style.strokeDasharray = String(lens[i])
        p.style.strokeDashoffset = String(lens[i])
      }),
    draw: (tl: gsap.core.Timeline, at: number, duration: number, stagger = 0) =>
      tl.to(paths, { strokeDashoffset: 0, duration, ease: ease(), stagger }, at),
  }
}

const all = <T extends Element>(root: Element, s: string) => [...root.querySelectorAll<T>(s)]

function chalkboard(root: HTMLElement): Action {
  const lineEls = all<SVGGeometryElement>(root, '.ch-line')
  const lines = strokes(lineEls)
  const hatchEls = all<SVGPathElement>(root, '.ch-hatch')
  const hatch = strokes(hatchEls)
  const texts = all<SVGTextElement>(root, '.ch-tx')
  const marks = [...lineEls, ...hatchEls, ...texts]
  return {
    reset: () => {
      lines.reset()
      hatch.reset()
      gsap.set(texts, { opacity: 0 })
    },
    run: () => {
      const tl = gsap.timeline({ onComplete: () => gsap.set(marks, { clearProps: CLEAR }) })
      // the curve, the axes and the surface are drawn, the area is hatched left to right, then the formulas are written
      lines.draw(tl, 0, 0.8, 0.05)
      hatch.draw(tl, 1.0, 0.25, 0.03)
      tl.to(texts, { opacity: 1, duration: 0.3, stagger: 0.18 }, 1.6)
      return tl
    },
  }
}

function laptop(root: HTMLElement): Action {
  const boxes = all<SVGGElement>(root, '.un-box')
  const lines = all<SVGPathElement>(root, '.un-inh, .un-ptr')
  const inh = strokes(all<SVGPathElement>(root, '.un-inh'))
  const tri = all<SVGPathElement>(root, '.un-tri')
  const ptr = strokes(all<SVGPathElement>(root, '.un-ptr'))
  const code = all<SVGTextElement>(root, '.un-code text')
  // Entity, then the two classes that inherit from it, then Level, which holds a pointer to an Entity
  const order = [boxes[1], boxes[2], boxes[3], boxes[0]]
  const touched = [...boxes, ...tri, ...lines, ...code]
  return {
    reset: () => {
      gsap.set([...boxes, ...tri, ...code], { opacity: 0 })
      inh.reset()
      ptr.reset()
    },
    run: () => {
      const tl = gsap.timeline({ onComplete: () => gsap.set(touched, { clearProps: CLEAR }) })
      tl.to(order, { opacity: 1, duration: 0.3, stagger: 0.28 }, 0)
      inh.draw(tl, 1.2, 0.6, 0.15)
      tl.to(tri, { opacity: 1, duration: 0.2 }, 1.6)
      ptr.draw(tl, 2.0, 0.6)
      tl.to(code, { opacity: 1, duration: 0.25, stagger: 0.18 }, 2.6)
      return tl
    },
  }
}

function analyzer(root: HTMLElement): Action {
  const q = <T extends Element>(s: string) => root.querySelector<T>(s)!
  const lids = all<SVGGElement>(root, '.an-ct-lid')
  const open = (lid: SVGGElement) => ({ rotation: -58, svgOrigin: `${lid.dataset.hx} ${lid.dataset.hy}` })
  const btn = q<SVGGElement>('.an-btn')
  const reads = all<SVGGElement>(root, '.an-r')
  const before = strokes([q<SVGPathElement>('.mc-before')])
  const after = strokes([q<SVGPathElement>('.mc-after')])
  const gap = q<SVGPathElement>('.mc-gap')
  const labels = ['before', 'after', 'savings'].map((l) => q<SVGTextElement>(`[data-l="${l}"]`))
  const touched = [...lids, btn, ...reads, q('.mc-before'), q('.mc-after'), gap, ...labels]
  return {
    reset: () => {
      lids.forEach((lid) => gsap.set(lid, open(lid)))
      gsap.set(reads, { opacity: 0 })
      before.reset()
      after.reset()
      gsap.set(gap, { scaleX: 0, opacity: 0 })
      gsap.set(labels, { opacity: 0 })
    },
    run: () => {
      const tl = gsap.timeline({ onComplete: () => gsap.set(touched, { clearProps: CLEAR }) })
      // the current transformers close around their cables, one after the other
      lids.forEach((lid, i) => tl.to(lid, { rotation: 0, duration: 0.4, ease: ease() }, 0.1 + i * 0.25))
      // the DISPLAY button presses once for each reading
      reads.forEach((r, i) => {
        const at = 1.0 + i * 0.7
        tl.to(btn, { scale: 0.84, svgOrigin: '113 47', duration: 0.08 }, at - 0.1)
        tl.to(btn, { scale: 1, duration: 0.14 }, at - 0.02)
        if (i) tl.set(reads[i - 1], { opacity: 0 }, at)
        tl.set(r, { opacity: 1 }, at)
      })
      // then the before/after chart: the baseline, "after", the gap between them, "savings"
      const c = 1.0 + reads.length * 0.7 + 0.2
      before.draw(tl, c, 0.6)
      tl.to(labels[0], { opacity: 1, duration: 0.3 }, c + 0.5)
      after.draw(tl, c + 0.7, 0.9)
      tl.to(labels[1], { opacity: 1, duration: 0.3 }, c + 1.4)
      tl.to(gap, { scaleX: 1, opacity: 1, duration: 0.6, ease: ease() }, c + 1.7)
      tl.to(labels[2], { opacity: 1, duration: 0.3 }, c + 2.1)
      return tl
    },
  }
}

function monitor(root: HTMLElement): Action {
  const view = root.querySelector<SVGGElement>('.rp-view')!
  const loops = all<SVGGeometryElement>(root, '.rp-loop')
  // the loops of one layer are drawn together
  const layers: SVGGeometryElement[][] = []
  loops.forEach((l) => (layers[+(l.dataset.k ?? 0)] ??= []).push(l))
  const draws = layers.map((ls) => strokes(ls))
  // the printer builds the same part, in step with the monitor's layers
  const pops = all<HTMLElement>(root, '.pr-pop')
  const infill = pops.map((p) => strokes(all<SVGPathElement>(p, '.pr-fill')))
  const gantry = root.querySelector<HTMLElement>('.pr-gantry')!
  const fills = all(root, '.pr-fill')
  const TURN = 0.9
  const STEP = 0.14
  return {
    reset: () => {
      draws.forEach((d) => d.reset())
      gsap.set(pops, { scale: 0 })
      infill.forEach((s) => s.reset())
      gsap.set(gantry, { z: 14 })
    },
    run: () => {
      const tl = gsap.timeline({
        onComplete: () => gsap.set([...loops, view, ...pops, gantry, ...fills], { clearProps: CLEAR }),
      })
      // the view turns slightly, once
      tl.to(view, { skewX: -6, scaleX: 0.95, svgOrigin: '100 80', duration: TURN / 2, ease: 'power2.inOut' }, 0)
      tl.to(view, { skewX: 0, scaleX: 1, duration: TURN / 2, ease: 'power2.inOut' }, TURN / 2)
      // then the layers rise, one at a time from the bottom
      draws.forEach((d, k) => d.draw(tl, TURN + k * STEP, 0.3))
      // the printer: one of its layers for every few of the monitor's
      const span = draws.length * STEP
      pops.forEach((pop, i) => {
        const at = TURN + (i * span) / pops.length
        tl.to(pop, { scale: 1, duration: 0.2, ease: ease() }, at)
        infill[i].draw(tl, at + 0.1, 0.3, 0.02)
      })
      tl.to(gantry, { z: 34, duration: span, ease: 'none' }, TURN)
      return tl
    },
  }
}

const ACTIONS: Record<string, (root: HTMLElement) => Action> = {
  'calculus-ii': chalkboard,
  'eletron-energia': analyzer,
  'programming-techniques': laptop,
  rp3: monitor,
}

export function initExperience(grid: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const wide = matchMedia('(min-width: 900px)')
  const staged = () => wide.matches && document.documentElement.classList.contains('js')
  const blocks = all<HTMLElement>(grid, '.xp-block')
  const links = all<HTMLAnchorElement>(grid, '.xp-link')
  const stageFigs = all<HTMLElement>(grid, '.xp-fig-stage')
  const artFigs = all<HTMLElement>(grid, '.xp-fig-art')
  const visibleFigs = () => (staged() ? stageFigs : artFigs)

  // an experience's action plays the first time it is shown; one action instance per drawing
  const played = new Set<string>()
  const actions = new Map<HTMLElement, Action>()
  const actionFor = (fig: HTMLElement) => {
    let a = actions.get(fig)
    if (!a) {
      a = ACTIONS[fig.dataset.obj ?? '']?.(fig)
      if (a) actions.set(fig, a)
    }
    return a
  }
  const play = (fig: HTMLElement) => {
    const id = fig.dataset.obj ?? ''
    if (reduced || played.has(id)) return
    const a = actionFor(fig)
    if (!a) return
    played.add(id)
    a.run()
  }
  // an action still waiting at its start state goes straight to its final state
  const settle = () => {
    visibleFigs().forEach((fig) => {
      const id = fig.dataset.obj ?? ''
      if (played.has(id)) return
      played.add(id)
      actionFor(fig)?.run().progress(1, false)
    })
  }

  // everything waits at its start until it is shown
  const prepare = () => {
    if (reduced) return
    visibleFigs().forEach((fig) => {
      if (!played.has(fig.dataset.obj ?? '')) actionFor(fig)?.reset()
    })
  }
  prepare()
  wide.addEventListener('change', () => {
    settle()
    if (staged()) setActive(active, true)
  })

  // ---- the stage: the block in the middle band is the active one ----
  let active = 0
  let seen = false
  const setActive = (i: number, force = false) => {
    if (i === active && !force) return
    active = i
    stageFigs.forEach((fig, j) => (fig.dataset.state = j === i ? 'on' : j < i ? 'after' : 'before'))
    links.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')))
    if (seen && staged()) {
      // let the incoming object land before its action starts
      window.setTimeout(() => active === i && play(stageFigs[i]), reduced ? 0 : 250)
    }
  }
  setActive(0, true)

  const band = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(blocks.indexOf(e.target as HTMLElement))
      })
    },
    { rootMargin: '-45% 0px -45% 0px' },
  )
  blocks.forEach((b) => band.observe(b))

  // the first experience plays when the stage is first in view
  const stageEl = grid.querySelector<HTMLElement>('.xp-stage')!
  const stageSeen = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      stageSeen.disconnect()
      seen = true
      if (staged()) play(stageFigs[active])
    },
    { threshold: 0.6 },
  )
  stageSeen.observe(stageEl)

  // ---- below 900px: each object plays once as it scrolls into view ----
  const artSeen = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting || staged()) return
        artSeen.unobserve(e.target)
        play(e.target as HTMLElement)
      }),
    { threshold: 0.6 },
  )
  artFigs.forEach((fig) => artSeen.observe(fig))

  // ---- the timeline links: a smooth scroll to the block (instant under reduced motion) ----
  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.getElementById(a.getAttribute('href')!.slice(1))
      if (!target) return
      e.preventDefault()
      const offset = -Math.max(0, (window.innerHeight - target.offsetHeight) / 2)
      lenis.scrollTo(target, { offset, immediate: reduced })
      history.replaceState(null, '', a.getAttribute('href'))
      target.focus({ preventScroll: true })
    }),
  )
}
