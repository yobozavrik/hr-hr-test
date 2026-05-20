import type { AgentRegistry } from '../base/agent.registry'
import { AgentRouter } from './router'
import { ResultAggregator, type AggregatedResult } from './aggregator'

export class Orchestrator {
  private registry: AgentRegistry
  private router: AgentRouter
  private aggregator: ResultAggregator

  constructor(registry: AgentRegistry, router: AgentRouter, aggregator: ResultAggregator) {
    this.registry = registry
    this.router = router
    this.aggregator = aggregator
  }

  async dispatch(request: { query: string; actionType?: string; context: any }): Promise<AggregatedResult> {
    const intent = await this.router.classify(request)
    const targetAgents = this.router.resolve(intent)

    const outputs = await Promise.all(
      targetAgents.map(agent => agent.execute({
        type: intent.type,
        payload: intent.payload,
        context: {
          userId: request.context?.userId || 'system',
          sessionId: request.context?.sessionId || 'session',
          priority: request.context?.priority || 'medium'
        }
      }))
    )

    return this.aggregator.combine(outputs)
  }
}
