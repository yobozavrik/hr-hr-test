import type { AgentOutput } from '../base/agent.interface'

export interface AggregatedResult {
  success: boolean
  results: Record<string, any>
  metadata: {
    duration: number
    agentsExecuted: string[]
  }
}

export class ResultAggregator {
  combine(outputs: AgentOutput[]): AggregatedResult {
    const results: Record<string, any> = {}
    const agentsExecuted: string[] = []
    let totalDuration = 0
    let success = true

    for (const output of outputs) {
      if (output.success) {
        results[output.metadata.agent] = output.data
      } else {
        results[output.metadata.agent] = { error: output.error }
        success = false
      }
      agentsExecuted.push(output.metadata.agent)
      totalDuration += output.metadata.duration
    }

    return {
      success,
      results,
      metadata: {
        duration: totalDuration,
        agentsExecuted
      }
    }
  }
}
