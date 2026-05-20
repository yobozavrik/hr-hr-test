export interface AgentConfig {
  id: string
  name: string
  enabled: boolean
  maxConcurrentTasks: number
  timeout: number
  retryAttempts: number
  llmModel: string
  temperature: number
  maxTokens: number
}

export const agentConfigs: Record<string, AgentConfig> = {
  sourcing: {
    id: 'sourcing',
    name: 'Марта',
    enabled: true,
    maxConcurrentTasks: 5,
    timeout: 30000,
    retryAttempts: 2,
    llmModel: 'gemini-1.5-pro',
    temperature: 0.3,
    maxTokens: 2000
  },
  matching: {
    id: 'matching',
    name: 'Артур',
    enabled: true,
    maxConcurrentTasks: 10,
    timeout: 15000,
    retryAttempts: 1,
    llmModel: 'gemini-1.5-flash',
    temperature: 0.1,
    maxTokens: 1000
  },
  analytics: {
    id: 'analytics',
    name: 'Данило',
    enabled: true,
    maxConcurrentTasks: 3,
    timeout: 45000,
    retryAttempts: 1,
    llmModel: 'gemini-1.5-pro',
    temperature: 0.2,
    maxTokens: 4000
  },
  screening: {
    id: 'screening',
    name: 'Скринінг-Агент',
    enabled: true,
    maxConcurrentTasks: 5,
    timeout: 60000,
    retryAttempts: 2,
    llmModel: 'gemini-1.5-pro',
    temperature: 0.4,
    maxTokens: 3000
  },
  outreach: {
    id: 'outreach',
    name: 'Софія',
    enabled: true,
    maxConcurrentTasks: 10,
    timeout: 20000,
    retryAttempts: 3,
    llmModel: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 2000
  },
  reporting: {
    id: 'reporting',
    name: 'Олена',
    enabled: true,
    maxConcurrentTasks: 2,
    timeout: 90000,
    retryAttempts: 1,
    llmModel: 'gemini-1.5-pro',
    temperature: 0.2,
    maxTokens: 5000
  }
}
