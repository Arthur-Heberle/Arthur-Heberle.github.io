// Agente H's "How it works" (AgenteStory.astro). The same player as EduBra's story
// (src/projects/edubra/story.ts), kept as its own copy so EduBra stays untouched: render(p) is a
// pure function of progress p in [0, 1]; hstoryPlayer() drives it from ONE GSAP tween of a proxy p
// (autoplay, 12 s, linear, no pin, no scrub), pauses it off screen, and in the static layout (and
// under reduced motion) shows render(1). motion.ts owns the matchMedia branches and calls it.
// Left out, on purpose: EduBra's voice and its hardware callouts. Only transform, opacity and
// stroke-dashoffset change, so every highlight is an opacity crossfade between stacked copies.
//
// Scenes, as fractions of p (the brief): Wait 0-.30, Find .30-.58, Answer .58-.82, Hand off .82-1.
import { gsap } from 'gsap'
import { arrow, parsePts, poly } from './flow'
import type { Pt } from './flow'

const W = 760
const H = 560
const DURATION = 12 // seconds, linear

type Range = [number, number]
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const inout = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2 // travel: no bunching at the end
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// ---- 1 Wait: three messages, and the silence timer that restarts for each ----
const MSG_AT = [0.03, 0.088, 0.146] // when each message starts to arrive
const ARRIVE = 0.016
const RING_FROM = MSG_AT.map((m) => m + 0.018) // the timer starts filling once the message has landed
const RESET = 0.016 // a new message empties the timer, quickly (about 0.2 s), and that is the debounce
const FILL = 0.075 // p a full timer takes, shown as 30 s: the drawing runs faster than the real wait
const CIRC = 2 * Math.PI * 32
const MERGE: Range[] = [
  [0.24, 0.28],
  [0.245, 0.285],
  [0.25, 0.29],
]

/** The timer's fill in [0, 1] at p: filling after a message, emptied by the next, full after the third. */
function ring(p: number): number {
  const filled = (i: number, until: number) => clamp((Math.min(p, until) - RING_FROM[i]) / FILL)
  for (let i = 0; i < 2; i++) {
    const next = MSG_AT[i + 1]
    if (p < next) return filled(i, next)
    if (p < next + RESET) return filled(i, next) * (1 - ease(seg(p, next, next + RESET)))
    if (p < RING_FROM[i + 1]) return 0
  }
  return filled(2, 1)
}

// ---- 2 Find ----
const T = {
  frame: [0.3, 0.34] as Range,
  nums: [0.34, 0.38] as Range,
  numsOut: [0.4, 0.45] as Range,
  dot: [0.39, 0.45] as Range,
  lines: 0.45, // the first of eight lines; each starts 0.004 after the last, over 0.02
  top: [0.5, 0.54] as Range,
  word: [0.54, 0.57] as Range,
}
// ---- 3 Answer ----
const CHIPS_P = [0.6, 0.62, 0.64] // when each product chip starts to fly; flight is 0.07
const CHIPS_M = [0.61, 0.63, 0.65]
const FLY = 0.07
const MINI: Range = [0.72, 0.76]
const THINK: Range = [0.745, 0.79]
const REPLY_DOT: Range = [0.77, 0.8]
const REPLY: Range = [0.79, 0.82]
// ---- 4 Hand off ----
const STAMP: Range = [0.83, 0.87]
const DASH: Range = [0.84, 0.9]
const LEAD: Range = [0.88, 0.97]

// The wires draw in as their part appears (stroke-dashoffset, left on once drawn), the data pulses
// travel them, and each step number fades in with its scene. Order is the flow's: the phone to the
// timer, the timer to the query, the query to the map, the map to the prompt, the prompt to the model,
// the reply back to the phone, the phone to the leads board.
const WIRE_AT: Range[] = [
  [0.005, 0.03],
  [0.225, 0.255],
  [0.29, 0.33],
  [0.575, 0.595],
  [0.69, 0.715],
  [0.74, 0.77],
  [0.82, 0.87],
]
const PULSE_AT: Record<number, Range[]> = {
  0: MSG_AT.map((m) => [m + 0.008, m + 0.03] as Range), // each message goes from the phone to the timer
  1: [[0.255, 0.29]], // the full timer lets the query through
  3: [[0.595, 0.63]], // the closest products go to the prompt
}
const STEPN_AT: Range[] = [T.frame, [0.58, 0.62], DASH]

const SCENES: Range[] = [
  [0.0, 0.3],
  [0.3, 0.58],
  [0.58, 0.82],
  [0.82, 1.2],
]
// The camera moves at the scene's start, except the last: it waits until the stamp has landed,
// so the phone is still in frame for it, and then goes to the dashboard.
const CAM_AT = [0, 0.3, 0.58, 0.87]

interface Pt {
  x: number
  y: number
}
interface Story {
  root: HTMLElement
  frame: HTMLElement
  fit: HTMLElement
  canvas: HTMLElement
  phone: HTMLElement
  bub: HTMLElement[]
  reply: HTMLElement
  stamp: HTMLElement
  ring: SVGElement
  arc: SVGElement
  ringTxt: SVGElement
  qtext: SVGElement
  qhi: SVGElement
  nums: SVGElement
  fades: SVGElement[]
  frameEls: SVGGeometryElement[] // the frames that draw themselves: the map, the card, the model, the dashboard
  paper: SVGElement[] // the fills behind the card, the model and the dashboard, in that order
  lens: number[]
  prods: { g: SVGElement; rank: number; hi: SVGElement[]; word: SVGElement | null; pt: Pt }[]
  nl: { el: SVGGeometryElement; len: number; rank: number; hi: boolean }[]
  wires: { el: SVGGeometryElement; arrow: SVGElement; pts: Pt[]; len: number }[]
  pulses: { el: SVGElement; w: number }[]
  stepn: SVGElement[]
  lane: number // the y the lead card travels along, under the phone
  tag: SVGElement // the "8 closest" note
  qdot: SVGElement
  chipA: SVGElement[]
  chipP: SVGElement[]
  chipM: SVGElement[]
  rows: { p: Pt[]; m: Pt[] }
  mini: SVGElement
  miniFrom: Pt
  miniTo: Pt
  modelHi: SVGElement
  dot: SVGElement
  lead: SVGElement
  leadEnd: Pt
  slots: Pt[]
  qAt: Pt
  // measured at rest, in canvas px
  bubC: Pt[]
  replyC: Pt
  stampC: Pt
  caps: HTMLElement[]
  ticks: HTMLElement[]
  tickBtns: HTMLButtonElement[]
  capsBox: HTMLElement
  toggle: HTMLButtonElement
  again: HTMLButtonElement
  liveMsg: HTMLElement
  tx: number // the canvas' current translate (0 unless the camera is on)
  ty: number
  camOn: boolean
  cam: { cx: number; cy: number; k: number }
  camScene: number
  camTw: gsap.core.Tween | null
  live: boolean
  k: number
  p: number
}

let S: Story | null = null

const num = (el: Element, a: string) => +el.getAttribute(a)!
const translateOf = (el: Element): Pt => {
  const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(el.getAttribute('transform') ?? '')
  return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 }
}

function grab(): Story | null {
  if (S) return S
  const root = document.querySelector<HTMLElement>('[data-hstory]')
  if (!root) return null
  const $ = <E extends Element>(sel: string) => root.querySelector<E>(sel)!
  const $$ = <E extends Element>(sel: string) => [...root.querySelectorAll<E>(sel)]
  const prods = $$<SVGElement>('.prod').map((g) => {
    const dot = g.querySelector('.pdot')!
    return {
      g,
      rank: +g.dataset.rank!,
      hi: [...g.querySelectorAll<SVGElement>('.phi, .lbl-hi')],
      word: g.querySelector<SVGElement>('.hiw'),
      pt: { x: num(dot, 'cx'), y: num(dot, 'cy') },
    }
  })
  const chipP = $$<SVGElement>('.chipP') // emitted in rank order: the closest product first
  const chipM = $$<SVGElement>('.chipM')
  const mini = $<SVGElement>('#hs-mini')
  const miniFrom = translateOf(mini)
  const model = $<SVGGeometryElement>('#hs-modelframe')
  const mb = model.getBBox()
  S = {
    root,
    frame: $('.frame'),
    fit: $('.fit'),
    canvas: $('.canvas'),
    phone: $('#o-phone'),
    bub: $$<HTMLElement>('.bub.out'),
    reply: $('#hs-reply'),
    stamp: $('#hs-stamp'),
    ring: $('#hs-ring'),
    arc: $('#hs-arc'),
    ringTxt: $('#hs-ringtxt'),
    qtext: $('#hs-qtext'),
    qhi: $('#hs-qhi'),
    nums: $('#hs-nums'),
    fades: $$<SVGElement>('.hs-fade'),
    frameEls: ['#hs-frame', '#hs-cardframe', '#hs-modelframe', '#hs-dashframe'].map((s) => $<SVGGeometryElement>(s)),
    paper: $$<SVGElement>('.paper'),
    lens: [],
    prods,
    nl: $$<SVGGeometryElement>('.nl').map((el) => ({ el, len: 1, rank: +el.dataset.rank!, hi: el.classList.contains('hi') })),
    wires: $$<SVGGeometryElement>('.wire').map((el) => ({
      el,
      arrow: $<SVGElement>(`.warrow[data-w="${el.dataset.w}"]`),
      pts: parsePts(el.dataset.pts!),
      len: 1,
    })),
    pulses: $$<SVGElement>('.pulse').map((el) => ({ el, w: +el.dataset.w! })),
    stepn: $$<SVGElement>('.hs-stepn'),
    lane: 446,
    tag: $('#hs-tag'),
    qdot: $('#hs-qdot'),
    chipA: $$<SVGElement>('.chipA'),
    chipP,
    chipM,
    rows: { p: chipP.map(translateOf), m: chipM.map(translateOf) },
    mini,
    miniFrom,
    miniTo: { x: miniFrom.x, y: mb.y + mb.height / 2 },
    modelHi: $('#hs-modelhi'),
    dot: $('#hs-dot'),
    lead: $('#hs-lead'),
    leadEnd: translateOf($('#hs-lead')),
    slots: $$<SVGElement>('.chipA').map(translateOf),
    qAt: { x: num($('#hs-qdot'), 'cx'), y: num($('#hs-qdot'), 'cy') },
    bubC: [],
    replyC: { x: 0, y: 0 },
    stampC: { x: 0, y: 0 },
    caps: $$<HTMLElement>('.cap'),
    ticks: $$<HTMLElement>('.ticks u'),
    tickBtns: $$<HTMLButtonElement>('.ticks button'),
    capsBox: $('.caps'),
    toggle: $('[data-toggle]'),
    again: $('[data-again]'),
    liveMsg: $('[data-live]'),
    tx: 0,
    ty: 0,
    camOn: false,
    cam: { cx: 0, cy: 0, k: 1 },
    camScene: 0,
    camTw: null,
    live: false,
    k: 1,
    p: 1,
  }
  return S
}

const op = (el: Element, v: number) => ((el as SVGElement).style.opacity = String(v))
const at = (el: Element, x: number, y: number, extra = '') => el.setAttribute('transform', `translate(${x} ${y})${extra}`)
const along = (pts: Pt[], t: number): Pt => {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y))
  const total = lens.reduce((a, b) => a + b, 0)
  let d = clamp(t) * total
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] ? Math.min(1, d / lens[i]) : 1
      return { x: lerp(pts[i].x, pts[i + 1].x, f), y: lerp(pts[i].y, pts[i + 1].y, f) }
    }
    d -= lens[i]
  }
  return pts[pts.length - 1]
}

function render(p: number) {
  const s = S!
  s.p = p

  // the phone comes down onto the table, with the timer
  const d = ease(seg(p, 0, 0.03))
  s.phone.style.opacity = String(d)
  s.phone.style.transform = `translateY(${-36 * (1 - d)}px)`
  op(s.ring, d)

  // 1 Wait: three messages, each restarting the timer (it empties quickly), then full: 30 s
  s.bub.forEach((b, i) => {
    const a = ease(seg(p, MSG_AT[i], MSG_AT[i] + ARRIVE))
    b.style.opacity = String(a)
    b.style.transform = `translateY(${8 * (1 - a)}px)`
  })
  const f = ring(p)
  s.arc.style.strokeDashoffset = String(CIRC * (1 - f))
  s.ringTxt.textContent = `${Math.round(f * 30)} s`

  // ... then the three merge into one query line
  s.chipA.forEach((c, i) => {
    const [a, b] = MERGE[i]
    const t = inout(seg(p, a, b))
    const from = s.bubC[i] ?? s.slots[i]
    at(c, lerp(from.x, s.slots[i].x, t), lerp(from.y, s.slots[i].y, t))
    op(c, seg(p, a, a + 0.008) * (1 - seg(p, b - 0.005, b + 0.01)))
  })
  op(s.qtext, seg(p, 0.275, 0.3))

  // 2 Find: the map; the query as numbers, then a dot; the nearest eight; the closest three; the typo
  const fr = ease(seg(p, ...T.frame))
  s.frameEls.forEach((el, i) => {
    const t = i === 0 ? fr : i === 1 ? ease(seg(p, 0.58, 0.62)) : i === 2 ? ease(seg(p, 0.6, 0.64)) : ease(seg(p, ...DASH))
    el.style.strokeDashoffset = String(s.lens[i] * (1 - t))
    if (i > 0) op(s.paper[i - 1], t)
  })
  s.fades.forEach((el) => {
    const g = el.parentElement?.id
    const t = g === 'hs-card' ? seg(p, 0.59, 0.63) : g === 'hs-model' ? seg(p, 0.61, 0.65) : g === 'hs-dash' ? seg(p, DASH[0] + 0.02, DASH[1] + 0.01) : seg(p, 0.31, 0.37)
    op(el, t)
  })
  s.prods.forEach((pr, i) => op(pr.g, ease(seg(p, 0.32 + i * 0.004, 0.35 + i * 0.004))))
  op(s.nums, seg(p, ...T.nums) * (1 - seg(p, ...T.numsOut)))
  const dt = inout(seg(p, ...T.dot))
  const qp = along([...s.wires[2].pts, s.qAt], dt) // the dot leaves the query line and follows its wire to the map
  s.qdot.setAttribute('transform', `translate(${qp.x - s.qAt.x} ${qp.y - s.qAt.y})`)
  op(s.qdot, seg(p, T.dot[0], T.dot[0] + 0.005))
  s.nl.forEach((n) => {
    const t = n.hi ? ease(seg(p, ...T.top)) : ease(seg(p, T.lines + n.rank * 0.004, T.lines + n.rank * 0.004 + 0.02))
    n.el.style.strokeDashoffset = String(n.len * (1 - t))
  })
  op(s.tag, seg(p, T.lines + 0.02, T.lines + 0.05))
  const top = seg(p, ...T.top)
  const word = seg(p, ...T.word)
  s.prods.forEach((pr) => {
    pr.hi.forEach((el) => op(el, top))
    if (pr.word) op(pr.word, word)
  })
  op(s.qhi, word)

  // 3 Answer: the three products and the messages slide into the prompt, which goes into the model
  s.chipP.forEach((c, i) => {
    const a = CHIPS_P[i]
    const t = inout(seg(p, a, a + FLY))
    const from = s.prods.find((pr) => pr.rank === i)!.pt
    at(c, lerp(from.x, s.rows.p[i].x, t), lerp(from.y, s.rows.p[i].y, t))
    op(c, seg(p, a, a + 0.008))
  })
  s.chipM.forEach((c, i) => {
    const a = CHIPS_M[i]
    const t = inout(seg(p, a, a + FLY))
    const from = s.bubC[i] ?? s.rows.m[i]
    at(c, lerp(from.x, s.rows.m[i].x, t), lerp(from.y, s.rows.m[i].y, t))
    op(c, seg(p, a, a + 0.008))
  })
  const mt = inout(seg(p, ...MINI))
  at(s.mini, lerp(s.miniFrom.x, s.miniTo.x, mt), lerp(s.miniFrom.y, s.miniTo.y, mt), ` scale(${lerp(1, 0.6, mt)})`)
  op(s.mini, seg(p, MINI[0], MINI[0] + 0.008) * (1 - seg(p, MINI[1] - 0.012, MINI[1])))
  op(s.modelHi, Math.sin(Math.PI * seg(p, ...THINK))) // the model works: its outline pulses once
  const rd = seg(p, ...REPLY_DOT)
  const rp = along([...s.wires[5].pts, s.replyC], inout(rd)) // back along its wire, then over the phone to the reply
  at(s.dot, rp.x, rp.y)
  op(s.dot, rd > 0 && rd < 1 ? 1 : 0)
  const ra = ease(seg(p, ...REPLY))
  s.reply.style.opacity = String(ra)
  s.reply.style.transform = `translateY(${8 * (1 - ra)}px)`

  // 4 Hand off: the stamp lands on the conversation; a lead card slides into the dashboard's New column
  const st = ease(seg(p, ...STAMP))
  s.stamp.style.opacity = String(seg(p, STAMP[0], STAMP[0] + 0.012))
  s.stamp.style.transform = `translateX(-50%) rotate(-8deg) scale(${lerp(1.7, 1, st)})`
  const lt = inout(seg(p, ...LEAD))
  const lp = along([...s.wires[6].pts, { x: s.leadEnd.x, y: s.lane }, s.leadEnd], lt) // out under the phone and along its wire
  at(s.lead, lp.x, lp.y, ` scale(${lerp(0.7, 1, ease(seg(p, LEAD[0], LEAD[0] + 0.03)))})`)
  op(s.lead, seg(p, LEAD[0], LEAD[0] + 0.012))

  // the flow: the wires draw in, the pulses run along them, the step numbers arrive with their scene
  s.wires.forEach((w, i) => {
    w.el.style.strokeDashoffset = String(w.len * (1 - ease(seg(p, ...WIRE_AT[i]))))
    op(w.arrow, seg(p, WIRE_AT[i][1] - 0.012, WIRE_AT[i][1]))
  })
  s.pulses.forEach(({ el, w }) => {
    const r = PULSE_AT[w].find(([a, b]) => p >= a && p < b)
    if (!r) return op(el, 0)
    const q = along(s.wires[w].pts, inout(seg(p, ...r)))
    at(el, q.x, q.y)
    op(el, 1)
  })
  s.stepn.forEach((el, i) => op(el, seg(p, ...STEPN_AT[i])))

  // captions and step ticks (static layout: every caption is on the page, nothing to drive)
  if (s.live) {
    s.caps.forEach((c, i) => {
      const [a, b] = SCENES[i]
      op(c, i === 0 ? (p < b ? clamp((b - p) / 0.015) : 0) : clamp(Math.min((p - a) / 0.015 + 1, (b - p) / 0.015)))
    })
    s.ticks.forEach((t, i) => op(t, p >= SCENES[i][0] - 0.02 && p < SCENES[i][1] ? 1 : 0))
  }
}

// The canvas is a fixed 760x560 box scaled as a whole. CSS sizes .fit (aspect-ratio), so the scale
// is read back from it and no size is ever written here.
function layout() {
  const s = S!
  const w = s.fit.clientWidth
  const h = s.fit.clientHeight
  if (!w || !h) return
  if (s.camOn) {
    s.camTw?.kill()
    Object.assign(s.cam, camFor(s.camScene, w, h))
    applyCam()
  } else {
    s.k = Math.min(w / W, h / H)
    s.tx = 0
    s.ty = 0
    s.canvas.style.transform = `scale(${s.k})`
  }
}

// Mobile camera (below 768px): .fit is a fixed-aspect window onto the canvas, and ONE translate +
// scale on the canvas eases between four framings, one per scene. Coordinates are canvas px. minText
// is the smallest text in a framing, in px: the scale never drops below what keeps it at 11px.
interface Framing {
  x0: number
  y0: number
  x1: number
  y1: number
  minText: number
}
const FRAMINGS: Framing[] = [
  { x0: 0, y0: 0, x1: 372, y1: 412, minText: 12 }, // 1 Wait: the phone and the timer
  { x0: 392, y0: 0, x1: 760, y1: 412, minText: 12 }, // 2 Find: the query and the map
  { x0: 0, y0: 124, x1: 372, y1: 536, minText: 12 }, // 3 Answer: the prompt, the model and the phone
  { x0: 392, y0: 148, x1: 760, y1: 560, minText: 12 }, // 4 Hand off: the dashboard
]
const MIN_PX = 11
let camEase: string | gsap.EaseFunction = 'power2.out'

function camFor(scene: number, w: number, h: number) {
  const f = FRAMINGS[scene]
  const fit = Math.min(w / (f.x1 - f.x0), h / (f.y1 - f.y0))
  return { cx: (f.x0 + f.x1) / 2, cy: (f.y0 + f.y1) / 2, k: Math.max(fit, MIN_PX / f.minText) }
}

function applyCam() {
  const s = S!
  const { cx, cy, k } = s.cam
  s.k = k
  s.tx = s.fit.clientWidth / 2 - cx * k
  s.ty = s.fit.clientHeight / 2 - cy * k
  s.canvas.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${k})`
}

/** Ease the camera to a scene's framing (about 0.6 s), or cut there when `instant`. */
function moveCam(scene: number, instant: boolean) {
  const s = S!
  s.camScene = scene
  if (!s.camOn || !s.fit.clientWidth) return
  s.camTw?.kill()
  const to = camFor(scene, s.fit.clientWidth, s.fit.clientHeight)
  if (instant) {
    Object.assign(s.cam, to)
    applyCam()
  } else {
    s.camTw = gsap.to(s.cam, { ...to, duration: 0.6, ease: camEase, onUpdate: applyCam })
  }
}

// Measure what the 3D phone puts where, with it at rest: the chips start from the bubbles, the reply
// dot ends at the reply, the lead card starts at the stamp. Then measure every stroke length.
function wire() {
  const s = S!
  const measure = (el: SVGGeometryElement) => {
    const L = el.getTotalLength()
    el.style.strokeDasharray = String(L)
    return L
  }
  s.lens = s.frameEls.map(measure)
  s.nl.forEach((n) => (n.len = measure(n.el)))
  const keep = s.p // render() sets s.p
  render(1) // the phone down, the bubbles and the stamp where they rest
  const c = s.canvas.getBoundingClientRect()
  const centre = (el: Element): Pt => {
    const r = el.getBoundingClientRect()
    return { x: (r.left + r.width / 2 - c.left) / s.k, y: (r.top + r.height / 2 - c.top) / s.k }
  }
  s.bubC = s.bub.map(centre)
  s.replyC = centre(s.reply)
  s.stampC = centre(s.stamp)
  // the three wires that end on the phone: its right edge (a little inside, so the line tucks under
  // the body) and the stamp, from which the lead leaves downward under it
  const pf = s.phone.querySelector('.pf')!.getBoundingClientRect()
  const edge = (pf.right - c.left) / s.k - 2
  s.lane = Math.max(s.stampC.y, 440) + 6
  const [w1, , , , , w6, w7] = s.wires
  w1.pts[0].x = edge
  w6.pts[1].x = edge
  w7.pts = [s.stampC, { x: s.stampC.x, y: s.lane }, { x: w7.pts[2].x, y: s.lane }]
  s.wires.forEach((w) => {
    w.el.setAttribute('d', poly(w.pts))
    w.arrow.setAttribute('d', arrow(w.pts))
    w.len = measure(w.el)
  })
  render(keep) // puts everything back to where the story has it
}

function relayout() {
  layout()
  wire()
}

// Player state lives at module level so it survives a gsap.matchMedia branch rebuild (crossing
// 768px, toggling reduced motion): the story then resumes where it was instead of autoplaying a
// second time. Same reasoning as data-anim-played in motion.ts.
let started = false // the story has begun (autoplay reached 40% visible, or the reader pressed Play)
let userPaused = false // the reader pressed Pause
let done = false // it reached the end and is holding the final state
let pp = 0 // last progress

const camSceneAt = (p: number) => {
  for (let i = CAM_AT.length - 1; i > 0; i--) if (p >= CAM_AT[i]) return i
  return 0
}
const sceneAt = (p: number) => {
  for (let i = SCENES.length - 1; i > 0; i--) if (p >= SCENES[i][0]) return i
  return 0
}

/** The story, played by one tween of a proxy p from 0 to 1 (DURATION s, linear) that calls
 *  render(p). Called from inside motion.ts's matchMedia branches, so the tween is reverted with its
 *  branch; the returned cleanup puts the static final state back.
 *    autoplay: true  -> starts once, the first time the section is 40% visible
 *    autoplay: false -> reduced motion: shows the final state and a Play button, never starts alone
 *  Pauses while off screen and resumes on return (unless the reader paused). */
export function hstoryPlayer(opts: { autoplay: boolean; ease?: string | gsap.EaseFunction }): () => void {
  const s = grab()
  if (!s) return () => {}
  if (opts.ease) camEase = opts.ease
  const mobile = matchMedia('(max-width: 767px)')
  const instantCam = !opts.autoplay // reduced motion: the camera cuts instead of easing
  let onScreen = false
  let scene = -1
  let camScene = -1
  let alive = true
  const ac = new AbortController()
  const { signal } = ac
  const state = { p: 0 }
  const capText = s.caps.map((c) => {
    const part = (sel: string) => c.querySelector(sel)?.textContent?.trim() ?? ''
    return `Step ${part('b')}, ${part('strong')}. ${part('span')}`
  })

  const goLive = () => {
    s.live = true
    s.root.classList.add('is-live')
    s.capsBox.setAttribute('aria-hidden', 'true') // the opacity-stacked captions are not announced; s.liveMsg is
    // nothing to scroll in the live layout: no focus stop, and no group left to name
    ;['tabindex', 'role', 'aria-label'].forEach((a) => s.frame.removeAttribute(a))
    setCam()
  }

  // Below 768px a live story frames the canvas with the camera; otherwise it scales whole.
  const setCam = () => {
    s.camOn = s.live && mobile.matches
    s.root.classList.toggle('is-cam', s.camOn)
    s.camScene = camSceneAt(pp)
    relayout()
  }

  const ui = () => {
    s.toggle.hidden = !(s.live && started && !done)
    s.toggle.setAttribute('aria-pressed', String(userPaused))
    s.again.hidden = !(done || (!opts.autoplay && !started))
    s.again.textContent = done ? 'Play again' : 'Play'
    s.again.setAttribute('aria-label', done ? 'Play the story again' : 'Play the story')
  }

  const tick = (announce: boolean) => {
    const cs = camSceneAt(pp)
    if (cs !== camScene) {
      camScene = cs
      moveCam(cs, instantCam || !announce)
    }
    const sc = sceneAt(pp)
    if (sc === scene) return
    scene = sc
    s.tickBtns.forEach((b, i) => (i === sc ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')))
    if (announce) s.liveMsg.textContent = capText[sc]
  }

  const tween = gsap.to(state, {
    p: 1,
    duration: DURATION,
    ease: 'none',
    paused: true,
    onUpdate: () => {
      if (!alive) return
      pp = state.p
      render(pp)
      tick(true)
    },
    onComplete: () => {
      if (!alive) return
      done = true
      ui()
      sync()
    },
  })

  // The one place that decides whether the tween is running.
  const sync = () => {
    const playing = alive && s.live && started && onScreen && !userPaused && !done
    tween.paused(!playing)
  }

  const seek = (p: number) => {
    pp = p
    done = p >= 1
    tween.progress(p)
    camScene = -1
    scene = -1
    render(p)
    tick(true)
  }
  const begin = (from: number | null) => {
    started = true
    userPaused = false
    if (!s.live) goLive()
    if (from !== null) seek(from)
    ui()
    sync()
  }

  if (opts.autoplay || started) goLive()
  else s.live = false
  if (!opts.autoplay && started && !done) userPaused = true // reduced motion switched on mid-play: hold, don't run
  if (s.live) {
    s.p = pp
    tween.progress(pp, true)
    relayout()
    tick(false)
  } else {
    s.p = 1
    relayout()
  }
  ui()

  s.toggle.addEventListener(
    'click',
    () => {
      userPaused = !userPaused
      ui()
      sync()
    },
    { signal },
  )
  s.again.addEventListener('click', () => begin(0), { signal })
  // a step tick jumps to the start of its scene (the first one, to the very start)
  s.tickBtns.forEach((b, i) => b.addEventListener('click', () => begin(i === 0 ? 0 : SCENES[i][0]), { signal }))

  // Visibility is read from the section's rect on scroll, resize and layout, not from an
  // IntersectionObserver (see edubra/story.ts: its "back in view" notification sometimes never arrived).
  const check = () => {
    const r = s.root.getBoundingClientRect()
    const shown = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)
    onScreen = shown > 0
    // autoplay starts at 40% of the section, or 40% of the viewport when the section is taller
    const need = Math.min(0.4 * r.height, 0.4 * innerHeight)
    if (opts.autoplay && !started && shown > 0 && shown >= need) {
      started = true
      ui()
    }
    sync()
  }
  addEventListener('scroll', check, { passive: true, signal })
  addEventListener('resize', check, { signal })
  const ro = new ResizeObserver(() => {
    relayout()
    check()
  })
  ro.observe(s.fit)
  check()
  mobile.addEventListener('change', () => s.live && setCam(), { signal })

  return () => {
    alive = false
    ro.disconnect()
    ac.abort()
    tween.kill()
    s.live = false
    s.root.classList.remove('is-live', 'is-cam')
    s.camTw?.kill()
    s.camOn = false
    s.capsBox.removeAttribute('aria-hidden')
    s.frame.setAttribute('tabindex', '0')
    s.frame.setAttribute('role', 'group')
    s.frame.setAttribute('aria-label', 'Drawing, scrolls sideways')
    s.caps.forEach((c) => c.style.removeProperty('opacity'))
    s.ticks.forEach((t) => t.style.removeProperty('opacity'))
    s.toggle.hidden = true
    s.again.hidden = true
    s.liveMsg.textContent = ''
    s.p = 1
    relayout()
  }
}
