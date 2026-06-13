#!/usr/bin/env node
/*
 * Preprocess CCTV 표준데이터 CSV file(s) (manual download from data.go.kr /
 * localdata.go.kr — these datasets have no queryable API) into one small JSON of
 * 방범(crime-prevention) CCTV within a bounding box, for the map screen.
 *
 * Accepts one or more CSV files (e.g. 서울 + 경기). Columns/encoding are detected
 * per file, results are merged and de-duped by coordinate.
 *
 * Usage:
 *   node scripts/build-cctv.mjs <csv...>
 *   node scripts/build-cctv.mjs cctv_seoul.csv cctv_gyeonggi.csv
 *
 * Output: src/features/map/cctv-data.json  →  compact tuples [lat, lng, purpose, address]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/features/map/cctv-data.json')

// Keep the bundle bounded: only 방범 CCTV inside this box (수도권 — 서울·경기·인천).
const BOX = { minLat: 36.8, maxLat: 38.4, minLng: 126.3, maxLng: 127.95 }
// Purposes to keep (설치목적구분 substrings). 방범/생활방범 + 어린이보호(안전 관련).
const KEEP_PURPOSE = ['방범', '생활안전', '어린이']

const csvPaths = process.argv.slice(2)
if (csvPaths.length === 0) {
  console.error('Usage: node scripts/build-cctv.mjs <csv...>  (e.g. cctv_seoul.csv cctv_gyeonggi.csv)')
  process.exit(1)
}

// Korean gov CSVs are EUC-KR or UTF-8 — detect per file.
function decode(b) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(b).replace(/^﻿/, '')
  } catch {
    return new TextDecoder('euc-kr').decode(b)
  }
}

// Minimal CSV parser (handles quotes, escaped quotes, CRLF).
function parseCsv(str) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (inQuotes) {
      if (c === '"') {
        if (str[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c === '\r') {
      // ignore (CRLF handled by \n)
    } else field += c
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const seen = new Set()
const out = []

function processFile(path) {
  const text = decode(readFileSync(resolve(process.cwd(), path)))
  const rows = parseCsv(text)
  if (rows.length < 2) {
    console.warn(`! ${path}: empty/unparseable — skipped`)
    return
  }
  const header = rows[0].map((h) => h.trim())
  const findCol = (...names) =>
    header.findIndex((h) => names.some((n) => h.includes(n)))
  const idx = {
    lat: findCol('위도'),
    lng: findCol('경도'),
    purpose: findCol('설치목적'),
    road: findCol('소재지도로명'),
    jibun: findCol('소재지지번'),
  }
  if (idx.lat < 0 || idx.lng < 0) {
    console.warn(
      `! ${path}: 위도/경도 컬럼을 못 찾음 — skipped. (헤더: ${header.join(', ')})`,
    )
    return
  }

  let parsed = 0
  let kept = 0
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    parsed++
    const lat = Number(row[idx.lat])
    const lng = Number(row[idx.lng])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (lat < BOX.minLat || lat > BOX.maxLat) continue
    if (lng < BOX.minLng || lng > BOX.maxLng) continue
    const purpose = (idx.purpose >= 0 ? row[idx.purpose] : '').trim()
    if (KEEP_PURPOSE.length && !KEEP_PURPOSE.some((p) => purpose.includes(p)))
      continue
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
    if (seen.has(key)) continue
    seen.add(key)
    const address = (
      (idx.road >= 0 ? row[idx.road] : '') ||
      (idx.jibun >= 0 ? row[idx.jibun] : '')
    ).trim()
    out.push([Number(lat.toFixed(6)), Number(lng.toFixed(6)), purpose || '방범', address])
    kept++
  }
  console.log(`✓ ${path}: parsed ${parsed} → kept ${kept}`)
}

for (const path of csvPaths) processFile(path)

writeFileSync(OUT, JSON.stringify(out))
const kb = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(0)
console.log(`\nTotal kept (deduped): ${out.length} 방범 CCTV`)
console.log(`Wrote ${OUT} (${kb} KB)`)
