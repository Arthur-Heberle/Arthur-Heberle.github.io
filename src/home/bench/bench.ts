// The bench's motion, loaded when the bench nears the viewport (Bench.astro). Only transform, opacity
// and class toggles that CSS transitions already handle (the pins). Nothing loops: every object
// shows its final state at rest, and an action plays once, resets to its start, runs, and ends back
// on the final state. Reduced motion never gets past the texture: final states only.
import { gsap } from 'gsap'

// motion.ts's one curve (the CustomEase 'reveal'), by name; power4.out is the same shape if
// motion.ts has not registered it yet.
const ease = () => gsap.parseEase('reveal') ?? 'power4.out'

type Action = () => gsap.core.Timeline

function edubra(root: HTMLElement): Action {
  const pins = [...root.querySelectorAll<HTMLElement>('.pos')]
  const label = root.querySelector<HTMLElement>('[data-letter]')!
  const raise = (letter: string) => {
    pins.forEach((p) => p.classList.toggle('up', (p.dataset.in ?? '').includes(letter)))
    label.textContent = letter.toUpperCase()
  }
  const drop = () => pins.forEach((p) => p.classList.remove('up'))
  // E, then D, then U, one letter at a time: each drops first, then the next rises
  return () => {
    const tl = gsap.timeline()
    ;['e', 'd', 'u'].forEach((letter, i) => {
      tl.call(drop, [], i * 0.9)
      tl.call(raise, [letter], i * 0.9 + 0.14)
    })
    tl.set({}, {}, 2.4)
    return tl
  }
}

function agente(root: HTMLElement): Action {
  const out = root.querySelector<HTMLElement>('.bub.out')!
  const reply = root.querySelector<HTMLElement>('.bub.in')!
  const stamp = root.querySelector<HTMLElement>('.stamp')!
  // a customer message arrives, then the agent's reply, then the stamp
  return () => {
    const tl = gsap.timeline({ onComplete: () => gsap.set([out, reply, stamp], { clearProps: 'opacity,transform' }) })
    tl.set([out, reply, stamp], { opacity: 0 })
    tl.fromTo(out, { y: 8 }, { y: 0, opacity: 1, duration: 0.3, ease: ease() }, 0.1)
    tl.fromTo(reply, { y: 8 }, { y: 0, opacity: 1, duration: 0.3, ease: ease() }, 1.0)
    tl.fromTo(stamp, { scale: 1.7 }, { scale: 1, opacity: 1, duration: 0.25, ease: ease() }, 2.0)
    return tl
  }
}

function brasilore(root: HTMLElement): Action {
  const hero = root.querySelector<HTMLElement>('.mon-hero')!
  // she starts at the left, runs, jumps the gap and lands on the far side (her resting place)
  return () => {
    const tl = gsap.timeline({ onComplete: () => gsap.set(hero, { clearProps: 'transform' }) })
    tl.set(hero, { x: -144, y: 0 })
    tl.to(hero, { x: -90, duration: 0.6, ease: 'none' }, 0)
    tl.to(hero, { y: -3, duration: 0.15, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 0)
    tl.to(hero, { x: 0, duration: 0.7, ease: 'none' }, 0.6)
    tl.to(hero, { y: -46, duration: 0.35, ease: 'power2.out' }, 0.6)
    tl.to(hero, { y: 0, duration: 0.35, ease: 'power2.in' }, 0.95)
    return tl
  }
}

const ACTIONS: Record<string, (root: HTMLElement) => Action> = { edubra, agente, brasilore }

// ---- the labels and their leader lines (768px and up) ----
// Each project has a label in a fixed free corner (CSS) and a line from a point on its object to it:
// the line starts at the 2x2 anchor inside the object's top face, measured from where the anchor
// renders now (the same approach as the EduBra story's wires), and is re-measured on resize, when the
// fonts load and while the objects settle. Hover or keyboard focus shows one label at a time: the dot,
// then the line drawn outward (stroke-dashoffset), then the label fades in; leaving reverses it. Without
// hover (@media (hover: none)) all three stay shown. Reduced motion shows and hides them at once.
let remeasure = () => {}

function initNotes(bench: HTMLElement, items: HTMLElement[], reduced: boolean) {
  const desk = bench.querySelector<HTMLElement>('.wb-desk')
  const labels = [...bench.querySelectorAll<HTMLElement>('.wb-note')]
  const paths = [...bench.querySelectorAll<SVGPathElement>('.wb-line')]
  const dots = [...bench.querySelectorAll<SVGCircleElement>('.wb-dot')]
  if (!desk || labels.length !== items.length) return
  const wide = matchMedia('(min-width: 768px)')
  const noHover = matchMedia('(hover: none)')

  type Note = {
    link: HTMLElement
    anchor: HTMLElement
    label: HTMLElement
    path: SVGPathElement
    dot: SVGCircleElement
    len: number
    shown: boolean
    tl?: gsap.core.Timeline
  }
  const notes: Note[] = items.map((item, i) => ({
    link: item.querySelector<HTMLElement>('.wb-link')!,
    anchor: item.querySelector<HTMLElement>('[data-anchor]')!,
    label: labels[i],
    path: paths[i],
    dot: dots[i],
    len: 0,
    shown: false,
  }))

  const measure = () => {
    if (!wide.matches) return
    const d = desk.getBoundingClientRect()
    notes.forEach((n) => {
      const a = n.anchor.getBoundingClientRect()
      const l = n.label.getBoundingClientRect()
      const ax = a.left + a.width / 2 - d.left
      const ay = a.top + a.height / 2 - d.top
      const right = n.label.dataset.side === 'right'
      const tx = (right ? l.left : l.right) - d.left + (right ? -8 : 8)
      const ty = l.top - d.top + 13
      const ex = tx + (right ? -24 : 24)
      n.path.setAttribute('d', `M${ax.toFixed(1)} ${ay.toFixed(1)} L${ex.toFixed(1)} ${ty.toFixed(1)} H${tx.toFixed(1)}`)
      n.dot.setAttribute('cx', ax.toFixed(1))
      n.dot.setAttribute('cy', ay.toFixed(1))
      n.len = n.path.getTotalLength()
      n.path.style.strokeDasharray = String(n.len)
      if (!n.tl?.isActive()) n.path.style.strokeDashoffset = String(n.shown ? 0 : n.len)
    })
  }
  remeasure = measure

  const setNow = (n: Note, on: boolean) => {
    n.tl?.kill()
    n.shown = on
    n.path.style.strokeDashoffset = String(on ? 0 : n.len)
    gsap.set([n.dot, n.label], { opacity: on ? 1 : 0 })
  }
  const show = (n: Note) => {
    notes.forEach((o) => o !== n && o.shown && hide(o))
    n.tl?.kill()
    n.shown = true
    if (reduced) return setNow(n, true)
    n.tl = gsap
      .timeline()
      .to(n.dot, { opacity: 1, duration: 0.1 })
      .to(n.path, { strokeDashoffset: 0, duration: 0.3, ease: ease() })
      .to(n.label, { opacity: 1, duration: 0.12 })
  }
  const hide = (n: Note) => {
    n.tl?.kill()
    n.shown = false
    if (reduced) return setNow(n, false)
    n.tl = gsap
      .timeline()
      .to(n.label, { opacity: 0, duration: 0.08 })
      .to(n.path, { strokeDashoffset: n.len, duration: 0.18, ease: 'none' })
      .to(n.dot, { opacity: 0, duration: 0.08 })
  }

  // all shown where there is no hover, none otherwise
  const sync = () => {
    if (!wide.matches) return
    measure()
    notes.forEach((n) => setNow(n, noHover.matches))
  }
  notes.forEach((n) => {
    n.link.addEventListener('mouseenter', () => !noHover.matches && show(n))
    n.link.addEventListener('mouseleave', () => !noHover.matches && hide(n))
    n.link.addEventListener('focus', () => !noHover.matches && n.link.matches(':focus-visible') && show(n))
    n.link.addEventListener('blur', () => !noHover.matches && hide(n))
  })
  new ResizeObserver(measure).observe(desk)
  wide.addEventListener('change', sync)
  noHover.addEventListener('change', sync)
  document.fonts?.ready.then(measure)
  sync()
}

export function initBench(bench: HTMLElement) {
  bench.classList.add('wb-live') // the MDF texture is fetched only now
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const items = [...bench.querySelectorAll<HTMLElement>('.wb-item')]
  initNotes(bench, items, reduced)
  if (reduced) return

  const stacked = matchMedia('(max-width: 767px)').matches
  const hover = matchMedia('(hover: hover)').matches

  const wide = matchMedia('(min-width: 768px)')
  // each link holds two sets of the same object: the stacked one (below 768px) and the desk's
  const rootOf = (item: HTMLElement) =>
    item.querySelector<HTMLElement>(wide.matches ? '[data-wb-desk]' : '[data-wb]')

  items.forEach((item) => {
    let running = false
    const play = () => {
      const root = rootOf(item)
      const make = root && ACTIONS[root.dataset.wb ?? root.dataset.wbDesk ?? '']
      if (!root || !make || running) return
      running = true
      make(root)().eventCallback('onComplete', () => (running = false))
    }
    const link = item.querySelector<HTMLElement>('.wb-link')!
    if (hover) {
      link.addEventListener('mouseenter', play)
      link.addEventListener('focus', play)
    }
    if (stacked || !hover) {
      // no hover here: the action plays once, as the object scrolls into view
      const seen = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          seen.disconnect()
          play()
        },
        { threshold: 0.6 },
      )
      seen.observe(item.querySelector(wide.matches ? '.wb-desk-obj' : '.wb-obj')!)
    }
  })

  if (stacked) return
  // arrival: the three objects come down onto the mat, one after the other. Transform only: an
  // opacity below 1 would flatten each object's 3D chain while it plays.
  const lifts = items.map((item) => item.querySelector<HTMLElement>('.wb-lift')!)
  gsap.set(lifts, { z: 70 })
  remeasure()
  const arrive = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      arrive.disconnect()
      gsap.to(lifts, {
        z: 0,
        duration: 0.6,
        stagger: 0.18,
        ease: ease(),
        onUpdate: () => remeasure(),
        onComplete: () => {
          gsap.set(lifts, { clearProps: 'transform' })
          remeasure()
        },
      })
    },
    { threshold: 0.25 },
  )
  arrive.observe(bench)
}
