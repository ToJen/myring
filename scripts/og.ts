/**
 * Generates social preview cards and static share pages into public/.
 *
 * Link previews are fetched by crawlers that ignore the URL fragment and never
 * run JavaScript, so every hash route would otherwise share one generic card.
 * Instead, share links point at real paths (/s/<primary>/<secondary>/ for
 * results, /c/... for challenges). Each path is a tiny HTML page with its own
 * Open Graph image that forwards visitors to the matching hash route, query
 * string included.
 *
 * Runs before `vite build` (see package.json). Output is gitignored.
 */
import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ARCHETYPE, SITE } from '../src/lib/archetypes'
import { RINGS, RING_COLOR, RING_FORCE, identityLine } from '../src/lib/rings'
import type { Ring } from '../src/lib/types'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const BASE = '/myring'
const W = 1200
const H = 630
const BG = '#050505'
const MUTED = '#8a8a93'

const fonts = [join(ROOT, 'scripts/fonts/SpaceGrotesk-500.ttf'), join(ROOT, 'scripts/fonts/SpaceGrotesk-700.ttf')]

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function ring(cx: number, cy: number, r: number, color: string, width: number): string {
  // Soft glow from stacked translucent strokes; cheaper and smaller than blur filters.
  const halo = [3, 2.2, 1.6, 1.25].map((k, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width * k}" opacity="${0.05 + i * 0.04}"/>`).join('')
  return `${halo}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>
    <circle cx="${cx}" cy="${cy}" r="${r - width / 2 - 6}" fill="none" stroke="${color}" stroke-width="2" opacity="0.35"/>`
}

function frame(inner: string, a: string, b: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="ga" cx="0.22" cy="0.5" r="0.55"><stop offset="0" stop-color="${a}" stop-opacity="0.28"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gb" cx="0.9" cy="0.95" r="0.6"><stop offset="0" stop-color="${b}" stop-opacity="0.22"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#ga)"/>
  <rect width="${W}" height="${H}" fill="url(#gb)"/>
  <g font-family="Space Grotesk">${inner}</g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#ffffff" stroke-opacity="0.08"/>
</svg>`
}

/** Splits an uppercase archetype name into at most two balanced lines. */
function splitName(name: string): string[] {
  const words = name.replace(/^The\s+/i, '').toUpperCase().split(' ')
  if (words.join(' ').length <= 13 || words.length === 1) return [words.join(' ')]
  let best = [words.join(' ')]
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ')
    const b = words.slice(i).join(' ')
    const diff = Math.abs(a.length - b.length)
    if (diff < bestDiff) {
      bestDiff = diff
      best = [a, b]
    }
  }
  return best
}

function textBlock(lines: string[], x: number, y: number, size: number, extra = ''): string {
  return lines.map((l, i) => `<text x="${x}" y="${y + i * size * 1.02}" font-size="${size}" font-weight="700" fill="#ffffff" ${extra}>${esc(l)}</text>`).join('')
}

function resultCard(primary: Ring, secondary: Ring): string {
  const a = RING_COLOR[primary]
  const b = RING_COLOR[secondary]
  const name = ARCHETYPE[primary][secondary] ?? `The ${RING_FORCE[primary]} Bearer`
  const lines = splitName(name)
  const size = lines.length > 1 ? 66 : 74
  const x = 560
  const rings = ring(270, 300, 150, a, 28) + ring(430, 430, 66, b, 14)
  const nameY = lines.length > 1 ? 262 : 300
  const identity = identityLine(primary, secondary)
  const [first, ...rest] = identity.split(' ')
  return frame(
    `${rings}
    <text x="${x}" y="130" font-size="22" font-weight="700" fill="${a}" letter-spacing="8">MY RING CHOSE ${primary.toUpperCase()}</text>
    <text x="${x}" y="190" font-size="20" font-weight="500" fill="${MUTED}" letter-spacing="6">THE</text>
    ${textBlock(lines, x, nameY, size)}
    <text x="${x}" y="${nameY + (lines.length - 1) * size * 1.02 + 64}" font-size="24" font-weight="500" letter-spacing="4"><tspan fill="${a}">${esc(first)}</tspan><tspan fill="${MUTED}"> ${esc(rest.slice(0, -1).join(' '))} </tspan><tspan fill="${b}">${esc(rest[rest.length - 1])}</tspan></text>
    <text x="${x}" y="548" font-size="22" font-weight="500" fill="#ffffff" opacity="0.9">Which ring chooses you?</text>
    <text x="${x}" y="582" font-size="20" font-weight="500" fill="${MUTED}">${SITE.replace('https://', '')}  ·  three trials, about 60 seconds</text>`,
    a,
    b,
  )
}

function challengeCard(primary: Ring, secondary: Ring): string {
  const a = RING_COLOR[primary]
  const b = RING_COLOR[secondary]
  const x = 560
  const rings = ring(270, 300, 150, a, 28) + ring(430, 430, 66, b, 14)
  return frame(
    `${rings}
    <text x="${x}" y="130" font-size="22" font-weight="700" fill="${a}" letter-spacing="8">YOU HAVE BEEN CHALLENGED</text>
    <text x="${x}" y="200" font-size="26" font-weight="500" fill="${MUTED}" letter-spacing="3">A friend was chosen by</text>
    <text x="${x}" y="290" font-size="80" font-weight="700" fill="${a}">${primary.toUpperCase()}</text>
    <text x="${x}" y="370" font-size="34" font-weight="500" fill="${MUTED}">×  <tspan fill="${b}" font-weight="700" font-size="46">${secondary.toUpperCase()}</tspan></text>
    <text x="${x}" y="440" font-size="26" font-weight="500" fill="#ffffff" opacity="0.9">${esc(cap(RING_FORCE[primary]))} carried by ${esc(RING_FORCE[secondary])}.</text>
    <text x="${x}" y="548" font-size="30" font-weight="700" fill="#ffffff">Will your ring match?</text>
    <text x="${x}" y="582" font-size="20" font-weight="500" fill="${MUTED}">${SITE.replace('https://', '')}  ·  three trials, about 60 seconds</text>`,
    a,
    b,
  )
}

function defaultCard(): string {
  const rings = RINGS.map((r, i) => ring(150 + i * 150, 250, 48, RING_COLOR[r], 11)).join('')
  return frame(
    `${rings}
    <text x="600" y="400" text-anchor="middle" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="-2">MyRing</text>
    <text x="600" y="460" text-anchor="middle" font-size="28" font-weight="500" fill="${MUTED}">Seven rings. Seven forces. One of them wants you.</text>
    <text x="600" y="560" text-anchor="middle" font-size="22" font-weight="500" fill="#ffffff" opacity="0.85">Three trials, about 60 seconds  ·  ${SITE.replace('https://', '')}</text>`,
    '#168BFF',
    '#6945FF',
  )
}

function png(svg: string): Buffer {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Space Grotesk' } })
  return Buffer.from(r.render().asPng())
}

function sharePage(opts: { title: string; description: string; image: string; url: string; route: 'result' | 'challenge' }): string {
  const { title, description, image, url, route } = opts
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="${BG}">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MyRing">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="${W}">
<meta property="og:image:height" content="${H}">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<script>location.replace(${JSON.stringify(`${BASE}/#/${route}`)} + location.search)</script>
</head>
<body style="background:${BG};color:#fff;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<noscript><a href="${BASE}/" style="color:#fff">Open MyRing</a></noscript>
</body>
</html>
`
}

function write(rel: string, data: string | Buffer) {
  const file = join(PUBLIC, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, data)
}

for (const dir of ['og', 's', 'c']) rmSync(join(PUBLIC, dir), { recursive: true, force: true })

write('og/default.png', png(defaultCard()))
let count = 1

for (const primary of RINGS) {
  for (const secondary of RINGS) {
    if (primary === secondary) continue
    const name = ARCHETYPE[primary][secondary] ?? `The ${RING_FORCE[primary]} Bearer`
    const pair = `${primary}/${secondary}`
    write(`og/r-${primary}-${secondary}.png`, png(resultCard(primary, secondary)))
    write(`og/c-${primary}-${secondary}.png`, png(challengeCard(primary, secondary)))
    write(
      `s/${pair}/index.html`,
      sharePage({
        title: `${name} · MyRing`,
        description: `My ring chose ${primary.toUpperCase()}. ${cap(RING_FORCE[primary])} ${identityLine(primary, secondary).split(' ').slice(1, -1).join(' ').toLowerCase()} ${RING_FORCE[secondary]}. Which ring chooses you? Three trials, about 60 seconds.`,
        image: `${SITE}/og/r-${primary}-${secondary}.png`,
        url: `${SITE}/s/${pair}/`,
        route: 'result',
      }),
    )
    write(
      `c/${pair}/index.html`,
      sharePage({
        title: `You have been challenged · MyRing`,
        description: `A friend was chosen by ${primary.toUpperCase()} × ${secondary.toUpperCase()} (${name}). Will your ring match? Three trials, about 60 seconds.`,
        image: `${SITE}/og/c-${primary}-${secondary}.png`,
        url: `${SITE}/c/${pair}/`,
        route: 'challenge',
      }),
    )
    count += 2
  }
}

console.log(`og: wrote ${count} cards and ${count - 1} share pages into public/`)
