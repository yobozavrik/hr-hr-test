import type { DbClient } from './db'
import { initializeAgents, type AgentSystem } from './agents'

export class AgentsService {
  private db: DbClient
  private systemPromise: Promise<AgentSystem>

  constructor(db: DbClient) {
    this.db = db
    this.systemPromise = initializeAgents()
  }

  async getRegistry() {
    const sys = await this.systemPromise
    return sys.registry
  }

  async getOrchestrator() {
    const sys = await this.systemPromise
    return sys.orchestrator
  }

  private getAgentDb(agentId: string) {
    const client = this.db as any
    switch (agentId) {
      case 'sourcing':
      case 'marta': return client.martaTaskLog
      case 'matching':
      case 'artur': return client.arturTaskLog
      case 'outreach':
      case 'sofia': return client.sofiaTaskLog
      case 'analytics':
      case 'danilo': return client.daniloTaskLog
      case 'screening':
      case 'maksym': return client.maksymTaskLog // Fallback match
      case 'reporting':
      case 'olena': return client.olenaTaskLog // Fallback match
      default: return null
    }
  }

  async executeAgentTask(agentId: string, userId: string, payload: Record<string, any>): Promise<any> {
    const registry = await this.getRegistry()
    
    // Support mapped aliases
    let canonicalId = agentId
    if (agentId === 'marta') canonicalId = 'sourcing'
    if (agentId === 'artur') canonicalId = 'matching'
    if (agentId === 'sofia') canonicalId = 'outreach'
    if (agentId === 'danilo') canonicalId = 'analytics'
    if (agentId === 'maksym') canonicalId = 'screening'
    if (agentId === 'olena') canonicalId = 'reporting'

    const agent = registry.get(canonicalId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    // 1. Create DB log entry
    const agentDb = this.getAgentDb(agentId)
    let logRecord: any = null
    const taskTitle = payload.taskTitle || `Task run for ${agent.name}`
    const inputParams = JSON.stringify(payload.data || {})

    if (agentDb) {
      logRecord = await agentDb.create({
        data: {
          userId,
          taskTitle,
          status: 'pending',
          inputParams,
        }
      })
    }

    const start = Date.now()
    try {
      // 2. Execute agent
      const result = await agent.execute({
        type: payload.type || 'direct_run',
        payload: payload.data || {},
        context: {
          userId,
          sessionId: logRecord?.id || 'session',
          priority: payload.priority || 'medium'
        }
      })

      const durationMs = Date.now() - start

      // 3. Update DB log
      if (agentDb && logRecord) {
        await agentDb.updateMany({
          where: { id: logRecord.id, userId },
          data: {
            status: result.success ? 'completed' : 'failed',
            outputResult: JSON.stringify(result.data || result.error || {}),
            durationMs,
          }
        })
      }

      return result
    } catch (err: any) {
      const durationMs = Date.now() - start
      if (agentDb && logRecord) {
        await agentDb.updateMany({
          where: { id: logRecord.id, userId },
          data: {
            status: 'failed',
            outputResult: JSON.stringify({ error: err.message || String(err) }),
            durationMs,
          }
        })
      }
      throw err
    }
  }

  async orchestrate(userId: string, query: string, actionType?: string): Promise<any> {
    const orchestrator = await this.getOrchestrator()
    return orchestrator.dispatch({
      query,
      actionType,
      context: {
        userId,
        sessionId: 'orchestrate-session',
        priority: 'high'
      }
    })
  }
}
