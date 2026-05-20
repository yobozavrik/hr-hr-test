export class ContextStore {
  private sessions: Map<string, Map<string, any>> = new Map()

  get(sessionId: string, key: string): any {
    return this.sessions.get(sessionId)?.get(key)
  }

  set(sessionId: string, key: string, value: any): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Map())
    }
    this.sessions.get(sessionId)!.set(key, value)
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
}
