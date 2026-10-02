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
  // the current transformers' lids hinge about their back edge: open (front edge up) until the action closes them
  const lids = all<HTMLElement>(root, '.an-lidrot')
  const OPEN = 58
  const btn = q<SVGGElement>('.an-btn')
  const reads = all<SVGGElement>(root, '.an-r')
  // current: each cable carries two bright bands, scaled to nothing at rest; in the action they travel its length
  // twice, left to right, a third of a pass apart from one cable to the next (three phases)
  const cables = all<HTMLElement>(root, '.an-cable').map((c) => ({
    pulses: all<HTMLElement>(c, '.cy-pulse'),
    len: parseFloat(c.querySelector<HTMLElement>('.cy')!.style.getPropertyValue('--len')),
  }))
  const before = strokes([q<SVGPathElement>('.mc-before')])
  const after = strokes([q<SVGPathElement>('.mc-after')])
  const gap = q<SVGPathElement>('.mc-gap')
  const labels = ['before', 'after', 'savings', 'delta'].map((l) => q<SVGTextElement>(`[data-l="${l}"]`))
  const bands = cables.flatMap((c) => c.pulses)
  const dotsB = all<SVGCircleElement>(root, '.mc-pt-b')
  const dotsA = all<SVGCircleElement>(root, '.mc-pt-a')
  const bracket = q<SVGPathElement>('.mc-br')
  const touched = [...lids, btn, ...reads, ...bands, ...dotsB, ...dotsA, bracket, q('.mc-before'), q('.mc-after'), gap, ...labels]
  const PASS = 1.1
  return {
    reset: () => {
      lids.forEach((lid) => gsap.set(lid, { rotationX: OPEN }))
      gsap.set(bands, { scale: 0 })
      gsap.set(btn, { clearProps: 'transform' })
      gsap.set(reads, { opacity: 0 })
      before.reset()
      after.reset()
      gsap.set(gap, { scaleX: 0, opacity: 0 })
      gsap.set([...labels, ...dotsB, ...dotsA, bracket], { opacity: 0 })
    },
    run: () => {
      const tl = gsap.timeline({ onComplete: () => gsap.set(touched, { clearProps: CLEAR + ',rotationX' }) })
      // the current transformers close around their cables, one after the other
      lids.forEach((lid, i) => tl.to(lid, { rotationX: 0, duration: 0.4, ease: ease() }, 0.1 + i * 0.25))
      // then current flows: a band enters at the cable's left end, runs to the right end and leaves, twice
      cables.forEach((c, i) =>
        c.pulses.forEach((p, j) => {
          const from = c.len - 8
          for (let pass = 0; pass < 2; pass++) {
            const at = 0.9 + i * (PASS / 3) + j * 0.4 + pass * (PASS + 0.15)
            tl.set(p, { x: from, scale: 1 }, at)
            tl.to(p, { x: 0, duration: PASS, ease: 'none' }, at)
            tl.set(p, { scale: 0 }, at + PASS)
          }
        }),
      )
      // the DISPLAY button presses once for each reading
      reads.forEach((r, i) => {
        const at = 1.0 + i * 0.7
        tl.to(btn, { scale: 0.84, svgOrigin: '162 54', duration: 0.08 }, at - 0.1)
        tl.to(btn, { scale: 1, duration: 0.14 }, at - 0.02)
        if (i) tl.set(reads[i - 1], { opacity: 0 }, at)
        tl.set(r, { opacity: 1 }, at)
      })
      // then the before/after chart: the baseline, "after", the gap between them, "savings"
      const c = 1.0 + reads.length * 0.7 + 0.2
      before.draw(tl, c, 0.6)
      tl.to(dotsB, { opacity: 1, duration: 0.15, stagger: 0.09 }, c + 0.1)
      tl.to(labels[0], { opacity: 1, duration: 0.3 }, c + 0.5)
      after.draw(tl, c + 0.7, 0.9)
      tl.to(dotsA, { opacity: 1, duration: 0.15, stagger: 0.13 }, c + 0.8)
      tl.to(labels[1], { opacity: 1, duration: 0.3 }, c + 1.4)
      tl.to(gap, { scaleX: 1, opacity: 1, duration: 0.6, ease: ease() }, c + 1.7)
      tl.to(labels[2], { opacity: 1, duration: 0.3 }, c + 2.1)
      tl.to([bracket, labels[3]], { opacity: 1, duration: 0.3 }, c + 2.3)
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
  // the printer builds the same part: the gantry rises, the head slides along the bar (x) and the bed moves
  // front to back (y), so the nozzle traces every line of every layer while it is drawn
  const printerLayers = all<HTMLElement>(root, '.pr-layer')
  const pops = printerLayers.map((l) => l.querySelector<HTMLElement>('.pr-pop')!)
  const lineSets = printerLayers.map((l) => all<SVGPathElement>(l, '.pr-fill'))
  const fillDraw = lineSets.map((ls) => strokes(ls))
  const gantry = root.querySelector<HTMLElement>('.pr-gantry')!
  const head = root.querySelector<HTMLElement>('.pr-head')!
  const bed = root.querySelector<HTMLElement>('.pr-bm')!
  const handle = root.querySelector<SVGRectElement>('.rp-hdl')!
  const fills = lineSets.flat()
  const G0 = 10.5 // gantry height with the nozzle just above the first layer; 3 more for each layer
  const HALF_W = 18 // half the part's width and depth: the nozzle is over the part's centre at x = 0, y = 0
  const HALF_D = 12
  const TURN = 0.9
  const STEP = 0.14
  return {
    reset: () => {
      draws.forEach((d) => d.reset())
      gsap.set(view, { clearProps: 'transform' })
      gsap.set(pops, { scale: 0 })
      fillDraw.forEach((d) => d.reset())
      gsap.set(gantry, { z: G0 })
      gsap.set(head, { x: 0 })
      gsap.set(bed, { y: 0 })
      gsap.set(handle, { y: 100 })
    },
    run: () => {
      const tl = gsap.timeline({
        onComplete: () => gsap.set([...loops, view, handle, ...pops, gantry, head, bed, ...fills], { clearProps: CLEAR }),
      })
      // the view turns slightly, once
      tl.to(view, { skewX: -6, scaleX: 0.95, svgOrigin: '100 80', duration: TURN / 2, ease: 'power2.inOut' }, 0)
      tl.to(view, { skewX: 0, scaleX: 1, duration: TURN / 2, ease: 'power2.inOut' }, TURN / 2)
      // then the layers rise, one at a time from the bottom
      draws.forEach((d, k) => d.draw(tl, TURN + k * STEP, 0.3))
      // the layer slider's handle rises with them
      tl.to(handle, { y: 0, duration: draws.length * STEP, ease: 'none' }, TURN)
      // the printer, from the start: layer by layer, the nozzle moves along each line as it is drawn
      let t = 0.2
      lineSets.forEach((lines, i) => {
        tl.to(gantry, { z: G0 + 3 * i, duration: 0.12, ease: 'none' }, t)
        tl.to(pops[i], { scale: 1, duration: 0.12, ease: ease() }, t + 0.05)
        t += 0.14
        lines.forEach((line) => {
          const d = line.dataset
          const [x1, y1, x2, y2] = [+d.x1!, +d.y1!, +d.x2!, +d.y2!]
          tl.to(head, { x: x1 - HALF_W, duration: 0.03, ease: 'none' }, t)
          tl.to(bed, { y: HALF_D - y1, duration: 0.03, ease: 'none' }, t)
          t += 0.03
          tl.to(line, { strokeDashoffset: 0, duration: 0.09, ease: 'none' }, t)
          tl.to(head, { x: x2 - HALF_W, duration: 0.09, ease: 'none' }, t)
          tl.to(bed, { y: HALF_D - y2, duration: 0.09, ease: 'none' }, t)
          t += 0.09
        })
      })
      tl.to(head, { x: 0, duration: 0.2, ease: 'power1.inOut' }, t)
      tl.to(bed, { y: 0, duration: 0.2, ease: 'power1.inOut' }, t)
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

  // an experience's action plays every time its object shows up: it is put back at its start state when it
  // is chosen (or leaves the screen), and runs when it is in view. One action instance per drawing.
  const actions = new Map<HTMLElement, Action>()
  const running = new Map<HTMLElement, gsap.core.Timeline>()
  const actionFor = (fig: HTMLElement) => {
    let a = actions.get(fig)
    if (!a) {
      a = ACTIONS[fig.dataset.obj ?? '']?.(fig)
      if (a) actions.set(fig, a)
    }
    return a
  }
  const prepare = (fig: HTMLElement) => {
    if (reduced) return
    running.get(fig)?.kill()
    running.delete(fig)
    actionFor(fig)?.reset()
  }
  const start = (fig: HTMLElement) => {
    if (reduced) return
    running.get(fig)?.kill()
    const a = actionFor(fig)
    if (a) running.set(fig, a.run())
  }
  // every visible figure goes straight to its final state (the window changed size)
  const finish = () => {
    visibleFigs().forEach((fig) => {
      running.get(fig)?.kill()
      running.delete(fig)
      if (!reduced) {
        const a = actionFor(fig)
        a?.reset()
        a?.run().progress(1, false)
      }
    })
  }

  // everything waits at its start until it is shown
  visibleFigs().forEach(prepare)
  wide.addEventListener('change', () => {
    finish()
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
      // back at its start while it slides in, then it runs once it has landed
      prepare(stageFigs[i])
      window.setTimeout(() => active === i && start(stageFigs[i]), reduced ? 0 : 250)
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

  // an object plays whenever it comes into view, and waits at its start when it leaves
  const inView = (fig: () => HTMLElement | undefined) => {
    let on = false
    return (entry: IntersectionObserverEntry) => {
      const f = fig()
      if (!f) return
      if (entry.intersectionRatio === 0) {
        on = false
        prepare(f)
      } else if (entry.intersectionRatio >= 0.6 && !on) {
        on = true
        seen = true
        start(f)
      } else if (entry.intersectionRatio < 0.6) on = false
    }
  }
  const stageEl = grid.querySelector<HTMLElement>('.xp-stage')!
  const stageView = inView(() => (staged() ? stageFigs[active] : undefined))
  new IntersectionObserver((entries) => entries.forEach(stageView), { threshold: [0, 0.6] }).observe(stageEl)

  // ---- below 900px: each object plays whenever it scrolls into view ----
  const artHandlers = new Map<Element, (e: IntersectionObserverEntry) => void>()
  artFigs.forEach((fig) => artHandlers.set(fig, inView(() => (staged() ? undefined : fig))))
  const artSeen = new IntersectionObserver((entries) => entries.forEach((e) => artHandlers.get(e.target)?.(e)), { threshold: [0, 0.6] })
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
