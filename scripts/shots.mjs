// pnpm shots: screenshots of the built site, for looking at it (Arthur, 2026-10-24).
//
//   pnpm shots                    build, then every page at 1440, 1024 and 390
//   node scripts/shots.mjs home 1440     only the pages / widths named (no build)
//   node scripts/shots.mjs --out before  save into shots/before/ instead of shots/
//
// Starts `astro preview` itself and stops it. Uses the installed Edge (not Brave, not Playwright's own
// Chromium). Each page is scrolled through first so every on-arrival animation has played, then
// shot full-page and, because a sticky element renders wrongly in a full-page capture, also as
// viewport shots: the home page's sections and each Experience block centred in the viewport.
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const PORT = 4399
const BASE = `http://localhost:${PORT}`
const PAGES = { home: '/', edubra: '/projects/edubra/', 'agente-h': '/projects/agente-h/' }
const WIDTHS = { 1440: 900, 1024: 768, 390: 844 }

const args = process.argv.slice(2)
const outIdx = args.indexOf('--out')
const outName = outIdx >= 0 ? args.splice(outIdx, 2)[1] : ''
const pageNames = args.filter((a) => a in PAGES)
const widths = args.filter((a) => a in WIDTHS).map(Number)
const pages = pageNames.length ? pageNames : Object.keys(PAGES)
const sizes = widths.length ? widths : Object.keys(WIDTHS).map(Number)

const outDir = join('shots', outName)
mkdirSync(outDir, { recursive: true })

// ---- the preview server ----
const server = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' })
const stop = () => {
  try {
    execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' })
  } catch {}
}
process.on('exit', stop)
process.on('SIGINT', () => process.exit(1))

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('preview server did not start')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Scroll the whole page in steps so every reveal, draw and autoplay has had its trigger. */
async function playThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const step = Math.round((await page.evaluate(() => innerHeight)) * 0.4)
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), y)
    await sleep(160)
  }
  await sleep(1200)
}

/** Scroll so the middle of `selector`'s nth match is the middle of the viewport. */
async function centre(page, selector, n = 0) {
  const ok = await page.evaluate(
    ([sel, i]) => {
      const el = document.querySelectorAll(sel)[i]
      if (!el) return false
      const r = el.getBoundingClientRect()
      scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: 'instant' })
      return true
    },
    [selector, n],
  )
  return ok
}

/** Scroll so the top of `selector` sits `pad` px below the top of the viewport. */
async function top(page, selector, pad = 0) {
  return page.evaluate(
    ([sel, p]) => {
      const el = document.querySelector(sel)
      if (!el) return false
      scrollTo({ top: scrollY + el.getBoundingClientRect().top - p, behavior: 'instant' })
      return true
    },
    [selector, pad],
  )
}

async function shot(page, name, wait = 700) {
  await sleep(wait)
  await page.screenshot({ path: join(outDir, `${name}.png`) })
  console.log('  ', name)
}

async function homeViewports(page, w) {
  const tag = (part) => `home-${w}-${part}`
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await shot(page, tag('hero'))
  if (await top(page, '[data-spine]', 80)) await shot(page, tag('spine'))
  if (await top(page, '[data-datasheet]', 40)) await shot(page, tag('datasheet-a'))
  if (await centre(page, '.ds-tables')) await shot(page, tag('datasheet-b'))
  if (await top(page, '#projects-heading', 60)) await shot(page, tag('bench'), 1800)
  if (await top(page, '#experience-heading', 60)) await shot(page, tag('experience-top'))
  const blocks = await page.evaluate(() => document.querySelectorAll('.xp-block').length)
  for (let i = 0; i < blocks; i++) {
    const id = await page.evaluate((n) => document.querySelectorAll('.xp-block')[n].dataset.id, i)
    await centre(page, '.xp-block', i)
    // the swap, then the object's action, take a moment
    await shot(page, tag(`xp-${i}-${id}`), id === 'rp3' || id === 'eletron-energia' ? 3500 : 2200)
  }
  if (await top(page, '#changelog-heading', 60)) await shot(page, tag('changelog'))
  if (await top(page, '#contact-heading', 60)) await shot(page, tag('contact'))
}

async function projectViewports(page, name, w) {
  const tag = (part) => `${name}-${w}-${part}`
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  await shot(page, tag('top'))
  if (await centre(page, '.story')) await shot(page, tag('story-start'), 600)
  // the story plays by itself (about 10 to 15 s) once 40% of it is in view
  if (await centre(page, '.story')) await shot(page, tag('story-end'), 17000)
  if (await top(page, '[data-numbers]', 120)) await shot(page, tag('numbers'), 1500)
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await shot(page, tag('bottom'))
}

await waitForServer()
const browser = await chromium.launch({ channel: 'msedge' })
try {
  for (const name of pages) {
    for (const w of sizes) {
      console.log(`${name} @ ${w}`)
      const ctx = await browser.newContext({ viewport: { width: w, height: WIDTHS[w] }, deviceScaleFactor: 1, hasTouch: w < 768, isMobile: false })
      const page = await ctx.newPage()
      page.on('pageerror', (e) => console.log('   page error:', e.message))
      await page.goto(BASE + PAGES[name], { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await sleep(800)
      await playThrough(page)
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await sleep(600)
      await page.screenshot({ path: join(outDir, `${name}-${w}-full.png`), fullPage: true })
      console.log('  ', `${name}-${w}-full`)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      if (overflow > 0) console.log(`   horizontal overflow: ${overflow}px`)
      if (name === 'home') await homeViewports(page, w)
      else await projectViewports(page, name, w)
      await ctx.close()
    }
  }
} finally {
  await browser.close()
  stop()
}
