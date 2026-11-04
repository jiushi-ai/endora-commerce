#!/usr/bin/env node
/**
 * Machine-translate Admin module i18n en.json → zh-CN.json / zh-TW.json.
 * Preserves existing zh values that already differ from en.
 * Preserves ICU / brace placeholders via token shielding.
 * zh-TW is OpenCC(cn→tw) from the written zh-CN values.
 *
 * Usage: node scripts/mt-admin-i18n-zh.mjs [--only _i18n] [--force]
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MODULES = path.join(ROOT, 'packages/modules')
const CACHE_DIR = path.join(ROOT, 'scripts/.mt-cache')
const FORCE = process.argv.includes('--force')
const ONLY = (() => {
  const i = process.argv.indexOf('--only')
  return i >= 0 ? process.argv[i + 1] : null
})()

const require = createRequire(import.meta.url)
const OpenCC = require('/tmp/opencc-mt/node_modules/opencc-js')
const cnToTw = OpenCC.Converter({ from: 'cn', to: 'tw' })

fs.mkdirSync(CACHE_DIR, { recursive: true })

function walkEnFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist') continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walkEnFiles(p, out)
    else if (ent.name === 'en.json' && p.includes(`${path.sep}i18n${path.sep}`)) out.push(p)
  }
  return out
}

function shield(text) {
  const tokens = []
  const shielded = text
    .replace(/\{\{[^{}]+\}\}/g, (m) => {
      const i = tokens.length
      tokens.push(m)
      return `__PH${i}__`
    })
    .replace(/\{[^{}]+\}/g, (m) => {
      const i = tokens.length
      tokens.push(m)
      return `__PH${i}__`
    })
  return { shielded, tokens }
}

function unshield(text, tokens) {
  let out = text
  for (let i = 0; i < tokens.length; i++) {
    out = out.replaceAll(`__PH${i}__`, tokens[i])
    out = out.replaceAll(`__ PH${i} __`, tokens[i])
    out = out.replaceAll(`__PH ${i}__`, tokens[i])
  }
  return out
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function translateGoogleCurl(shielded, tl) {
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(shielded)}`
  const r = spawnSync('curl', ['-sS', '--max-time', '30', url], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
  if (r.status !== 0) {
    throw new Error(`curl exit ${r.status}: ${(r.stderr || '').slice(0, 200)}`)
  }
  const body = (r.stdout || '').trim()
  if (!body || body.startsWith('<!')) throw new Error('translate blocked/html')
  let data
  try {
    data = JSON.parse(body)
  } catch {
    throw new Error(`translate bad json: ${body.slice(0, 120)}`)
  }
  return (data[0] || []).map((seg) => seg[0]).join('')
}

async function translateOne(text, tl) {
  const { shielded, tokens } = shield(text)
  return unshield(translateGoogleCurl(shielded, tl), tokens)
}

function loadCache(tl) {
  const f = path.join(CACHE_DIR, `en-to-${tl}.json`)
  if (!fs.existsSync(f)) return new Map()
  return new Map(Object.entries(JSON.parse(fs.readFileSync(f, 'utf8'))))
}

function saveCache(tl, map) {
  const f = path.join(CACHE_DIR, `en-to-${tl}.json`)
  fs.writeFileSync(f, JSON.stringify(Object.fromEntries(map), null, 0) + '\n')
}

async function translateBatchLines(texts, tl) {
  // Strings with real newlines go one-by-one; others share one curl call.
  const singles = []
  const batched = []
  for (const t of texts) {
    if (t.includes('\n') || t.includes('\r')) singles.push(t)
    else batched.push(t)
  }
  const out = new Map()
  for (const t of singles) out.set(t, await translateOne(t, tl))

  if (batched.length === 0) return out

  const shieldedMeta = batched.map((t) => shield(t))
  const q = shieldedMeta.map((m) => m.shielded).join('\n')
  const joined = translateGoogleCurl(q, tl)
  const parts = joined.split('\n')
  if (parts.length !== batched.length) {
    // Fallback: one-by-one for this chunk
    for (const t of batched) out.set(t, await translateOne(t, tl))
    return out
  }
  for (let i = 0; i < batched.length; i++) {
    out.set(batched[i], unshield(parts[i], shieldedMeta[i].tokens))
  }
  return out
}

async function fillCache(unique, tl) {
  const cache = loadCache(tl)
  const missing = unique.filter((s) => !cache.has(s))
  console.log(`[${tl}] cache hit ${unique.length - missing.length}, miss ${missing.length}`)
  const BATCH = 40
  let done = 0
  for (let i = 0; i < missing.length; i += BATCH) {
    const chunk = missing.slice(i, i + BATCH)
    let attempts = 0
    for (;;) {
      try {
        const map = await translateBatchLines(chunk, tl)
        for (const [k, v] of map) cache.set(k, v)
        break
      } catch (err) {
        attempts++
        if (attempts >= 10) throw err
        const wait = /429|blocked|curl exit|SSL/.test(String(err.message))
          ? 5000 * attempts
          : 1000 * attempts
        console.warn(
          `[${tl}] batch@${i} retry ${attempts}: ${err.message}; sleep ${wait}ms`,
        )
        await sleep(wait)
      }
    }
    done += chunk.length
    saveCache(tl, cache)
    console.log(`[${tl}] progress ${Math.min(done, missing.length)}/${missing.length}`)
    await sleep(200)
  }
  saveCache(tl, cache)
  return cache
}

function shouldSkipValue(v) {
  if (typeof v !== 'string') return true
  if (v.trim() === '') return true
  if (/^[\d\s.,:;_\-/#@+*()[\]{}|\\]+$/.test(v)) return true
  return false
}

function applyLocale(enPath, locale, cache) {
  const dir = path.dirname(enPath)
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const outPath = path.join(dir, `${locale}.json`)
  let existing = {}
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, 'utf8'))
    } catch {
      existing = {}
    }
  }
  const out = {}
  let translated = 0
  let kept = 0
  for (const [k, v] of Object.entries(en)) {
    if (typeof v !== 'string') {
      out[k] = existing[k] ?? v
      continue
    }
    const prev = existing[k]
    if (!FORCE && typeof prev === 'string' && prev !== v && prev.trim() !== '') {
      out[k] = prev
      kept++
      continue
    }
    if (shouldSkipValue(v) || !cache.has(v)) {
      out[k] = prev ?? v
      continue
    }
    out[k] = cache.get(v)
    translated++
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n')
  return { translated, kept, keys: Object.keys(en).length }
}

async function main() {
  let files = walkEnFiles(MODULES)
  if (ONLY) {
    files = files.filter((f) => f.includes(`${path.sep}${ONLY}${path.sep}`) || f.includes(`/${ONLY}/`))
  }
  console.log(`en.json files: ${files.length}`)

  const unique = new Set()
  for (const f of files) {
    const en = JSON.parse(fs.readFileSync(f, 'utf8'))
    const zhPath = path.join(path.dirname(f), 'zh-CN.json')
    let zh = {}
    if (fs.existsSync(zhPath)) {
      try {
        zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'))
      } catch {
        zh = {}
      }
    }
    for (const [k, v] of Object.entries(en)) {
      if (shouldSkipValue(v)) continue
      if (!FORCE && typeof zh[k] === 'string' && zh[k] !== v && zh[k].trim() !== '') continue
      unique.add(v)
    }
  }
  const list = [...unique]
  console.log(`unique strings to translate: ${list.length}`)

  const cacheCN = await fillCache(list, 'zh-CN')

  let sumCN = { translated: 0, kept: 0, keys: 0 }
  let sumTW = { converted: 0, kept: 0, keys: 0 }
  for (const f of files) {
    const a = applyLocale(f, 'zh-CN', cacheCN)
    sumCN.translated += a.translated
    sumCN.kept += a.kept
    sumCN.keys += a.keys

    const dir = path.dirname(f)
    const en = JSON.parse(fs.readFileSync(f, 'utf8'))
    const zhCN = JSON.parse(fs.readFileSync(path.join(dir, 'zh-CN.json'), 'utf8'))
    const twPath = path.join(dir, 'zh-TW.json')
    let existingTw = {}
    if (fs.existsSync(twPath)) {
      try {
        existingTw = JSON.parse(fs.readFileSync(twPath, 'utf8'))
      } catch {
        existingTw = {}
      }
    }
    const twOut = {}
    let converted = 0
    let keptTw = 0
    for (const [k, v] of Object.entries(en)) {
      if (typeof v !== 'string') {
        twOut[k] = existingTw[k] ?? v
        continue
      }
      const prev = existingTw[k]
      if (!FORCE && typeof prev === 'string' && prev !== v && prev.trim() !== '') {
        twOut[k] = prev
        keptTw++
        continue
      }
      const cnVal = zhCN[k]
      twOut[k] = typeof cnVal === 'string' ? cnToTw(cnVal) : (prev ?? v)
      converted++
    }
    fs.writeFileSync(twPath, JSON.stringify(twOut, null, 2) + '\n')
    sumTW.converted += converted
    sumTW.kept += keptTw
    sumTW.keys += Object.keys(en).length

    const mod = path.relative(MODULES, path.dirname(dir))
    console.log(`wrote ${mod}: CN +${a.translated} keep ${a.kept}; TW convert ${converted} keep ${keptTw}`)
  }
  console.log('DONE', { sumCN, sumTW })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
