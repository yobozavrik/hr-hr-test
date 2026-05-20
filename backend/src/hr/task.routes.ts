import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createTaskRequestSchema, updateTaskRequestSchema } from '@hr-recruiter/contracts'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

import type { DbClient } from '../db'

export function createTaskRoutes(db: DbClient) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/', async (c) => {
    const user = c.get('user')
    const tasks = await service.getTasks(user.id)
    return c.json(tasks)
  })

  app.get('/upcoming', async (c) => {
    const user = c.get('user')
    const tasks = await service.getUpcomingTasks(user.id)
    return c.json(tasks)
  })

  app.post('/', zValidator('json', createTaskRequestSchema), async (c) => {
    const user = c.get('user')
    const data = c.req.valid('json')
    const task = await service.createTask(user.id, data)
    return c.json(task, 201)
  })

  app.patch('/:id', zValidator('json', updateTaskRequestSchema), async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const result = await service.updateTask(user.id, id, data)

    if (result.count === 0) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ success: true })
  })

  app.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const result = await service.deleteTask(user.id, id)

    if (result.count === 0) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ success: true })
  })

  return app
}
