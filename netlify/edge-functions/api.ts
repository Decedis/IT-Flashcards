// @ts-nocheck
// Netlify Edge Function — V8/Deno runtime (not Node.js)
// Env vars are injected by Netlify; accessed via Deno.env.get()
// TypeScript is validated by Netlify's own toolchain, not tsc -b

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import { handle } from 'hono/netlify'
import { PrismaClient } from '@prisma/client/edge'
import { PrismaLibSql } from '@prisma/adapter-libsql/web'
import bcrypt from 'bcryptjs'

const DATABASE_URL    = Deno.env.get('DATABASE_URL')    ?? ''
const TURSO_AUTH_TOKEN = Deno.env.get('TURSO_AUTH_TOKEN') ?? ''
const JWT_SECRET      = Deno.env.get('JWT_SECRET')      ?? 'dev-secret'

const adapter = new PrismaLibSql({ url: DATABASE_URL, authToken: TURSO_AUTH_TOKEN })
const prisma  = new PrismaClient({ adapter })

const app = new Hono()
app.use('/api/*', cors())

// ── Auth routes (no JWT required) ─────────────────────────────────────────

app.post('/api/auth/register', async (c) => {
  const { username, password } = await c.req.json()
  if (!username?.trim() || !password || password.length < 6)
    return c.json({ error: 'Username required and password must be ≥6 characters.' }, 400)

  const exists = await prisma.user.findUnique({ where: { username: username.trim() } })
  if (exists) return c.json({ error: 'Username already taken.' }, 409)

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { username: username.trim(), password: hash } })
  const token = await sign({ sub: user.id, username: user.username }, JWT_SECRET)
  return c.json({ token, user: { id: user.id, username: user.username } })
})

app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = await prisma.user.findUnique({ where: { username: username?.trim() ?? '' } })
  if (!user || !(await bcrypt.compare(password, user.password)))
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
