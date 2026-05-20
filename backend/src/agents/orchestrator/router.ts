import type { AgentRegistry } from '../base/agent.registry'
import type { IAgent } from '../base/agent.interface'

export interface ClassifiedIntent {
  type: string
  payload: Record<string, any>
  targetAgents: string[]
}

export class AgentRouter {
  private registry: AgentRegistry

  constructor(registry: AgentRegistry) {
    this.registry = registry
  }

  async classify(request: { query: string; actionType?: string }): Promise<ClassifiedIntent> {
    const query = request.query.toLowerCase()
    const targetAgents: string[] = []

    if (query.includes('find') || query.includes('source') || query.includes('search') || query.includes('cv') || query.includes('resume')) {
      targetAgents.push('sourcing')
    }
    if (query.includes('match') || query.includes('score') || query.includes('compare')) {
      targetAgents.push('matching')
    }
    if (query.includes('salary') || query.includes('bench') || query.includes('market') || query.includes('trend')) {
      targetAgents.push('analytics')
    }
    if (query.includes('screen') || query.includes('interview') || query.includes('test')) {
      targetAgents.push('screening')
    }
    if (query.includes('email') || query.includes('send') || query.includes('contact') || query.includes('mail') || query.includes('write')) {
      targetAgents.push('outreach')
    }
    if (query.includes('report') || query.includes('kpi') || query.includes('weekly') || query.includes('pipeline')) {
      targetAgents.push('reporting')
    }

    if (targetAgents.length === 0) {
      targetAgents.push('sourcing', 'matching')
    }

    return {
      type: request.actionType || 'orchestrated_task',
      payload: { query: request.query },
      targetAgents
    }
  }

  resolve(intent: ClassifiedIntent): IAgent[] {
    return intent.targetAgents
      .map(id => this.registry.get(id))
      .filter((agent): agent is IAgent => !!agent)
  }
}
