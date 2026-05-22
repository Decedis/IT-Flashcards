import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: process.env['DATABASE_URL'] ?? 'file:./prisma/dev.db' })
const app = new Hono()
const prisma = new PrismaClient({ adapter })

app.use('/api/*', cors())

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
  const body = await c.req.json<{ correct?: number; wrong?: number; streak?: number }>()
  const existing = await prisma.userStats.findFirst()
  if (existing) {
    const updated = await prisma.userStats.update({
      where: { id: existing.id },
      data: body,
    })
    return c.json({ ...updated, activity: JSON.parse(updated.activity) })
  }
  const created = await prisma.userStats.create({
    data: { streak: body.streak ?? 0, correct: body.correct ?? 0, wrong: body.wrong ?? 0, activity: '[]' },
  })
  return c.json({ ...created, activity: [] })
})

serve({ fetch: app.fetch, port: 3001 }, () =>
  console.log('API server running on http://localhost:3001')
)
