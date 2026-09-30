// EduBra's "How it works" story (EdubraStory.astro), ported from Arthur's reference
// prototype (edubra-story.html, 2026-09-30). render(p) is a pure function of progress p in
// [0, 1]; storyPlayer() drives it from ONE GSAP tween of a proxy p (autoplay, ~10 s, linear,
// no pin, no scrub), and the static mode (below 768px for now) calls render(1).
// motion.ts owns the matchMedia branches and calls storyPlayer() / storyStatic() from them.
//
// The timeline fractions (T, SCENES, DROP) and the item sequence (ITEMS) are the
// prototype's, kept exactly. Only transform, opacity and stroke-dashoffset change, so a few
// prototype effects that changed something else are rebuilt as an opacity crossfade between
// two stacked elements: the lit Wi-Fi arcs, the highlighted audio card, the "already read"
// characters, the big letter, the Pi's ACT LED, the step ticks, and the read cursor (four
// paths that move and scale instead of a rect whose x/width change).
import { gsap } from 'gsap'
import { BRAILLE_ALPHABET } from './braille'

const W = 1060
const H = 570
const DURATION = 10 // seconds, linear: render(p) is driven by a tween of p from 0 to 1
const TEXT = 'hello world'
const PIN_H = 8
const TAPE_X = 415 // the SVG tape box's left edge; the HTML tape is the same box, scaled

type Range = [number, number]
interface Item {
  w?: number
  from?: number
  to?: number
  c?: number
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const inout = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2 // travel: no bunching at the end
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// The Pi's reading loop, in order: the word's audio, then each of its letters.
const ITEMS: Item[] = [
  { w: 0, from: 0, to: 4 },
  ...[0, 1, 2, 3, 4].map((i) => ({ c: i })),
  { w: 1, from: 6, to: 10 },
  ...[6, 7, 8, 9, 10].map((i) => ({ c: i })),
]
const cx = (i: number) => 440 + i * 30

// Timeline, as fractions of the scroll distance.
const T: Record<string, Range> = {
  draw: [0, 0.07],
  file: [0.06, 0.11],
  bar: [0.1, 0.14],
  text: [0.14, 0.16],
  split: [0.17, 0.22],
  fly0: [0.22, 0.31],
  fly1: [0.27, 0.36],
  land0: [0.31, 0.37],
  land1: [0.36, 0.41],
  card0: [0.34, 0.37],
  wave0: [0.36, 0.42],
  card1: [0.39, 0.42],
  wave1: [0.42, 0.47],
  bank: [0.45, 0.49],
  run: [0.5, 0.53],
  runDot: [0.51, 0.55],
  tape: [0.53, 0.56],
  read: [0.56, 1],
}
const SCENES: Range[] = [
  [0.02, 0.22],
  [0.22, 0.36],
  [0.36, 0.5],
  [0.5, 1.2],
]
const DROP: [string, number, number][] = [
  ['#o-pi', 0, 0.05],
  ['#o-cell', 0.012, 0.062],
  ['#o-spk', 0.024, 0.074],
]
const CARD_C: [number, number][] = [
  [534, 78],
  [654, 78],
]
const CHIP_START: [number, number][] = [
  [98, 318],
  [178, 318],
]

type Drawn = [SVGGeometryElement, number]

interface Story {
  root: HTMLElement
  frame: HTMLElement
  fit: HTMLElement
  canvas: HTMLElement
  objs: [HTMLElement, number, number][]
  fades: SVGElement[]
  drawEls: SVGGeometryElement[]
  waveEls: SVGGeometryElement[]
  draws: Drawn[]
  waves: Drawn[]
  arc: SVGPathElement
  wCell: SVGPathElement
  wSpk: SVGPathElement
  len: { arc: number; cell: number; spk: number }
  cards: SVGElement[]
  cardHi: SVGElement[]
  playheads: SVGElement[]
  chips: SVGElement[]
  wfHi: SVGElement
  file: SVGElement
  bar: SVGElement
  rawtext: SVGElement
  bank: SVGElement
  runbtn: SVGElement
  dotRun: SVGElement
  dotCell: SVGElement
  dotSpk: SVGElement
  tape: SVGElement
  waveSet: SVGElement
  bigs: SVGElement[]
  now: SVGElement[]
  was: SVGElement[]
  cur: { l: SVGElement; r: SVGElement; t: SVGElement; b: SVGElement }
  pins: Record<number, HTMLElement[]>
  dust: HTMLElement
  actLit: HTMLElement
  caps: HTMLElement[]
  ticks: HTMLElement[]
  tickBtns: HTMLButtonElement[]
  capsBox: HTMLElement
  toggle: HTMLButtonElement
  again: HTMLButtonElement
  liveMsg: HTMLElement
  tapeHtml: HTMLElement
  tbox: HTMLElement
  hNow: HTMLElement[]
  hWas: HTMLElement[]
  hcur: { l: HTMLElement; r: HTMLElement; t: HTMLElement; b: HTMLElement }
  tf: number // HTML tape scale: its box width over the SVG tape's 350
  camOn: boolean
  cam: { cx: number; cy: number; k: number }
  camScene: number
  camTw: gsap.core.Tween | null
  live: boolean
  k: number
  p: number
}

let S: Story | null = null

function grab(): Story | null {
  if (S) return S
  const root = document.querySelector<HTMLElement>('[data-story]')
  if (!root) return null
  const $ = <E extends Element>(sel: string) => root.querySelector<E>(sel)!
  const $$ = <E extends Element>(sel: string) => [...root.querySelectorAll<E>(sel)]
  const pins: Record<number, HTMLElement[]> = {}
  $$<HTMLElement>('.bhole').forEach((h) => (pins[+h.dataset.n!] = [...h.querySelectorAll<HTMLElement>('.bpin i')]))
  S = {
    root,
    frame: $('.frame'),
    fit: $('.fit'),
    canvas: $('.canvas'),
    objs: DROP.map(([sel, a, b]) => [$<HTMLElement>(sel), a, b]),
    fades: $$<SVGElement>('.fade'),
    drawEls: $$<SVGGeometryElement>('.draw'),
    waveEls: $$<SVGGeometryElement>('.wave'),
    draws: [],
    waves: [],
    arc: $('#arc'),
    wCell: $('#w-cell'),
    wSpk: $('#w-spk'),
    len: { arc: 1, cell: 1, spk: 1 },
    cards: [$('#card0'), $('#card1')],
    cardHi: $$<SVGElement>('.card-hi'),
    playheads: [$('#play0'), $('#play1')],
    chips: [$('#chip0'), $('#chip1')],
    wfHi: $('.wf-hi'),
    file: $('#file'),
    bar: $('#bar'),
    rawtext: $('#rawtext'),
    bank: $('#bank'),
    runbtn: $('#runbtn'),
    dotRun: $('#dotRun'),
    dotCell: $('#dotCell'),
    dotSpk: $('#dotSpk'),
    tape: $('#tape'),
    waveSet: $('#waves'),
    bigs: $$<SVGElement>('.bigletter'),
    now: $$<SVGElement>('.ch .now'),
    was: $$<SVGElement>('.ch .was'),
    cur: { l: $('#cur-l'), r: $('#cur-r'), t: $('#cur-t'), b: $('#cur-b') },
    pins,
    dust: $('.dust'),
    actLit: $('#act-lit'),
    caps: $$<HTMLElement>('.cap'),
    ticks: $$<HTMLElement>('.ticks u'),
    tickBtns: $$<HTMLButtonElement>('.ticks button'),
    capsBox: $('.caps'),
    toggle: $('[data-toggle]'),
    again: $('[data-again]'),
    liveMsg: $('[data-live]'),
    tapeHtml: $('.tape-html'),
    tbox: $('.tape-html .tbox'),
    hNow: $$<HTMLElement>('.tape-html .now'),
    hWas: $$<HTMLElement>('.tape-html .was'),
    hcur: { l: $('.tcur.l'), r: $('.tcur.r'), t: $('.tcur.t'), b: $('.tcur.b') },
    tf: 1,
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

const at = (path: SVGPathElement, len: number, t: number) => path.getPointAtLength(clamp(t) * len)
const op = (el: Element, v: number) => ((el as SVGElement).style.opacity = String(v))

function render(p: number) {
  const s = S!
  s.p = p

  // 0. the software draws itself; the hardware comes down onto the table
  const d = ease(seg(p, ...T.draw))
  s.draws.forEach(([el, L]) => (el.style.strokeDashoffset = String(L * (1 - d))))
  s.fades.forEach((el) => op(el, d))
  s.objs.forEach(([o, a, b]) => {
    const t = ease(seg(p, a, b))
    o.style.opacity = String(t)
    o.style.transform = `translateY(${-36 * (1 - t)}px)`
  })

  // 1. upload: a file drops into the page, the bar fills, the text is extracted
  const f = ease(seg(p, ...T.file))
  s.file.setAttribute('transform', `translate(${lerp(40, 168, f)} ${lerp(4, 180, f)})`)
  op(s.file, p < T.file[0] ? 0 : 1 - seg(p, 0.13, 0.145))
  s.bar.setAttribute('transform', `translate(64 280) scale(${ease(seg(p, ...T.bar))} 1)`)
  op(s.rawtext, seg(p, ...T.text) * (1 - seg(p, 0.17, 0.185)))

  // 2. over Wi-Fi, 3. into audio files
  s.chips.forEach((c, k) => {
    const split = ease(seg(p, ...T.split))
    const fly = inout(seg(p, ...(k ? T.fly1 : T.fly0)))
    const land = ease(seg(p, ...(k ? T.land1 : T.land0)))
    const start = CHIP_START[k]
    let x: number
    let y: number
    if (fly === 0) {
      x = start[0] + (k ? 8 * split : -2 * split)
      y = start[1]
    } else if (land === 0) {
      const a = at(s.arc, s.len.arc, fly)
      const m = Math.min(1, fly * 4)
      x = lerp(start[0], a.x, m)
      y = lerp(start[1], a.y, m)
    } else {
      const a = at(s.arc, s.len.arc, 1)
      x = lerp(a.x, CARD_C[k][0], land)
      y = lerp(a.y, CARD_C[k][1], land)
    }
    c.setAttribute('transform', `translate(${x} ${y})`)
    op(c, seg(p, 0.17, 0.18) * (1 - seg(p, ...(k ? ([0.39, 0.42] as Range) : ([0.35, 0.38] as Range)))))
    const cr = seg(p, ...(k ? T.card1 : T.card0))
    op(s.cards[k], cr)
    s.cards[k].setAttribute('transform', `translate(0 ${6 * (1 - ease(cr))})`)
  })
  s.waves.forEach(([el, L], i) => (el.style.strokeDashoffset = String(L * (1 - seg(p, ...(i ? T.wave1 : T.wave0))))))
  op(s.bank, seg(p, ...T.bank))
  const flying = p > T.fly0[0] && p < T.land1[1]
  op(s.wfHi, flying || (p > T.runDot[0] && p < T.runDot[1]) ? 1 : 0)

  // 4. Run is pressed on the page, the command crosses Wi-Fi, then the read loop
  const press = seg(p, ...T.run)
  const dip = press < 0.5 ? press * 2 : (1 - press) * 2
  s.runbtn.setAttribute('transform', `translate(0 ${2.5 * dip})`)
  const rd = seg(p, ...T.runDot)
  const pr = at(s.arc, s.len.arc, rd)
  s.dotRun.setAttribute('transform', `translate(${pr.x} ${pr.y})`)
  op(s.dotRun, rd > 0 && rd < 1 ? 1 : 0)
  op(s.tape, seg(p, ...T.tape))
  op(s.tapeHtml, seg(p, ...T.tape)) // below 768px the tape is HTML text under the canvas (same values)

  const r = seg(p, ...T.read)
  const started = p >= T.read[0]
  const n = ITEMS.length
  const idx = Math.min(n - 1, Math.floor(r * n))
  const q = r >= 1 ? 1 : (r * n) % 1
  const it = started ? ITEMS[idx] : null
  const span = (i: Item): Range => (i.w !== undefined ? [i.from!, i.to!] : [i.c!, i.c!])
  const prev = started && idx > 0 ? span(ITEMS[idx - 1]) : span(ITEMS[0])
  const cur = it ? span(it) : span(ITEMS[0])
  const kk = ease(clamp(q / 0.25)) // the cursor slides to the current item during the first quarter of it
  const x0 = lerp(cx(prev[0]) - 12, cx(cur[0]) - 12, started ? kk : 1)
  const x1 = lerp(cx(prev[1]) + 12, cx(cur[1]) + 12, started ? kk : 1)
  s.cur.l.setAttribute('transform', `translate(${x0} 0)`)
  s.cur.r.setAttribute('transform', `translate(${x1} 0)`)
  const line = `translate(${x0 + 3} 0) scale(${x1 - x0 - 6} 1)`
  s.cur.t.setAttribute('transform', line)
  s.cur.b.setAttribute('transform', line)
  const hx = (x: number) => (x - TAPE_X) * s.tf // SVG tape x -> HTML tape px
  s.hcur.l.style.transform = `translateX(${hx(x0)}px)`
  s.hcur.r.style.transform = `translateX(${hx(x1) - 4}px)`
  const hline = `translateX(${hx(x0 + 3)}px) scaleX(${(x1 - x0 - 6) * s.tf})`
  s.hcur.t.style.transform = hline
  s.hcur.b.style.transform = hline
  s.now.forEach((el, i) => {
    const done = started && i < cur[0]
    op(el, done ? 0 : 1)
    op(s.was[i], done ? 1 : 0)
    op(s.hNow[i], done ? 0 : 1)
    op(s.hWas[i], done ? 1 : 0)
  })

  // a word item: its audio file plays (the playhead sweeps), the sound goes to the speaker, the pins stay down
  ;[0, 1].forEach((w) => {
    const on = !!it && it.w === w
    op(s.cardHi[w], on ? 1 : 0)
    op(s.playheads[w], on ? 1 : 0)
    s.playheads[w].setAttribute('transform', `translate(${on ? 88 * q : 0} 0)`)
  })

  // a letter item: its pins rise (a stack of discs, translateZ), the letter shows large
  const letter = it && it.c !== undefined ? TEXT[it.c] : null
  const dots = letter ? BRAILLE_ALPHABET[letter] : []
  const up = ease(clamp(q / 0.15)) // pins rise at the start of each letter
  Object.entries(s.pins).forEach(([nn, discs]) => {
    const u = dots.includes(+nn) ? up : 0
    discs.forEach((el, i) => {
      el.style.opacity = u > 0 ? '1' : '0'
      el.style.transform = `translateZ(${PIN_H * u * [0.35, 0.7, 1][i]}px)`
    })
  })
  s.bigs.forEach((el) => op(el, letter && el.dataset.l === letter ? 1 : 0))

  if (letter) {
    const pc = at(s.wCell, s.len.cell, q / 0.5)
    s.dotCell.setAttribute('transform', `translate(${pc.x} ${pc.y})`)
    op(s.dotCell, q < 0.5 ? 1 : 0)
  } else op(s.dotCell, 0)
  if (it) {
    const ps = at(s.wSpk, s.len.spk, q / 0.6)
    s.dotSpk.setAttribute('transform', `translate(${ps.x} ${ps.y})`)
    op(s.dotSpk, q < 0.6 ? 1 : 0)
  } else op(s.dotSpk, 0)
  const sounding = !!it && q > 0.45
  op(s.waveSet, sounding ? (it!.w !== undefined ? 1 : 0.55) : 0)
  s.dust.style.transform = `scale(${sounding ? 1 + 0.12 * Math.sin(((q - 0.45) / 0.55) * Math.PI) : 1})` // the cone pushes

  // the Pi's green ACT LED: flickers while it writes the audio files and at each step of the loop
  const writing = p > 0.36 && p < 0.47 && Math.floor(p * 500) % 2 === 0
  const stepping = !!it && q < 0.3
  op(s.actLit, writing || stepping ? 1 : 0)

  // captions and step ticks (static layout: every caption is on the page, nothing to drive)
  if (s.live) {
    s.caps.forEach((c, i) => {
      const [a, b] = SCENES[i]
      op(c, i === 0 ? (p < b ? clamp((b - p) / 0.015) : 0) : clamp(Math.min((p - a) / 0.015 + 1, (b - p) / 0.015)))
    })
    s.ticks.forEach((t, i) => op(t, p >= SCENES[i][0] - 0.02 && p < SCENES[i][1] ? 1 : 0))
  }
}

// The canvas is a fixed 1060x570 box scaled as a whole. CSS sizes .fit (aspect-ratio, and in
// live mode a max-height), so the scale is read back from it and no size is ever written here.
function layout() {
  const s = S!
  const w = s.fit.clientWidth
  const h = s.fit.clientHeight
  if (!w || !h) return
  if (s.tbox.clientWidth) s.tf = s.tbox.clientWidth / 350
  if (s.camOn) {
    s.camTw?.kill()
    Object.assign(s.cam, camFor(s.camScene, w, h))
    applyCam()
  } else {
    s.k = Math.min(w / W, h / H)
    s.canvas.style.transform = `scale(${s.k})`
  }
}

// Mobile camera (below 768px): .fit is a fixed-aspect window onto the canvas, and ONE
// translate + scale on the canvas eases between four framings, one per scene. Coordinates
// are canvas px (SVG y + 10). minText is the smallest text in the framing, in px: the
// scale never drops below what keeps it at 11px, so a narrower window crops the edges of a
// framing instead of shrinking its text.
interface Framing {
  x0: number
  y0: number
  x1: number
  y1: number
  minText: number
}
const FRAMINGS: Framing[] = [
  { x0: 20, y0: 100, x1: 363, y1: 440, minText: 11 }, // 1 Send a file: the web page
  { x0: 388, y0: 110, x1: 731, y1: 430, minText: 11 }, // 2 Over Wi-Fi: the arc and the Pi
  { x0: 430, y0: 20, x1: 773, y1: 390, minText: 11 }, // 3 Audio first: the two files and the Pi
  { x0: 740, y0: 110, x1: 1060, y1: 520, minText: 15 }, // 4 Read: the cell, the speaker, the big letter
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
  s.canvas.style.transform = `translate(${s.fit.clientWidth / 2 - cx * k}px, ${s.fit.clientHeight / 2 - cy * k}px) scale(${k})`
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

// Hang the 2D wires on the anchors inside the 3D parts: measure them with the hardware at
// rest, rewrite the three paths, then re-measure every stroke length.
function wire() {
  const s = S!
  s.objs.forEach(([o]) => {
    o.style.transform = 'none'
    o.style.opacity = '1'
  })
  const c = s.canvas.getBoundingClientRect()
  const pt = (id: string) => {
    const r = document.getElementById(id)!.getBoundingClientRect()
    return { x: (r.left + r.width / 2 - c.left) / s.k, y: (r.top + r.height / 2 - c.top) / s.k - 10 }
  }
  const inP = pt('a-pi-in')
  const g = pt('a-gpio')
  const cell = pt('a-cell')
  const j = pt('a-jack')
  const si = pt('a-spk-in')
  const so = pt('a-spk-out')
  s.arc.setAttribute('d', `M340 255 C 380 150, ${inP.x - 70} 150, ${inP.x} ${inP.y}`)
  s.wCell.setAttribute('d', `M${g.x} ${g.y} C ${g.x + 70} ${g.y}, ${cell.x - 60} ${cell.y}, ${cell.x} ${cell.y}`)
  s.wSpk.setAttribute('d', `M${j.x} ${j.y} C ${j.x} ${si.y}, ${si.x - 110} ${si.y}, ${si.x} ${si.y}`)
  s.waveSet.setAttribute('transform', `translate(${so.x + 4} ${so.y})`)
  const measure = (el: SVGGeometryElement): Drawn => {
    const L = el.getTotalLength()
    el.style.strokeDasharray = String(L)
    return [el, L]
  }
  s.draws = s.drawEls.map(measure)
  s.waves = s.waveEls.map(measure)
  s.len = { arc: s.arc.getTotalLength(), cell: s.wCell.getTotalLength(), spk: s.wSpk.getTotalLength() }
  render(s.p) // puts the hardware back to where the story has it
}

function relayout() {
  layout()
  wire()
}

// Player state lives at module level so it survives a gsap.matchMedia branch rebuild
// (crossing 768px, toggling reduced motion): the story then resumes where it was instead of
// autoplaying a second time. Same reasoning as data-anim-played in motion.ts.
let started = false // the story has begun (autoplay reached 40% visible, or the reader pressed Play)
let userPaused = false // the reader pressed Pause
let done = false // it reached the end and is holding the final state
let pp = 0 // last progress

const sceneAt = (p: number) => {
  for (let i = SCENES.length - 1; i > 0; i--) if (p >= SCENES[i][0]) return i
  return 0
}

/** The story, played by one tween of a proxy p from 0 to 1 (DURATION s, linear) that calls
 *  render(p). Called from inside motion.ts's matchMedia branches, so the tween is reverted
 *  with its branch; the returned cleanup puts the static final state back.
 *    autoplay: true  -> starts once, the first time the section is 40% visible
 *    autoplay: false -> reduced motion: shows the final state and a Play button, never starts alone
 *  Pauses while off screen and resumes on return (unless the reader paused). */
export function storyPlayer(opts: { autoplay: boolean; ease?: string | gsap.EaseFunction }): () => void {
  const s = grab()
  if (!s) return () => {}
  if (opts.ease) camEase = opts.ease
  const mobile = matchMedia('(max-width: 767px)')
  const instantCam = !opts.autoplay // reduced motion: the camera cuts instead of easing
  let onScreen = false
  let scene = -1
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
    s.frame.removeAttribute('tabindex') // nothing to scroll in the live layout
    setCam()
  }

  // Below 768px a live story frames the canvas with the camera; otherwise it scales whole.
  const setCam = () => {
    s.camOn = s.live && mobile.matches
    s.root.classList.toggle('is-cam', s.camOn)
    s.camScene = sceneAt(pp)
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
    const sc = sceneAt(pp)
    if (sc === scene) return
    scene = sc
    moveCam(sc, instantCam || !announce)
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
    const run = alive && s.live && started && onScreen && !userPaused && !done
    tween.paused(!run)
  }

  const seek = (p: number) => {
    pp = p
    done = p >= 1
    tween.progress(p)
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
    tween.progress(pp)
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
  s.tickBtns.forEach((b, i) =>
    b.addEventListener('click', () => begin(i === 0 ? 0 : SCENES[i][0]), { signal }),
  )

  const steps = Array.from({ length: 21 }, (_, i) => i / 20)
  const io = new IntersectionObserver(
    ([e]) => {
      onScreen = e.isIntersecting
      // 40% of the section, or 40% of the viewport when the section is taller than that
      const need = Math.min(0.4 * e.boundingClientRect.height, 0.4 * innerHeight)
      if (opts.autoplay && !started && e.isIntersecting && e.intersectionRect.height >= need) {
        started = true
        ui()
      }
      sync()
    },
    { threshold: steps },
  )
  io.observe(s.root)
  const ro = new ResizeObserver(() => relayout())
  ro.observe(s.fit)
  mobile.addEventListener('change', () => s.live && setCam(), { signal })

  return () => {
    alive = false
    io.disconnect()
    ro.disconnect()
    ac.abort()
    tween.kill()
    s.live = false
    s.root.classList.remove('is-live', 'is-cam')
    s.camTw?.kill()
    s.camOn = false
    s.capsBox.removeAttribute('aria-hidden')
    s.frame.setAttribute('tabindex', '0')
    s.caps.forEach((c) => c.style.removeProperty('opacity'))
    s.ticks.forEach((t) => t.style.removeProperty('opacity'))
    s.toggle.hidden = true
    s.again.hidden = true
    s.liveMsg.textContent = ''
    s.p = 1
    relayout()
  }
}
