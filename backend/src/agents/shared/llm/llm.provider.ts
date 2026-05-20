import type { LLMOptions, LLMResponse } from './llm.types'

export abstract class LLMProvider {
  abstract generate(prompt: string, options?: LLMOptions): Promise<LLMResponse>
}
