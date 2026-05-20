import { Hono } from 'hono'
import { requireAuth } from './auth/routes'
import type { Variables } from './app'
import type { DbClient } from './db'
import { AgentsService } from './agents.service'

export function createAgentExecRoutes(db: DbClient) {
  const app = new Hono<{ Variables: Variables }>()
  const service = new AgentsService(db)

  app.use('*', requireAuth)

  // Running task for specific agent
  app.post('/agents/:agentId/execute', async (c) => {
    const { agentId } = c.req.param()
    const user = c.get('user')
    const body = await c.req.json()

    try {
      const result = await service.executeAgentTask(agentId, user.id, {
        type: body.type,
        data: body.data || {},
        priority: body.priority || 'medium',
        taskTitle: body.taskTitle
      })
      return c.json(result)
    } catch (error: any) {
      return c.json({ error: error.message || String(error) }, 500)
    }
  })

  // Get status of all agents
  app.get('/agents/status', async (c) => {
    try {
      const registry = await service.getRegistry()
      return c.json(registry.getStatusReport())
    } catch (error: any) {
      return c.json({ error: error.message || String(error) }, 500)
    }
  })

  // Multi-agent orchestration
  app.post('/agents/orchestrate', async (c) => {
    const user = c.get('user')
    const body = await c.req.json()

    try {
      const result = await service.orchestrate(user.id, body.query, body.actionType)
      return c.json(result)
    } catch (error: any) {
      return c.json({ error: error.message || String(error) }, 500)
    }
  })

  return app
}
