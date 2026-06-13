#!/usr/bin/env node
/*
 * Preprocess the 서울시 안심지킴이집 CSV (점포명 + 주소, no coordinates) into a small
 * JSON with coordinates, by geocoding each address via the Kakao Local REST API.
 * Build-time only — the REST key is never shipped to the app.
 *
 * Usage:
 *   KAKAO_REST_API_KEY=xxxx node scripts/build-safehouses.mjs safehouse_seoul.csv
 *
 * Output: src/features/map/safehouses.json  →  tuples [lat, lng, name, address]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/features/map/safehouses.json')

const KEY = process.env.KAKAO_REST_API_KEY
const csvPath = process.argv[2]
if (!KEY) {
  console.error('Set KAKAO_REST_API_KEY (Kakao app → 앱 키 → REST API 키).')
  process.exit(1)
}
if (!csvPath) {
  console.error(
    'Usage: KAKAO_REST_API_KEY=xxx node scripts/build-safehouses.mjs <csv>',
  )
  process.exit(1)
}

function decode(b) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(b).replace(/^﻿/, '')
  } catch {
    return new TextDecoder('euc-kr').decode(b)
  }
}

function parseCsv(str) {
  const rows = []
  let row = []
  let field = ''
  let q = false
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (q) {
      if (c === '"') {
        if (str[i + 1] === '"') {
          field += '"'
          i++
        } else q = false
      } else field += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const rows = parseCsv(decode(readFileSync(resolve(process.cwd(), csvPath))))
const header = rows[0].map((h) => h.trim())
const col = (...names) =>
  header.findIndex((h) => names.some((n) => h.includes(n)))
const idx = {
  brand: col('브랜드'),
  gu: col('자치구'),
  store: col('점포'),
  addr: col('주소'),
}
if (idx.addr < 0) {
  console.error('주소 컬럼을 못 찾음. 헤더:', header.join(', '))
  process.exit(1)
}

async function kakao(path, query) {
  const url = `https://dapi.kakao.com/v2/local/search/${path}.json?query=${encodeURIComponent(query)}`
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KEY}` },
    })
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      continue
    }
    if (!res.ok) return null
    const j = await res.json()
    const d = j.documents?.[0]
    return d ? { lat: Number(d.y), lng: Number(d.x) } : null
  }
  return null
}

async function geocode(address, name) {
  // Many rows omit "서울특별시" and wrap the 동 in parens, e.g. "광진구 (자양3동) 427-13".
  const cleaned = `서울특별시 ${address.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()}`
  const variants = address.startsWith('서울') ? [address] : [address, cleaned]
  for (const q of variants) {
    const hit = await kakao('address', q)
    if (hit) return hit
  }
  // No POI/keyword fallback on purpose: a wrong-but-plausible match (e.g. a
  // different CU branch) would place the pin at the wrong place.
  return null
}

const records = rows.slice(1).filter((r) => (r[idx.addr] || '').trim())
const out = []
let ok = 0
let fail = 0
const CONCURRENCY = 6

async function worker(queue) {
  while (queue.length) {
    const r = queue.shift()
    const address = r[idx.addr].trim()
    const name =
      [r[idx.brand], r[idx.store]].filter(Boolean).join(' ').trim() ||
      '안심지킴이집'
    const pos = await geocode(address)
    if (pos && Number.isFinite(pos.lat) && Number.isFinite(pos.lng)) {
      out.push([
        Number(pos.lat.toFixed(6)),
        Number(pos.lng.toFixed(6)),
        name,
        address,
      ])
      ok++
    } else {
      fail++
      if (fail <= 10) console.warn('  geocode 실패:', address)
    }
    if ((ok + fail) % 100 === 0)
      console.log(`  ...${ok + fail}/${records.length}`)
  }
}

const queue = [...records]
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))

writeFileSync(OUT, JSON.stringify(out))
const kb = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(0)
console.log(`\nGeocoded ${ok}/${records.length} (실패 ${fail}).`)
console.log(`Wrote ${OUT} (${kb} KB)`)
