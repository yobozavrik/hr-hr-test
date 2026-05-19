import { Hono } from 'hono'
import { GoogleService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

const GOOGLE_SCOPES = {
  calendar: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  sheets: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
  gmail: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
}

export function createGoogleRoutes(db: any, env: any) {
  const service = new GoogleService(
    db,
    env.GOOGLE_CLIENT_ID || '',
    env.GOOGLE_CLIENT_SECRET || '',
    env.GOOGLE_REDIRECT_URI || '',
  )

  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/auth-url/:scope', async (c) => {
    const user = c.get('user')
    const scopeKey = c.req.param('scope') as keyof typeof GOOGLE_SCOPES
    const scopes = GOOGLE_SCOPES[scopeKey]

    if (!scopes) {
      return c.json({ error: 'Invalid scope' }, 400)
    }

    if (!env.GOOGLE_CLIENT_ID) {
      return c.json({ error: 'Google OAuth not configured' }, 503)
    }

    const url = service.getAuthUrl(user.id, scopes)
    return c.json({ url })
  })

  app.post('/callback', async (c) => {
    const { code, state } = await c.req.json()

    if (!code || !state) {
      return c.json({ error: 'Missing code or state' }, 400)
    }

    try {
      const tokens = await service.exchangeCode(code)
      await service.saveTokens(state, tokens)
      return c.json({ success: true })
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  app.get('/status', async (c) => {
    const user = c.get('user')
    const tokens = await service.getTokens(user.id)
    return c.json({ connected: !!tokens, scopes: tokens?.scope || null })
  })

  // Calendar endpoints
  app.post('/calendar/events', async (c) => {
    const user = c.get('user')
    const data = await c.req.json()

    try {
      const event = await service.createCalendarEvent(user.id, {
        summary: data.summary,
        description: data.description,
        start: new Date(data.start),
        end: new Date(data.end),
      })
      return c.json(event, 201)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  app.get('/calendar/events', async (c) => {
    const user = c.get('user')
    const { start, end } = c.req.query()

    try {
      const events = await service.listCalendarEvents(
        user.id,
        new Date(start || Date.now()),
        new Date(end || Date.now() + 7 * 24 * 60 * 60 * 1000),
      )
      return c.json(events)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  // Sheets endpoints
  app.post('/sheets', async (c) => {
    const user = c.get('user')
    const { title } = await c.req.json()

    try {
      const sheet = await service.createSpreadsheet(user.id, title)
      return c.json(sheet, 201)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  app.post('/sheets/:id/append', async (c) => {
    const user = c.get('user')
    const spreadsheetId = c.req.param('id')
    const { range, values } = await c.req.json()

    try {
      await service.appendToSheet(user.id, spreadsheetId, range, values)
      return c.json({ success: true })
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  // Gmail endpoints
  app.post('/gmail/send', async (c) => {
    const user = c.get('user')
    const { to, subject, body } = await c.req.json()

    try {
      const message = await service.sendEmail(user.id, to, subject, body)
      return c.json(message, 201)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  app.get('/gmail/messages', async (c) => {
    const user = c.get('user')
    const { q } = c.req.query()

    try {
      const messages = await service.listEmails(user.id, q)
      return c.json(messages)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  return { app, service }
}
