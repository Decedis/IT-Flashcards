import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from '../netlify/functions/api'

serve({ fetch: app.fetch, port: 3001 }, () => {
  console.log('API server: http://localhost:3001')
})
