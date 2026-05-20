import { LLMProvider } from './llm.provider'
import type { LLMOptions, LLMResponse } from './llm.types'

export class GeminiProvider extends LLMProvider {
  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return {
      text: `[Gemini mock response to prompt: "${prompt.substring(0, 60)}..."]`,
      tokensUsed: 195
    }
  }
}
