export interface HistoryEvent {
  agentId: string
  action: string
  timestamp: Date
  details?: any
}

export class HistoryStore {
  private history: Map<string, HistoryEvent[]> = new Map()

  append(sessionId: string, event: HistoryEvent): void {
    if (!this.history.has(sessionId)) {
      this.history.set(sessionId, [])
    }
    this.history.get(sessionId)!.push(event)
  }

  get(sessionId: string): HistoryEvent[] {
    return this.history.get(sessionId) || []
  }

  clear(sessionId: string): void {
    this.history.delete(sessionId)
  }
}
