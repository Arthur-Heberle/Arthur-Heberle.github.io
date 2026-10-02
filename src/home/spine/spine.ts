// The spine's annotation layer: from 768px up, each note is stood beside the line of its balloon
// in the text and a leader runs from one balloon to the other, through the gutter. Below that, or
// without JavaScript, nothing here applies: the notes follow their paragraph in the flow and each
// balloon is still a real link (and aria-describedby) to its note. Nothing is required content.
//
// Geometry is measured, never assumed, and in the rail's own pixels: the paragraphs and notes
// carry a reveal transform (motion.ts), so a position is the element's layout offset plus the
// difference between two rects inside the same transformed element (which cancels the transform).
// Only stroke-dashoffset animates (the leader drawing in, once, when its paragraph arrives).
import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const NOTE_GAP = 32 // between two stacked notes
const BALLOON = 18

// motion.ts's one curve (the CustomEase 'reveal'), by name; power4.out is the same shape.
const ease = () => gsap.parseEase('reveal') ?? 'power4.out'

interface Pair {
  id: string
  marker: HTMLElement
  note: HTMLElement
  back: HTMLElement
  prose: HTMLElement
  group: HTMLElement
}

export function initSpine() {
  const rail = document.querySelector<HTMLElement>('[data-spine]')
  const svg = rail?.querySelector<SVGSVGElement>('.spine-leaders')
  if (!rail || !svg) return
  const desktop = matchMedia('(min-width: 768px)')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')

  const pairs: Pair[] = [...rail.querySelectorAll<HTMLElement>('a.balloon[id^="marker-"]')].flatMap((marker) => {
    const id = marker.id.replace('marker-', '')
    const note = rail.querySelector<HTMLElement>(`#note-${id}`)
    const back = note?.querySelector<HTMLElement>('.balloon')
    const prose = marker.closest<HTMLElement>('.rail-prose')
    const group = note?.closest<HTMLElement>('.rail-margin')
    return note && back && prose && group ? [{ id, marker, note, back, prose, group }] : []
  })

  // hover or keyboard focus on a balloon or its note lights both balloons and the line
  const link = (pair: Pair, on: boolean) => {
    for (const el of [pair.marker, pair.back, pair.note]) el.toggleAttribute('data-linked', on)
    svg.querySelector(`g[data-id="${pair.id}"]`)?.toggleAttribute('data-linked', on)
  }
  for (const pair of pairs) {
    for (const el of [pair.marker, pair.back, pair.note]) {
      el.addEventListener('pointerenter', () => link(pair, true))
      el.addEventListener('pointerleave', () => link(pair, false))
      el.addEventListener('focusin', (e) => {
        if ((e.target as HTMLElement).matches(':focus-visible')) link(pair, true)
      })
      el.addEventListener('focusout', () => link(pair, false))
    }
  }

  // paragraphs whose leaders have drawn in; a re-layout keeps them drawn
  const drawn = new Set<HTMLElement>()

  const pos = (el: HTMLElement, within: HTMLElement) => {
    // centre of `el`, in rail pixels, for an `el` inside `within` (a laid-out child of the rail)
    const a = el.getBoundingClientRect()
    const b = within.getBoundingClientRect()
    return { x: within.offsetLeft + (a.left - b.left), y: within.offsetTop + (a.top - b.top), w: a.width, h: a.height }
  }

  function layout() {
    gsap.killTweensOf(svg!.querySelectorAll('path'))
    svg!.replaceChildren()
    if (!desktop.matches) {
      rail!.classList.remove('notes-placed')
      rail!.style.minHeight = ''
      for (const pair of pairs) pair.note.style.top = ''
      return
    }
    rail!.classList.add('notes-placed')
    rail!.style.minHeight = ''

    const lh = parseFloat(getComputedStyle(pairs[0].prose).lineHeight) || 28
    const marks = pairs.map((pair) => {
      const m = pos(pair.marker, pair.prose)
      return { pair, cx: m.x + m.w / 2, cy: m.y + m.h / 2 }
    })

    // notes: each at its balloon's height, pushed down to keep NOTE_GAP from the one above
    let prevBottom = -Infinity
    const ends = marks.map(({ pair, cy }) => {
      const top = Math.max(cy - BALLOON / 2, prevBottom + NOTE_GAP)
      pair.note.style.top = `${top - pair.group.offsetTop}px`
      prevBottom = top + pair.note.offsetHeight
      return { x: pair.group.offsetLeft, y: top + BALLOON / 2 }
    })
    rail!.style.minHeight = `${Math.ceil(prevBottom)}px`

    // leaders: down into the gap under the balloon's line, right to the prose edge, across the
    // gutter, into the note's balloon. Balloons sharing a line get lanes 3px apart, the leftmost
    // lowest, so no two run along one another.
    marks.forEach((mark, i) => {
      const { pair, cx, cy } = mark
      const sameLine = marks.filter((o) => o.pair.prose === pair.prose && Math.abs(o.cy - cy) < lh / 2)
      const rank = [...sameLine].sort((a, b) => a.cx - b.cx).indexOf(mark)
      const lane = cy + lh / 2 + (rank - (sameLine.length - 1) / 2) * 3
      const end = ends[i]
      // one vertical channel in the gutter per leader, 4px apart, the first note's nearest the
      // notes: a lower lane always turns nearer the text, so no two leaders cross there
      const turn = end.x - 6 - i * 4
      const d = `M${cx} ${cy + BALLOON / 2} V${lane} H${turn} V${end.y} H${end.x}`
      const g = document.createElementNS(NS, 'g')
      g.dataset.id = pair.id
      for (const cls of ['leader-base', 'leader-hi']) {
        const p = document.createElementNS(NS, 'path')
        p.setAttribute('class', cls)
        p.setAttribute('d', d)
        g.append(p)
      }
      svg!.append(g)
      if (!drawn.has(pair.prose) && !reduced.matches) {
        const len = g.querySelector('path')!.getTotalLength()
        for (const p of g.querySelectorAll('path')) {
          p.style.strokeDasharray = `${len}`
          p.style.strokeDashoffset = `${len}`
        }
      }
      if (pair.note.matches('[data-linked]')) g.toggleAttribute('data-linked', true)
    })
  }

  // each paragraph's leaders draw in once, as it arrives (top 85%, like the reveals), each a
  // beat after the last, behind the paragraph by the margin notes' usual 200ms
  function draw(prose: HTMLElement) {
    if (drawn.has(prose)) return
    drawn.add(prose)
    if (reduced.matches || !desktop.matches) return
    const gs = [...svg!.querySelectorAll<SVGGElement>('g')].filter((g) => pairs.find((p) => p.id === g.dataset.id)?.prose === prose)
    gs.forEach((g, i) => {
      const paths = g.querySelectorAll<SVGPathElement>('path')
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: ease(),
        delay: 0.2 + 0.06 * i,
        onComplete: () => gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' }),
      })
    })
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) draw(e.target as HTMLElement)
    },
    { rootMargin: '0px 0px -15% 0px' },
  )

  let frame = 0
  const relayout = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(layout)
  }
  layout()
  for (const prose of new Set(pairs.map((p) => p.prose))) io.observe(prose)
  const ro = new ResizeObserver(relayout)
  for (const prose of new Set(pairs.map((p) => p.prose))) ro.observe(prose)
  desktop.addEventListener('change', relayout)
  reduced.addEventListener('change', relayout)
  document.fonts?.ready.then(relayout)
}
