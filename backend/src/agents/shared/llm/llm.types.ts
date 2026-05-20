export interface LLMOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMResponse {
  text: string
  tokensUsed?: number
}
