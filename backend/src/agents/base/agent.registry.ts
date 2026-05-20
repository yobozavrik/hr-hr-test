import type { IAgent } from './agent.interface'
import type { AgentStatusReport } from './agent.types'

export class AgentRegistry {
  private agents: Map<string, IAgent> = new Map()

  register(agent: IAgent): void {
    this.agents.set(agent.id, agent)
  }

  get(id: string): IAgent | undefined {
    return this.agents.get(id)
  }

  getAll(): IAgent[] {
    return Array.from(this.agents.values())
  }

  getByCapability(capability: string): IAgent[] {
    return this.getAll().filter(agent =>
      agent.capabilities.includes(capability)
    )
  }

  getStatusReport(): AgentStatusReport[] {
    return this.getAll().map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      capabilities: agent.capabilities
    }))
  }
}
