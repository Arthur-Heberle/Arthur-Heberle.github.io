// The hero's dotted world map (Arthur, 2026-11-18). Built in Node during `astro build` with dotted-map
// (a dev dependency): nothing of the library ships to the browser, the page gets plain <circle>s.
// Each dot is tagged with the identity line that lights it: 'cwb' (Curitiba, Brasil) or 'eu' (EU citizen:
// Italy). 'open to global remote' lights every dot, so it needs no tag.
import DottedMap, { getMapJSON, type MapData } from 'dotted-map'

export type Region = 'cwb' | 'eu'
export interface Dot {
  x: number
  y: number
  region?: Region
}
export interface WorldMap {
  width: number
  height: number
  dots: Dot[]
}

const HEIGHT = 60 // rows of dots; about 3000 dots for the whole world
const GRID = 'diagonal' as const
const CURITIBA = { lat: -25.43, lng: -49.27 }
const CWB_RADIUS = 1.6 // grid units around Curitiba that light up with its line (about 7 dots)

let cached: WorldMap | undefined

export function worldMap(): WorldMap {
  if (cached) return cached
  const world: MapData = JSON.parse(getMapJSON({ height: HEIGHT, grid: GRID }))
  // Same height, grid and region as the world, so Italy's grid keys ("col;row") are the world's keys
  const italy: MapData = JSON.parse(
    getMapJSON({ height: HEIGHT, grid: GRID, countries: ['ITA'], region: world.region }),
  )
  const pin = new DottedMap({ height: HEIGHT, grid: GRID }).getPin(CURITIBA)
  if (!pin) throw new Error('worldMap: Curitiba is outside the map')

  const round = (n: number) => Math.round(n * 100) / 100
  const dots: Dot[] = Object.entries(world.points).map(([key, p]) => {
    let region: Region | undefined
    if (italy.points[key]) region = 'eu'
    else if (Math.hypot(p.x - pin.x, p.y - pin.y) <= CWB_RADIUS) region = 'cwb'
    return { x: round(p.x), y: round(p.y), region }
  })
  if (!dots.some((d) => d.region === 'eu') || !dots.some((d) => d.region === 'cwb')) {
    throw new Error('worldMap: a region has no dots')
  }
  cached = { width: world.width, height: round(world.height), dots }
  return cached
}
