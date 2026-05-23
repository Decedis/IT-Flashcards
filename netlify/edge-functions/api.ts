// @ts-nocheck
// Netlify Edge Function — V8/Deno runtime (not Node.js)
// Env vars injected by Netlify; accessed via Deno.env.get()
// Uses Web Crypto (crypto.subtle) for password hashing — no Node.js deps

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import { handle } from 'hono/netlify'
import { PrismaClient } from '@prisma/client/edge'
import { PrismaLibSql } from '@prisma/adapter-libsql/web'

const DATABASE_URL     = Deno.env.get('DATABASE_URL')     ?? ''
const TURSO_AUTH_TOKEN = Deno.env.get('TURSO_AUTH_TOKEN') ?? ''
const JWT_SECRET       = Deno.env.get('JWT_SECRET')       ?? 'dev-secret'

const adapter = new PrismaLibSql({ url: DATABASE_URL, authToken: TURSO_AUTH_TOKEN })
const prisma  = new PrismaClient({ adapter })

// ── PBKDF2 password helpers (Web Crypto — works in every runtime) ──────────
// Format: base64(16-byte salt || 32-byte PBKDF2-SHA256 hash)

const PBKDF2_PARAMS = { name: 'PBKDF2', iterations: 100_000, hash: 'SHA-256' }

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = new Uint8Array(await crypto.subtle.deriveBits({ ...PBKDF2_PARAMS, salt }, key, 256))
  const out  = new Uint8Array(48); out.set(salt); out.set(hash, 16)
  return btoa(String.fromCharCode(...out))
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const buf  = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
  const salt = buf.slice(0, 16)
  const ref  = buf.slice(16)
  const key  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = new Uint8Array(await crypto.subtle.deriveBits({ ...PBKDF2_PARAMS, salt }, key, 256))
  let diff = 0
  for (let i = 0; i < 32; i++) diff |= hash[i] ^ ref[i]
  return diff === 0
}

// ── App ────────────────────────────────────────────────────────────────────

const app = new Hono()
app.use('/api/*', cors())

// ── Auth routes (no JWT required) ─────────────────────────────────────────

app.post('/api/auth/register', async (c) => {
  const { username, password } = await c.req.json()
  if (!username?.trim() || !password || password.length < 6)
    return c.json({ error: 'Username required and password must be ≥6 characters.' }, 400)

  const exists = await prisma.user.findUnique({ where: { username: username.trim() } })
  if (exists) return c.json({ error: 'Username already taken.' }, 409)

  const hash = await hashPassword(password)
  const user = await prisma.user.create({ data: { username: username.trim(), password: hash } })
  const token = await sign({ sub: user.id, username: user.username }, JWT_SECRET)
  return c.json({ token, user: { id: user.id, username: user.username } })
})

app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = await prisma.user.findUnique({ where: { username: username?.trim() ?? '' } })
  if (!user || !(await verifyPassword(password, user.password)))
    return c.json({ error: 'Invalid username or password.' }, 401)

  const token = await sign({ sub: user.id, username: user.username }, JWT_SECRET)
  return c.json({ token, user: { id: user.id, username: user.username } })
})

// ── JWT middleware — protects all routes below ─────────────────────────────

app.use('/api/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

// ── Protected routes ───────────────────────────────────────────────────────

app.get('/api/auth/me', (c) => {
  const payload = c.get('jwtPayload')
  return c.json({ id: payload.sub, username: payload.username })
})

app.get('/api/modules', async (c) => {
  const modules = await prisma.module.findMany()
  return c.json(modules)
})

app.get('/api/terms', async (c) => {
  const terms = await prisma.term.findMany()
  return c.json(terms.map((t) => ({ ...t, related: JSON.parse(t.related) })))
})

app.get('/api/terms/:id', async (c) => {
  const term = await prisma.term.findUnique({ where: { id: c.req.param('id') } })
  if (!term) return c.json({ error: 'Not found' }, 404)
  return c.json({ ...term, related: JSON.parse(term.related) })
})

app.get('/api/stats', async (c) => {
  const stats = await prisma.userStats.findFirst()
  if (!stats) return c.json({ id: 0, streak: 0, correct: 0, wrong: 0, activity: [] })
  return c.json({ ...stats, activity: JSON.parse(stats.activity) })
})

app.patch('/api/stats', async (c) => {
  const body = await c.req.json()
  const existing = await prisma.userStats.findFirst()
  if (existing) {
    const updated = await prisma.userStats.update({ where: { id: existing.id }, data: body })
    return c.json({ ...updated, activity: JSON.parse(updated.activity) })
  }
  const created = await prisma.userStats.create({
    data: { streak: body.streak ?? 0, correct: body.correct ?? 0, wrong: body.wrong ?? 0, activity: '[]' },
  })
  return c.json({ ...created, activity: [] })
})

export default handle(app)
