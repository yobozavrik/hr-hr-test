import type { IAgent, AgentContext, AgentInput, AgentOutput, AgentStatus } from './agent.interface'
import type { LLMProvider } from '../shared/llm/llm.provider'
import type { ContextStore } from '../shared/memory/context.store'

export abstract class AbstractAgent implements IAgent {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly description: string
  abstract readonly capabilities: string[]
  
  status: AgentStatus = 'idle'
  protected llm: LLMProvider
  protected memory: ContextStore

  constructor(llm: LLMProvider, memory: ContextStore) {
    this.llm = llm
    this.memory = memory
  }

  async initialize(): Promise<void> {
    await this.onInitialize()
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    this.status = 'busy'
    const start = Date.now()
    try {
      const result = await this.onExecute(input)
      this.status = 'idle'
      return {
        success: true,
        data: result,
        metadata: {
          agent: this.name,
          duration: Date.now() - start,
        }
      }
    } catch (error: any) {
      this.status = 'error'
      return {
        success: false,
        error: error.message || String(error),
        metadata: {
          agent: this.name,
          duration: Date.now() - start,
        }
      }
    }
  }

  async cancel(sessionId: string): Promise<void> {
    // Standard implementation can clear context
    this.memory.clear(sessionId)
    this.status = 'idle'
  }

  getStatus(): AgentStatus {
    return this.status
  }

  protected abstract onInitialize(): Promise<void>
  protected abstract onExecute(input: AgentInput): Promise<any>
}
