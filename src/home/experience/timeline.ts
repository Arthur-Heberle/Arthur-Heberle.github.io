// The experience timeline's motion, loaded when the section nears the viewport (Experience.astro).
// Only transform, opacity and stroke-dashoffset. Nothing loops: every part shows its final state at rest;
// the arrival plays once when the timeline is in view, and each object's action plays once on arrival and
// again on hover, keyboard focus or tap. An action resets its object to the start, plays, and ends on the
// final state. Reduced motion gets final states only (and the same buttons and callouts, with no tweens).
import { gsap } from 'gsap'

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

function chalkboard(root: HTMLElement): Action {
  const q = <T extends Element>(s: string) => root.querySelector<T>(s)!
  const curve = strokes([q<SVGPathElement>('.ch-curve')])
  const int = strokes([q<SVGPathElement>('.ch-int')])
  const area = q<SVGPathElement>('.ch-area')
  const all = [q('.ch-curve'), q('.ch-int'), area]
  return {
    reset: () => {
      curve.reset()
      int.reset()
      gsap.set(area, { scaleY: 0, opacity: 0 })
    },
    run: () => {
      const tl = gsap.timeline({ onComplete: () => gsap.set(all, { clearProps: CLEAR }) })
      curve.draw(tl, 0, 0.9)
      int.draw(tl, 0.9, 0.7)
      tl.to(area, { scaleY: 1, opacity: 1, duration: 0.6, ease: ease() }, 1.7)
      return tl
    },
  }
}

function meter(root: HTMLElement): Action {
  const q = <T extends Element>(s: string) => root.querySelector<T>(s)!
  const kwh = q<HTMLElement>('[data-kwh]')
  const final = kwh.textContent ?? '0'
  const before = strokes([q<SVGPathElement>('.mc-before')])
  const after = strokes([q<SVGPathElement>('.mc-after')])
  const gap = q<SVGPathElement>('.mc-gap')
  const text = (l: string) => q<SVGTextElement>(`[data-l="${l}"]`)
  const labels = [text('before'), text('after'), text('savings')]
  return {
    reset: () => {
      kwh.textContent = (0).toFixed(1)
      before.reset()
      after.reset()
      gsap.set(gap, { scaleX: 0, opacity: 0 })
      gsap.set(labels, { opacity: 0 })
    },
    run: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          kwh.textContent = final
          gsap.set([q('.mc-before'), q('.mc-after'), gap, ...labels], { clearProps: CLEAR })
        },
      })
      // the display counts up kWh
      const reading = { v: 0 }
      tl.to(reading, { v: parseFloat(final), duration: 1.5, ease: 'power1.out', onUpdate: () => (kwh.textContent = reading.v.toFixed(1)) }, 0)
      // "before" (the baseline), then "after", then the gap between them, "savings"
      before.draw(tl, 0.2, 0.6)
      tl.to(text('before'), { opacity: 1, duration: 0.3 }, 0.7)
      after.draw(tl, 0.9, 0.9)
      tl.to(text('after'), { opacity: 1, duration: 0.3 }, 1.6)
      tl.to(gap, { scaleX: 1, opacity: 1, duration: 0.6, ease: ease() }, 1.9)
      tl.to(text('savings'), { opacity: 1, duration: 0.3 }, 2.3)
      return tl
    },
  }
}

function laptop(root: HTMLElement): Action {
  const boxes = [...root.querySelectorAll<SVGGElement>('.un-box')]
  const lines = [...root.querySelectorAll<SVGPathElement>('.un-inh, .un-ptr')]
  const inh = strokes([...root.querySelectorAll<SVGPathElement>('.un-inh')])
  const tri = root.querySelector<SVGPathElement>('.un-tri')!
  const ptr = strokes([root.querySelector<SVGPathElement>('.un-ptr')!])
  // Entity, then the two classes that inherit from it, then Level, which holds Entities
  const order = [boxes[1], boxes[2], boxes[3], boxes[0]]
  return {
    reset: () => {
      gsap.set([...boxes, tri], { opacity: 0 })
      inh.reset()
      ptr.reset()
    },
    run: () => {
      const tl = gsap.timeline({ onComplete: () => gsap.set([...boxes, tri, ...lines], { clearProps: CLEAR }) })
      tl.to(order, { opacity: 1, duration: 0.3, stagger: 0.28 }, 0)
      inh.draw(tl, 1.2, 0.6, 0.15)
      tl.to(tri, { opacity: 1, duration: 0.2 }, 1.6)
      ptr.draw(tl, 2.0, 0.6)
      return tl
    },
  }
}

function printer(root: HTMLElement): Action {
  const pops = [...root.querySelectorAll<HTMLElement>('.pr-pop')]
  const infill = pops.map((p) => strokes([...p.querySelectorAll<SVGPathElement>('.pr-fill')]))
  const gantry = root.querySelector<HTMLElement>('.pr-gantry')!
  const START = 14 // the nozzle just above the bed; the resting height (34) is in the CSS
  const STEP = 0.55
  return {
    reset: () => {
      gsap.set(pops, { scale: 0 })
      infill.forEach((s) => s.reset())
      gsap.set(gantry, { z: START })
    },
    run: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([...pops, gantry], { clearProps: 'transform' })
          gsap.set(root.querySelectorAll('.pr-fill'), { clearProps: CLEAR })
        },
      })
      // layer by layer: it appears, its infill lines are drawn (at its own angle), the gantry climbs a step
      pops.forEach((pop, i) => {
        const at = i * STEP
        tl.to(pop, { scale: 1, duration: 0.2, ease: ease() }, at)
        infill[i].draw(tl, at + 0.1, 0.35, 0.02)
      })
      tl.to(gantry, { z: 34, duration: pops.length * STEP, ease: 'none' }, 0)
      return tl
    },
  }
}

const ACTIONS: Record<string, (root: HTMLElement) => Action> = {
  'calculus-ii': chalkboard,
  'eletron-energia': meter,
  'programming-techniques': laptop,
  rp3: printer,
}

/** What opening a row also does: replay its object's action. */
type RowHooks = { onOpen?: (row: HTMLElement) => void }

// ---- the row buttons and the callout (768px and up) ----
// The title becomes a button (aria-expanded, aria-controls the details, aria-describedby the object's
// description). Hover or keyboard focus opens its callout; a click, tap, Enter or Space pins it. One is
// open at a time; Esc or a press elsewhere closes it. The leader line is one shared SVG, measured from
// the bar to the callout every time one opens. Without motion (reduced) everything shows and hides at once.
function initDetails(root: HTMLElement, rows: HTMLElement[], reduced: boolean, hooks: RowHooks) {
  const wide = matchMedia('(min-width: 768px)')
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'xp-leader')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const line = document.createElementNS(NS, 'path')
  line.setAttribute('class', 'xp-leader-line')
  const dot = document.createElementNS(NS, 'circle')
  dot.setAttribute('class', 'xp-leader-dot')
  dot.setAttribute('r', '2.5')
  svg.append(line, dot)
  gsap.set([line, dot], { opacity: 0 })

  type Item = { row: HTMLElement; button: HTMLButtonElement | null; detail: HTMLElement; bar: HTMLElement; side: string }
  const items: Item[] = rows.map((row) => ({
    row,
    button: null,
    detail: row.querySelector<HTMLElement>('.xp-detail')!,
    bar: row.querySelector<HTMLElement>('.xp-bar')!,
    side: row.dataset.side ?? 'right',
  }))

  let current: Item | null = null
  let pinned = false
  let closeTimer = 0
  let tl: gsap.core.Timeline | undefined
  let closing: (() => void) | null = null // a fade-out in flight: finished at once if something else opens

  const measure = (it: Item) => {
    const base = root.getBoundingClientRect()
    const b = it.bar.getBoundingClientRect()
    const c = it.detail.getBoundingClientRect()
    // the dot sits on the bar's end nearest the callout, the line drops to the callout's edge, then runs in
    const right = it.side === 'right'
    const dx = (right ? b.right : b.left) - base.left
    const dy = b.top - base.top + b.height / 2
    const ex = (right ? c.left : c.right) - base.left
    const ty = c.top - base.top + 14
    line.setAttribute('d', `M${dx.toFixed(1)} ${dy.toFixed(1)} V${ty.toFixed(1)} H${ex.toFixed(1)}`)
    dot.setAttribute('cx', dx.toFixed(1))
    dot.setAttribute('cy', dy.toFixed(1))
    return line.getTotalLength()
  }

  const setExpanded = (it: Item, on: boolean) => it.button?.setAttribute('aria-expanded', String(on))

  const hide = () => {
    clearTimeout(closeTimer)
    const it = current
    if (!it) return
    current = null
    pinned = false
    setExpanded(it, false)
    tl?.kill()
    const done = () => {
      closing = null
      it.row.removeAttribute('data-open')
      gsap.set(it.detail, { clearProps: 'opacity' })
      gsap.set([line, dot], { opacity: 0 })
      line.style.strokeDasharray = ''
      line.style.strokeDashoffset = ''
    }
    if (reduced) return done()
    closing = done
    tl = gsap.timeline({ onComplete: done }).to([it.detail, line, dot], { opacity: 0, duration: 0.08 })
  }

  const show = (it: Item, pin: boolean) => {
    clearTimeout(closeTimer)
    if (current === it) {
      pinned = pinned || pin
      return
    }
    if (current) {
      // swap at once: the old one goes without a fade
      current.row.removeAttribute('data-open')
      setExpanded(current, false)
      gsap.set(current.detail, { clearProps: 'opacity' })
    }
    tl?.kill()
    closing?.()
    current = it
    pinned = pin
    it.row.setAttribute('data-open', '')
    setExpanded(it, true)
    const len = measure(it)
    hooks.onOpen?.(it.row)
    if (reduced) {
      gsap.set([line, dot], { opacity: 1 })
      line.style.strokeDasharray = ''
      line.style.strokeDashoffset = ''
      return
    }
    line.style.strokeDasharray = String(len)
    line.style.strokeDashoffset = String(len)
    gsap.set(it.detail, { opacity: 0 })
    gsap.set(dot, { opacity: 0 })
    tl = gsap
      .timeline()
      .set(line, { opacity: 1 })
      .to(dot, { opacity: 1, duration: 0.1 })
      .to(line, { strokeDashoffset: 0, duration: 0.25, ease: ease() })
      .to(it.detail, { opacity: 1, duration: 0.12 })
  }

  const closeSoon = (it: Item) => {
    clearTimeout(closeTimer)
    closeTimer = window.setTimeout(() => current === it && !pinned && hide(), 140)
  }

  const handlers: [EventTarget, string, EventListener][] = []
  const on = (el: EventTarget, type: string, fn: EventListener) => {
    el.addEventListener(type, fn)
    handlers.push([el, type, fn])
  }

  const enable = () => {
    root.append(svg)
    items.forEach((it) => {
      const title = it.row.querySelector<HTMLElement>('.xp-title')!
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'xp-btn'
      btn.setAttribute('aria-expanded', 'false')
      btn.setAttribute('aria-controls', title.dataset.d ?? '')
      btn.setAttribute('aria-describedby', title.dataset.o ?? '')
      btn.append(...title.childNodes)
      title.append(btn)
      it.button = btn
      // the parts of the row that answer to the pointer: object, bar, label (not the empty band) and the callout
      ;['.xp-obj', '.xp-bar', '.xp-label', '.xp-detail'].forEach((s) => {
        const el = it.row.querySelector(s)!
        on(el, 'pointerenter', () => show(it, false))
        on(el, 'pointerleave', () => closeSoon(it))
      })
      // a click or tap on the row, or Enter or Space on the button (which clicks), pins it; again unpins and closes
      ;['.xp-obj', '.xp-bar', '.xp-label'].forEach((s) =>
        on(it.row.querySelector(s)!, 'click', () => (current === it && pinned ? hide() : show(it, true))),
      )
      on(btn, 'focus', () => btn.matches(':focus-visible') && show(it, false))
      on(btn, 'blur', () => current === it && !pinned && hide())
    })
    on(document, 'keydown', (e) => {
      if ((e as KeyboardEvent).key !== 'Escape' || !current) return
      const btn = current.button
      const hadFocus = btn && document.activeElement === btn
      hide()
      if (hadFocus) btn.focus({ preventScroll: true })
    })
    on(document, 'pointerdown', (e) => {
      if (current && !current.row.contains(e.target as Node)) hide()
    })
  }

  const disable = () => {
    hide()
    handlers.splice(0).forEach(([el, type, fn]) => el.removeEventListener(type, fn))
    svg.remove()
    items.forEach((it) => {
      const title = it.row.querySelector<HTMLElement>('.xp-title')
      if (it.button && title) title.append(...it.button.childNodes)
      it.button?.remove()
      it.button = null
    })
  }

  wide.addEventListener('change', () => {
    disable()
    if (wide.matches) enable()
  })
  if (wide.matches) enable()
}

export function initTimeline(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const wide = matchMedia('(min-width: 768px)')
  const rows = [...root.querySelectorAll<HTMLElement>('.xp-row')]

  const parts = rows.map((row) => {
    const obj = row.querySelector<HTMLElement>('.xp-obj')!
    const action = ACTIONS[obj.dataset.obj ?? '']?.(obj)
    let running = false
    return {
      row,
      bar: row.querySelector<HTMLElement>('.xp-bar')!,
      open: row.querySelector<HTMLElement>('.xp-open'),
      lift: row.querySelector<HTMLElement>('.xp-lift')!,
      label: row.querySelector<HTMLElement>('.xp-label')!,
      action,
      // runs the action from its start; `fresh` is true when the start state is already set (the arrival)
      play: (fresh = false) => {
        if (!action || running || reduced) return
        running = true
        if (!fresh) action.reset()
        action.run().eventCallback('onComplete', () => (running = false))
      },
    }
  })
  let arrived = reduced

  // hover, keyboard focus or a tap opens a row's callout; its object's action plays again with it
  initDetails(root, rows, reduced, {
    onOpen: (row) => arrived && parts.find((p) => p.row === row)?.play(),
  })

  const axisLine = root.querySelector<HTMLElement>('.xp-axis-line')
  const ticks = [...root.querySelectorAll<HTMLElement>('.xp-tick')]
  const arrows = [...root.querySelectorAll<SVGElement>('.xp-arrow')]
  const years = [...root.querySelectorAll<HTMLElement>('.xp-year')]
  if (reduced || !axisLine || !wide.matches) return

  // the drawing waits at its start until the timeline is seen. Transform only on the 3D parts: an
  // opacity below 1 would flatten each object's 3D chain while it plays.
  gsap.set(axisLine, { scaleX: 0 })
  gsap.set(ticks, { scaleY: 0 })
  gsap.set([...arrows, ...years], { opacity: 0 })
  parts.forEach((p) => {
    gsap.set(p.bar, { scaleX: 0 })
    gsap.set(p.lift, { z: 70 })
    gsap.set([p.label, p.open].filter(Boolean), { opacity: 0 })
    p.action?.reset()
  })

  const arrive = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      arrive.disconnect()
      const tl = gsap.timeline({
        onComplete: () => {
          arrived = true
          gsap.set([axisLine, ...ticks, ...arrows, ...years], { clearProps: 'transform,opacity' })
          parts.forEach((p) => gsap.set([p.bar, p.lift, p.label, p.open].filter(Boolean), { clearProps: 'transform,opacity' }))
        },
      })
      // the axis draws, left to right, its ticks standing up as the line reaches them
      tl.to(axisLine, { scaleX: 1, duration: 0.7, ease: ease() }, 0)
      tl.to(ticks, { scaleY: 1, duration: 0.25, ease: ease(), stagger: 0.7 / ticks.length }, 0.05)
      tl.to([...arrows, ...years], { opacity: 1, duration: 0.3 }, 0.4)
      // then row by row: the bar grows from its start date, the object is set down onto it, and its
      // action plays once it has landed
      parts.forEach((p, i) => {
        const at = 0.8 + i * 0.4
        tl.to(p.bar, { scaleX: 1, duration: 0.5, ease: ease() }, at)
        tl.to(p.lift, { z: 0, duration: 0.5, ease: ease() }, at + 0.1)
        tl.to([p.label, p.open].filter(Boolean), { opacity: 1, duration: 0.3 }, at + 0.35)
        tl.call(() => p.play(true), [], at + 0.6)
      })
    },
    { threshold: 0.25 },
  )
  arrive.observe(root)
}
