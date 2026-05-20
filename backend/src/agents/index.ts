import { AgentRegistry } from './base/agent.registry'
import { SourcingAgent } from './sourcing/sourcing.agent'
import { AnalyticsAgent } from './analytics/analytics.agent'
import { MatchingAgent } from './matching/matching.agent'
import { ScreeningAgent } from './screening/screening.agent'
import { OutreachAgent } from './outreach/outreach.agent'
import { ReportingAgent } from './reporting/reporting.agent'
import { GeminiProvider } from './shared/llm/gemini.provider'
import { ContextStore } from './shared/memory/context.store'
import { Orchestrator } from './orchestrator/orchestrator'
import { AgentRouter } from './orchestrator/router'
import { ResultAggregator } from './orchestrator/aggregator'

export interface AgentSystem {
  registry: AgentRegistry
  orchestrator: Orchestrator
}

export async function initializeAgents(): Promise<AgentSystem> {
  const llm = new GeminiProvider()
  const memory = new ContextStore()

  const registry = new AgentRegistry()
  registry.register(new SourcingAgent(llm, memory))
  registry.register(new AnalyticsAgent(llm, memory))
  registry.register(new MatchingAgent(llm, memory))
  registry.register(new ScreeningAgent(llm, memory))
  registry.register(new OutreachAgent(llm, memory))
  registry.register(new ReportingAgent(llm, memory))

  const router = new AgentRouter(registry)
  const aggregator = new ResultAggregator()
  const orchestrator = new Orchestrator(registry, router, aggregator)

  await Promise.all(
    registry.getAll().map(agent => agent.initialize())
  )

  return { registry, orchestrator }
}
export * from './base/agent.interface'
export * from './base/agent.types'
export * from './base/agent.registry'
export * from './orchestrator/orchestrator'
