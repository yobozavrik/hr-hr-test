export interface AgentContext {
  userId: string
  sessionId: string
  priority: 'low' | 'medium' | 'high'
  timeout?: number
}

export interface AgentInput {
  type: string
  payload: Record<string, any>
  context: AgentContext
}

export interface AgentOutput<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata: {
    agent: string
    duration: number
    tokensUsed?: number
    confidence?: number
  }
}

export type AgentStatus = 'idle' | 'busy' | 'error'

export interface IAgent {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly capabilities: string[]
  readonly status: AgentStatus
  initialize(): Promise<void>
  execute(input: AgentInput): Promise<AgentOutput>
  cancel(sessionId: string): Promise<void>
  getStatus(): AgentStatus
}
