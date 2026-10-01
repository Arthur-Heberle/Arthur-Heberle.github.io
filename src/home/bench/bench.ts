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

export function initBench(bench: HTMLElement) {
  bench.classList.add('wb-live') // the MDF texture is fetched only now
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const items = [...bench.querySelectorAll<HTMLElement>('.wb-item')]
  const stacked = matchMedia('(max-width: 767px)').matches
  const hover = matchMedia('(hover: hover)').matches

  items.forEach((item) => {
    const root = item.querySelector<HTMLElement>('[data-wb]')
    const make = root && ACTIONS[root.dataset.wb ?? '']
    if (!root || !make) return
    const action = make(root)
    let running = false
    const play = () => {
      if (running) return
      running = true
      action().eventCallback('onComplete', () => (running = false))
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
      seen.observe(item.querySelector('.wb-obj')!)
    }
  })

  if (stacked) return
  // arrival: the three objects come down onto the surface, one after the other
  const objs = items.map((item) => item.querySelector<HTMLElement>('.wb-obj')!)
  gsap.set(objs, { opacity: 0, y: -36 })
  const arrive = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      arrive.disconnect()
      gsap.to(objs, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.18,
        ease: ease(),
        onComplete: () => gsap.set(objs, { clearProps: 'opacity,transform' }),
      })
    },
    { threshold: 0.25 },
  )
  arrive.observe(bench)
}
