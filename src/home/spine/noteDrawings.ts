// The five note drawings' motion (markup: NoteDrawing.astro). Each ships in its final state; this
// puts one at its start state (reset) and plays it once to that final state (play). Nothing loops:
// spine.ts plays a drawing when its note arrives and again on hover or focus of the note or its
// marker. Only stroke-dashoffset, opacity and transform are animated, and the end of every play
// clears what it set, so the markup is exactly the final state again.
import { gsap } from 'gsap'

const ease = () => gsap.parseEase('reveal') ?? 'power4.out'
const length = (_: number, el: Element) => (el as SVGGeometryElement).getTotalLength()

export interface Art {
  /** Put the drawing at its start state (hidden strokes, the first word, the knob at maximum). */
  reset(): void
  /** Reset, then run once to the final state. `delay` lets the note's own reveal lead. */
  play(delay?: number): void
  /** Stop and leave the final markup (reduced motion). */
  settle(): void
  running(): boolean
}

export function makeArt(svg: SVGSVGElement, kind: string): Art | null {
  const all = <T extends Element>(sel: string) => [...svg.querySelectorAll<T>(sel)]
  const hide = (paths: Element[]) => gsap.set(paths, { strokeDasharray: length, strokeDashoffset: length })
  let tl: gsap.core.Timeline | null = null
  let reset: () => void
  let build: (tl: gsap.core.Timeline) => void
  let clear: () => void

  if (kind === 'reading') {
    // a decision tree: it branches out of its first node, level by level
    const l0 = all('[data-l="0"]')
    const l1 = all('[data-l="1"]')
    const n1 = all('[data-n="1"]')
    const n2 = all('[data-n="2"]')
    reset = () => {
      hide([...l0, ...l1])
      gsap.set([...n1, ...n2], { opacity: 0 })
    }
    build = (t) => {
      t.to(l0, { strokeDashoffset: 0, duration: 0.4, ease: ease() }, 0)
      t.to(n1, { opacity: 1, duration: 0.15 }, 0.3)
      t.to(l1, { strokeDashoffset: 0, duration: 0.4, ease: ease(), stagger: 0.06 }, 0.35)
      t.to(n2, { opacity: 1, duration: 0.15, stagger: 0.06 }, 0.7)
    }
    clear = () => gsap.set(all('path, circle'), { clearProps: 'strokeDasharray,strokeDashoffset,opacity' })
  } else if (kind === 'working-on') {
    // a volume knob: the indicator comes back from maximum to the middle
    const ind = svg.querySelector('.d-ind')!
    reset = () => {
      gsap.set(ind, { rotation: 135, svgOrigin: '28 30' })
    }
    build = (t) => {
      t.to(ind, { rotation: 0, svgOrigin: '28 30', duration: 1.1, ease: ease() }, 0)
    }
    clear = () => gsap.set(ind, { clearProps: 'transform' })
  } else if (kind === 'languages') {
    // a word slot: hello, olá, ciao, then bonjour?, each crossfading into the next
    const words = all('text')
    reset = () => {
      gsap.set(words, { opacity: 0 })
      gsap.set(words[0], { opacity: 1 })
    }
    build = (t) => {
      for (let i = 1; i < words.length; i++) {
        t.to(words[i - 1], { opacity: 0, duration: 0.3 }, i * 0.9)
        t.to(words[i], { opacity: 1, duration: 0.3 }, i * 0.9)
      }
    }
    clear = () => gsap.set(words, { clearProps: 'opacity' })
  } else if (kind === 'chess') {
    // a knight's L: two squares up, then one across
    const knight = svg.querySelector('.d-knight')!
    reset = () => {
      gsap.set(knight, { x: -10, y: 20 })
    }
    build = (t) => {
      t.to(knight, { y: 0, duration: 0.5, ease: 'power2.inOut' }, 0)
      t.to(knight, { x: 0, duration: 0.3, ease: 'power2.inOut' }, 0.6)
    }
    clear = () => gsap.set(knight, { clearProps: 'transform' })
  } else if (kind === 'guitar') {
    // one string between two pegs: a few frames of decreasing height, then still
    const frames = all('[data-f]')
    reset = () => {
      gsap.set(frames, { opacity: 0 })
      gsap.set(frames[0], { opacity: 1 })
    }
    build = (t) => {
      for (let i = 1; i < frames.length; i++) {
        t.to(frames[i - 1], { opacity: 0, duration: 0.08 }, i * 0.16)
        t.to(frames[i], { opacity: 1, duration: 0.08 }, i * 0.16)
      }
    }
    clear = () => gsap.set(frames, { clearProps: 'opacity' })
  } else {
    return null
  }

  return {
    reset,
    play(delay = 0) {
      tl?.kill()
      reset()
      tl = gsap.timeline({ delay, onComplete: clear })
      build(tl)
    },
    settle() {
      tl?.kill()
      clear()
    },
    running: () => !!tl && tl.isActive(),
  }
}
