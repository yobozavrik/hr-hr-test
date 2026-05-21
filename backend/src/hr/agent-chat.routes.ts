import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { agentChatRequestSchema, matchAnalysisRequestSchema } from '@hr-recruiter/contracts'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'
import type { AppEnv } from '../env'
import type { DbClient } from '../db'
import { AGENT_CONFIGS, callFreeLLMAPI, type ChatMessage } from './agent-chat.service'

export function createAgentChatRoutes(db: DbClient) {
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  // Get all agent configs
  app.get('/configs', async (c) => {
    const configs = Object.values(AGENT_CONFIGS).map(({ systemPrompt, ...rest }) => rest)
    return c.json(configs)
  })

  // Chat with a specific agent
  app.post('/chat', zValidator('json', agentChatRequestSchema), async (c) => {
    const user = c.get('user')
    const { agentId, messages, vacancyId, resumeId } = c.req.valid('json')

    const agent = AGENT_CONFIGS[agentId]
    if (!agent) {
      return c.json({ error: `Unknown agent: ${agentId}` }, 404)
    }

    // Add system prompt as first message
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: agent.systemPrompt },
      ...messages,
    ]

    // Add context about vacancy/resume if provided
    let contextNote = ''
    if (vacancyId) {
      try {
        const vacancy = await db.vacancy.findUnique({
          where: { id: vacancyId, userId: user.id },
        })
        if (vacancy) {
          contextNote += `\n\nКонтекст вакансії: "${vacancy.title}" в ${vacancy.company || 'компанії'}. Локація: ${vacancy.location || 'не вказано'}. ЗП: ${vacancy.salaryFrom || '?'}-${vacancy.salaryTo || '?'} ${vacancy.currency || 'UAH'}. Опис: ${vacancy.description || 'немає'}.`
        }
      } catch (e) {
        console.error('Failed to fetch vacancy context:', e)
      }
    }

    if (resumeId) {
      try {
        const resume = await db.resume.findUnique({
          where: { id: resumeId, userId: user.id },
        })
        if (resume) {
          contextNote += `\n\nКонтекст резюме: ${resume.fullName}, позиція: ${resume.position || 'не вказано'}. Навички: ${(resume.skills || []).join(', ') || 'немає'}. Досвід: ${resume.experience || 'не вказано'}. Освіта: ${resume.education || 'не вказано'}. ЗП очікування: ${resume.salary || 'не вказано'}.`
        }
      } catch (e) {
        console.error('Failed to fetch resume context:', e)
      }
    }

    if (contextNote) {
      fullMessages[fullMessages.length - 1] = {
        ...fullMessages[fullMessages.length - 1],
        content: fullMessages[fullMessages.length - 1].content + contextNote,
      }
    }

    try {
      const env = c.env as AppEnv
      const result = await callFreeLLMAPI(env, fullMessages)

      return c.json({
        agentId,
        agentName: agent.name,
        content: result.content,
        provider: result.provider,
      })
    } catch (error) {
      console.error('Agent chat error:', error)
      const message = error instanceof Error ? error.message : 'Failed to get response from LLM'
      return c.json({
        error: 'LLM_ERROR',
        message,
      }, 502)
    }
  })

  // Analyze match between vacancy and resume
  app.post('/analyze-match', zValidator('json', matchAnalysisRequestSchema), async (c) => {
    const user = c.get('user')
    const { vacancy, resume } = c.req.valid('json')

    const systemPrompt = `Ти експерт з рекрутингу з 15+ роками досвіду. Проаналізуй відповідність резюме вимогам вакансії.

Оціни наступні категорії (0-100 кожна):
1. Skills match — відповідність технічних навичок
2. Experience match — відповідність досвіду роботи
3. Salary match — відповідність ЗП очікувань бюджету
4. Location match — відповідність локації

Дай загальний Match Score (0-100%) та детальну аргументацію.

Відповідай СТРОГО у форматі JSON:
{
  "score": 87,
  "skillsScore": 90,
  "experienceScore": 85,
  "salaryScore": 80,
  "locationScore": 95,
  "strengths": ["список сильних сторін"],
  "gaps": ["список прогалин"],
  "recommendation": "Рекомендовано до інтерв'ю" або "Не рекомендовано",
  "interviewQuestions": ["3-5 питань для перевірки прогалин"]
}`

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Вакансія:
Назва: ${vacancy.title}
Компанія: ${vacancy.company || 'не вказано'}
Локація: ${vacancy.location || 'не вказано'}
ЗП: ${vacancy.salaryFrom || '?'}-${vacancy.salaryTo || '?'}
Опис: ${vacancy.description || 'немає'}
Вимоги: ${(vacancy.requirements || []).join(', ') || 'не вказано'}

Резюме:
Ім'я: ${resume.fullName}
Позиція: ${resume.position || 'не вказано'}
Навички: ${(resume.skills || []).join(', ') || 'немає'}
Досвід: ${resume.experience || 'не вказано'}
Освіта: ${resume.education || 'не вказано'}
ЗП очікування: ${resume.salary || 'не вказано'}

Проаналізуй відповідність та поверни JSON.`,
      },
    ]

    try {
      const env = c.env as AppEnv
      const result = await callFreeLLMAPI(env, messages)

      // Try to parse JSON from response
      let parsedResult: Record<string, unknown>
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0])
        } else {
          parsedResult = { score: 50, recommendation: result.content }
        }
      } catch {
        parsedResult = { score: 50, recommendation: result.content }
      }

      return c.json({
        ...parsedResult,
        rawContent: result.content,
        provider: result.provider,
      })
    } catch (error) {
      console.error('Match analysis error:', error)
      const message = error instanceof Error ? error.message : 'Failed to analyze match'
      return c.json({
        error: 'LLM_ERROR',
        message,
      }, 502)
    }
  })

  return app
}
