// Builds public/data/india-map.json: projected SVG paths for 36 states/UTs and one point per
// Lok Sabha constituency. Source: DataMeet India community, github.com/datameet/maps (CC BY 4.0).
//
// Usage: node scripts/build-map.mjs <dir with Admin2.shp + .dbf/.shx/.prj and pc.geojson>
//   Admin2.*   = datameet/maps States/Admin2.*  (state boundaries, updated to the SOI map in 2021)
//   pc.geojson = datameet/maps parliamentary-constituencies/india_pc_2019_simplified.geojson
// Needs network once for `npx mapshaper`.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const src = process.argv[2]
if (!src) throw new Error('Pass the folder holding Admin2.shp and pc.geojson')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bi-map-'))
const PROJ = '+proj=lcc +lat_1=12 +lat_2=32 +lat_0=22 +lon_0=82 +datum=WGS84 +units=m'
const ms = (...args) => execFileSync(`npx -y mapshaper ${args.join(' ')}`, { stdio: 'inherit', shell: true })

const q = (p) => `"${p}"`
ms('-i', q(path.join(src, 'Admin2.shp')), 'name=states',
  '-proj', q(PROJ),
  '-simplify', `interval=${process.env.SIMPLIFY || 1000}`, 'keep-shapes',
  '-o', q(path.join(tmp, 'states.json')), 'format=geojson')
ms('-i', q(path.join(src, 'pc.geojson')), 'name=pc',
  '-proj', q(PROJ),
  '-points', 'inner',
  '-i', q(path.join(src, 'Admin2.shp')), 'name=st',
  '-proj', 'target=st', q(PROJ),
  '-join', 'target=pc', 'st', 'fields=ST_NM',
  '-o', 'target=pc', q(path.join(tmp, 'pc.json')), 'format=geojson')

const NAME = {
  'Andaman & Nicobar': 'AN', 'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', Assam: 'AS', Bihar: 'BR',
  Chandigarh: 'CH', Chhattisgarh: 'CG', 'Dadra and Nagar Haveli and Daman and Diu': 'DH', Delhi: 'DL', Goa: 'GA',
  Gujarat: 'GJ', Haryana: 'HR', 'Himachal Pradesh': 'HP', 'Jammu & Kashmir': 'JK', Jharkhand: 'JH', Karnataka: 'KA',
  Kerala: 'KL', Ladakh: 'LA', Lakshadweep: 'LD', 'Madhya Pradesh': 'MP', Maharashtra: 'MH', Manipur: 'MN',
  Meghalaya: 'ML', Mizoram: 'MZ', Nagaland: 'NL', Odisha: 'OD', Puducherry: 'PY', Punjab: 'PB', Rajasthan: 'RJ',
  Sikkim: 'SK', 'Tamil Nadu': 'TN', Telangana: 'TG', Tripura: 'TR', 'Uttar Pradesh': 'UP', Uttarakhand: 'UK',
  'West Bengal': 'WB',
}

const states = JSON.parse(fs.readFileSync(path.join(tmp, 'states.json'), 'utf8')).features
const pcs = JSON.parse(fs.readFileSync(path.join(tmp, 'pc.json'), 'utf8')).features

// Fit projected metres into a 1000-wide viewBox, y pointing down.
let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
const rings = (g) => (g.type === 'Polygon' ? g.coordinates : g.coordinates.flat())
for (const f of states) for (const r of rings(f.geometry)) for (const [x, y] of r) {
  x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
}
const W = 1000
const k = W / (x1 - x0)
const H = Math.round((y1 - y0) * k)
const P = ([x, y]) => [+((x - x0) * k).toFixed(1), +((y1 - y) * k).toFixed(1)]

const out = { width: W, height: H, attribution: 'Boundaries and constituencies: DataMeet India community (CC BY 4.0)', states: {}, seats: [] }
for (const f of states) {
  const iso = NAME[f.properties.ST_NM]
  if (!iso) throw new Error(`Unknown state ${f.properties.ST_NM}`)
  let d = ''
  let [bx0, by0, bx1, by1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const r of rings(f.geometry)) {
    const pts = r.map(P)
    for (const [x, y] of pts) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y) }
    // Relative moves keep the file small.
    d += `M${pts[0].join(' ')}l` + pts.slice(1).map((p, i) => `${+(p[0] - pts[i][0]).toFixed(1)} ${+(p[1] - pts[i][1]).toFixed(1)}`).join(' ') + 'z'
  }
  out.states[iso] = { d, box: [bx0, by0, +(bx1 - bx0).toFixed(1), +(by1 - by0).toFixed(1)].map((v) => +(+v).toFixed(1)) }
}
for (const f of pcs) {
  const iso = NAME[f.properties.ST_NM]
  if (!iso) throw new Error(`Seat ${f.properties.pc_name} fell outside every state`)
  const [x, y] = P(f.geometry.coordinates)
  out.seats.push({ s: iso, n: f.properties.pc_name, c: f.properties.pc_category, x, y })
}
out.seats.sort((a, b) => a.s.localeCompare(b.s) || a.n.localeCompare(b.n))

const dest = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..', 'public', 'data', 'india-map.json')
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, JSON.stringify(out))
const per = Object.groupBy(out.seats, (s) => s.s)
console.log(`wrote ${dest}: ${(fs.statSync(dest).size / 1024).toFixed(0)} KB, ${Object.keys(out.states).length} areas, ${out.seats.length} seats`)
console.log(Object.entries(per).map(([k, v]) => `${k}:${v.length}`).join(' '))
