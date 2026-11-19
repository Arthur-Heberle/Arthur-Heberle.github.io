// The hero's dotted map (Arthur, 2026-11-18): the Americas and Europe only, since 2026-11-18 (was the whole
// world; that version is on the branch hero-map-full-hero). Russia is left out: it would stretch the map to the
// Pacific. Cyprus counts as Asia here. Built in Node during `astro build` with dotted-map
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

const HEIGHT = 60 // rows of dots; about 1200 dots
const GRID = 'diagonal' as const
// ISO 3166 alpha-3 keys from dotted-map's countries.geo.json (Kosovo is 'CS-KM' there)
const AMERICAS =
  'ARG BHS BLZ BMU BOL BRA CAN CHL COL CRI CUB DOM ECU FLK GRL GTM GUF GUY HND HTI JAM MEX NIC PAN PER PRI PRY SLV SUR TTO URY USA VEN'
const EUROPE =
  'ALB AUT BEL BGR BIH BLR CHE CZE DEU DNK ESP EST FIN FRA GBR GRC HRV HUN IRL ISL ITA CS-KM LTU LUX LVA MDA MKD MLT MNE NLD NOR POL PRT ROU SRB SVK SVN SWE UKR'
const COUNTRIES = `${AMERICAS} ${EUROPE}`.split(' ')
// Fixed, so Alaska's Aleutians (past 180 degrees) don't widen the box to the whole globe; the north is cut at
// 72 degrees so Greenland and Svalbard don't take over the top under Mercator
const REGION = { lat: { min: -56, max: 72 }, lng: { min: -170, max: 42 } }
const CURITIBA = { lat: -25.43, lng: -49.27 }
const CWB_RADIUS = 1.6 // grid units around Curitiba that light up with its line (about 7 dots)

let cached: WorldMap | undefined

export function worldMap(): WorldMap {
  if (cached) return cached
  const world: MapData = JSON.parse(getMapJSON({ height: HEIGHT, grid: GRID, countries: COUNTRIES, region: REGION }))
  // Same height, grid and region as the map, so Italy's grid keys ("col;row") are the world's keys
  const italy: MapData = JSON.parse(
    getMapJSON({ height: HEIGHT, grid: GRID, countries: ['ITA'], region: REGION }),
  )
  const pin = new DottedMap({ height: HEIGHT, grid: GRID, countries: COUNTRIES, region: REGION }).getPin(CURITIBA)
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
