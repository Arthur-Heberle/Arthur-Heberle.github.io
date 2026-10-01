// Runs after `astro build` (package.json "build", so the deploy workflow runs it too).
// Fails if "[FILL" appears anywhere in the built output: a [FILL] marker is a value only
// Arthur can supply and must never be published (CLAUDE.md, "never invent facts").
import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const DIST = 'dist'
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.xml', '.txt', '.json', '.svg', '.webmanifest', '.map'])
const hits = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (TEXT.has(extname(entry.name).toLowerCase())) {
      const text = readFileSync(path, 'utf8')
      const at = text.indexOf('[FILL')
      if (at !== -1) hits.push(`${path}: …${text.slice(Math.max(0, at - 40), at + 60).replace(/\s+/g, ' ')}…`)
    }
  }
}

try {
  walk(DIST)
} catch (error) {
  console.error(`check-fill: cannot read ${DIST}/ (${error.message}). Run astro build first.`)
  process.exit(1)
}

if (hits.length) {
  console.error('check-fill: "[FILL" found in the built output. Never publish a [FILL]:\n' + hits.join('\n'))
  process.exit(1)
}
console.log('check-fill: no [FILL] in dist/.')
