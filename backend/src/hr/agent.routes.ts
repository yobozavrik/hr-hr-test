import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'
import type { DbClient } from '../db'
import type {
  MartaTaskLog,
  ArturTaskLog,
  SofiaTaskLog,
  DaniloTaskLog,
  MaksymTaskLog,
  OlenaTaskLog,
} from '../generated/prisma/client'

type AgentTaskLog =
  | (MartaTaskLog & { agentId: string })
  | (ArturTaskLog & { agentId: string })
  | (SofiaTaskLog & { agentId: string })
  | (DaniloTaskLog & { agentId: string })
  | (MaksymTaskLog & { agentId: string })
  | (OlenaTaskLog & { agentId: string })

interface AgentStatRow {
  agentId: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
  avgDurationMs: number
}

const createTaskSchema = z.object({
  agentId: z.string(),
  taskTitle: z.string(),
  inputParams: z.string().optional(),
})

const updateTaskSchema = z.object({
  status: z.string(),
  outputResult: z.string().optional(),
  durationMs: z.number().optional(),
})

export function createAgentRoutes(db: DbClient) {
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  // Ensure view helper
  const ensureMaterializedView = async () => {
    try {
      await db.$executeRawUnsafe(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS agent_efficiency_stats AS
        SELECT 
          'marta'::text AS agent_id,
          user_id,
          COUNT(*)::integer AS total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer AS completed_tasks,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer AS failed_tasks,
          COALESCE(AVG(duration_ms), 0)::double precision AS avg_duration_ms
        FROM marta_task_logs
        GROUP BY user_id
        UNION ALL
        SELECT 
          'artur'::text AS agent_id,
          user_id,
          COUNT(*)::integer AS total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer AS completed_tasks,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer AS failed_tasks,
          COALESCE(AVG(duration_ms), 0)::double precision AS avg_duration_ms
        FROM artur_task_logs
        GROUP BY user_id
        UNION ALL
        SELECT 
          'sofia'::text AS agent_id,
          user_id,
          COUNT(*)::integer AS total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer AS completed_tasks,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer AS failed_tasks,
          COALESCE(AVG(duration_ms), 0)::double precision AS avg_duration_ms
        FROM sofia_task_logs
        GROUP BY user_id
        UNION ALL
        SELECT 
          'danilo'::text AS agent_id,
          user_id,
          COUNT(*)::integer AS total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer AS completed_tasks,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer AS failed_tasks,
          COALESCE(AVG(duration_ms), 0)::double precision AS avg_duration_ms
        FROM danilo_task_logs
        GROUP BY user_id
        UNION ALL
        SELECT 
          'maksym'::text AS agent_id,
          user_id,
          COUNT(*)::integer AS total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer AS completed_tasks,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer AS failed_tasks,
          COALESCE(AVG(duration_ms), 0)::double precision AS avg_duration_ms
        FROM maksym_task_logs
        GROUP BY user_id
        UNION ALL
        SELECT 
          'olena'::text AS agent_id,
          user_id,
          COUNT(*)::integer AS total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer AS completed_tasks,
          COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer AS failed_tasks,
          COALESCE(AVG(duration_ms), 0)::double precision AS avg_duration_ms
        FROM olena_task_logs
        GROUP BY user_id;
      `)
      
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS agent_efficiency_stats_agent_user_idx 
        ON agent_efficiency_stats (agent_id, user_id);
      `)
    } catch (e) {
      console.error('Error ensuring materialized view:', e)
    }
  }

  const refreshMaterializedView = async () => {
    try {
      await db.$executeRawUnsafe('REFRESH MATERIALIZED VIEW agent_efficiency_stats;')
    } catch (e) {
      console.error('Error refreshing materialized view:', e)
    }
  }

  const getAgentDb = (agentId: string) => {
    switch (agentId) {
      case 'marta': return db.martaTaskLog
      case 'artur': return db.arturTaskLog
      case 'sofia': return db.sofiaTaskLog
      case 'danilo': return db.daniloTaskLog
      case 'maksym': return db.maksymTaskLog
      case 'olena': return db.olenaTaskLog
      default: return null
    }
  }

  // Get stats for all agents
  app.get('/stats', async (c) => {
    const user = c.get('user')
    await ensureMaterializedView()
    await refreshMaterializedView()

    try {
      const stats: AgentStatRow[] = await db.$queryRawUnsafe(
        `SELECT agent_id as "agentId", total_tasks as "totalTasks", completed_tasks as "completedTasks", failed_tasks as "failedTasks", avg_duration_ms as "avgDurationMs" FROM agent_efficiency_stats WHERE user_id = $1::uuid;`,
        user.id
      )
      return c.json(stats)
    } catch (e) {
      console.error('Error querying agent stats:', e)
      return c.json([])
    }
  })

  // List recent tasks across all agents
  app.get('/tasks', async (c) => {
    const user = c.get('user')
    const agentId = c.req.query('agentId')
    
    const agents = agentId ? [agentId] : ['marta', 'artur', 'sofia', 'danilo', 'maksym', 'olena']
    const allTasks: AgentTaskLog[] = []

    for (const id of agents) {
      const agentDb = getAgentDb(id)
      if (agentDb) {
        const tasks = await (agentDb as any).findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
        allTasks.push(...tasks.map((t: AgentTaskLog) => ({ ...t, agentId: id })))
      }
    }

    // Sort by createdAt desc
    allTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return c.json(allTasks)
  })

  // Create an agent task log entry
  app.post('/tasks', async (c) => {
    const user = c.get('user')
    const body = await c.req.json()
    const { agentId, taskTitle, inputParams } = body

    const agentDb = getAgentDb(agentId)
    if (!agentDb) {
      return c.json({ error: `Unknown agent: ${agentId}` }, 400)
    }

    const task = await (agentDb as any).create({
      data: {
        userId: user.id,
        taskTitle,
        status: 'pending',
        inputParams: inputParams || '',
      }
    })

    return c.json({ ...task, agentId }, 201)
  })

  // Update an agent task log entry
  app.patch('/tasks/:agentId/:taskId', async (c) => {
    const user = c.get('user')
    const agentId = c.req.param('agentId')
    const taskId = c.req.param('taskId')
    const body = await c.req.json()
    const { status, outputResult, durationMs } = body

    const agentDb = getAgentDb(agentId)
    if (!agentDb) {
      return c.json({ error: `Unknown agent: ${agentId}` }, 400)
    }

    const task = await (agentDb as any).updateMany({
      where: { id: taskId, userId: user.id },
      data: {
        status,
        outputResult,
        durationMs,
      }
    })

    if (task.count === 0) {
      return c.json({ error: 'Task not found' }, 404)
    }

    // Trigger background refresh of the materialized view
    c.executionCtx?.waitUntil(refreshMaterializedView())

    return c.json({ success: true })
  })

  return app
}
