export interface AIAnalysisResult {
  score: number
  summary: string
  pros: string[]
  cons: string[]
  verdict: 'strong_match' | 'potential_match' | 'no_match'
  recommendations: string[]
}

export class AIService {
  private openaiApiKey = process.env.OPENAI_API_KEY || null
  private geminiApiKey = process.env.GEMINI_API_KEY || null
  private groqApiKey = process.env.GROQ_API_KEY || null

  async analyzeMatch(params: {
    vacancyTitle: string
    vacancyDescription: string
    candidateName: string
    candidatePosition: string
    candidateSkills: string[]
    candidateExperience?: string
    candidateEducation?: string
  }): Promise<AIAnalysisResult> {
    const prompt = this.buildPrompt(params)

    // Try OpenAI if key is present
    if (this.openaiApiKey) {
      try {
        return await this.callOpenAI(prompt)
      } catch (e) {
        console.error('OpenAI match analysis failed, trying fallbacks:', e)
      }
    }

    // Try Gemini if key is present
    if (this.geminiApiKey) {
      try {
        return await this.callGemini(prompt)
      } catch (e) {
        console.error('Gemini match analysis failed, trying fallbacks:', e)
      }
    }

    // Try Groq if key is present
    if (this.groqApiKey) {
      try {
        return await this.callGroq(prompt)
      } catch (e) {
        console.error('Groq match analysis failed, trying fallbacks:', e)
      }
    }

    // Fallback to rules-based analysis if no API key is available
    return this.fallbackRulesBasedAnalysis(params)
  }

  private buildPrompt(params: any): string {
    return `Проанализируй соответствие кандидата требованиям вакансии.
    
ВАКАНСИЯ:
Название: ${params.vacancyTitle}
Описание: ${params.vacancyDescription}

КАНДИДАТ:
Имя: ${params.candidateName}
Желаемая должность: ${params.candidatePosition}
Ключевые навыки: ${params.candidateSkills.join(', ')}
Опыт работы: ${params.candidateExperience || 'Не указан'}
Образование: ${params.candidateEducation || 'Не указано'}

Верни результат ИСКЛЮЧИТЕЛЬНО в формате JSON со следующими полями:
{
  "score": <число от 0 до 100>,
  "summary": "<краткое резюме соответствия на русском языке, 2-3 предложения>",
  "pros": ["<плюс 1>", "<плюс 2>", ...],
  "cons": ["<минус/риск 1>", "<минус/риск 2>", ...],
  "verdict": "strong_match" | "potential_match" | "no_match",
  "recommendations": ["<рекомендация/вопрос для интервью 1>", "<вопрос 2>", ...]
}
Никакого лишнего текста вне JSON, разметки \`\`\`json или других пояснений. Только чистый JSON.`
  }

  private async callOpenAI(prompt: string): Promise<AIAnalysisResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI HTTP error: ${response.status}`)
    }

    const data = await response.json() as any
    const content = data.choices[0].message.content
    return JSON.parse(content) as AIAnalysisResult
  }

  private async callGemini(prompt: string): Promise<AIAnalysisResult> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini HTTP error: ${response.status}`)
    }

    const data = await response.json() as any
    const content = data.candidates[0].content.parts[0].text
    return JSON.parse(content) as AIAnalysisResult
  }

  private async callGroq(prompt: string): Promise<AIAnalysisResult> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`Groq HTTP error: ${response.status}`)
    }

    const data = await response.json() as any
    const content = data.choices[0].message.content
    return JSON.parse(content) as AIAnalysisResult
  }

  private fallbackRulesBasedAnalysis(params: any): AIAnalysisResult {
    let score = 30 // Base score
    const pros: string[] = []
    const cons: string[] = []
    const recommendations: string[] = []

    const vTitle = params.vacancyTitle.toLowerCase()
    const cTitle = params.candidatePosition.toLowerCase()

    // Title matching
    if (vTitle.includes(cTitle) || cTitle.includes(vTitle)) {
      score += 30
      pros.push('Название желаемой должности кандидата совпадает или близко к вакансии.')
    } else {
      cons.push('Название желаемой должности кандидата отличается от вакансии.')
      recommendations.push('Уточнить у кандидата его гибкость по отношению к названию позиции и кругу обязанностей.')
    }

    // Skills match count
    const skillsCount = params.candidateSkills.length
    let matchedSkills = 0
    const vDesc = params.vacancyDescription.toLowerCase()

    for (const skill of params.candidateSkills) {
      if (vDesc.includes(skill.toLowerCase())) {
        matchedSkills++
      }
    }

    if (skillsCount > 0) {
      const matchPct = (matchedSkills / skillsCount) * 100
      score += Math.round(matchPct * 0.3) // Max 30 points
      
      if (matchedSkills > 0) {
        pros.push(`Кандидат владеет ключевыми технологиями вакансии (${matchedSkills} совпадений).`)
      } else {
        cons.push('Не обнаружено явных совпадений по ключевым техническим навыкам в описании вакансии.')
        recommendations.push('Провести техническое интервью для глубокой проверки стека.')
      }
    } else {
      cons.push('В резюме кандидата не указаны ключевые навыки.')
      recommendations.push('Попросить кандидата составить список ключевых навыков и технологий.')
    }

    // Experience match
    const exp = params.candidateExperience || ''
    if (exp) {
      score += 10
      pros.push('У кандидата заполнен блок с опытом работы.')
      recommendations.push('Детально обсудить последний проект и роль кандидата в команде.')
    } else {
      cons.push('Опыт работы в резюме не описан подробно.')
      recommendations.push('Запросить подробное описание предыдущих мест работы и достижений.')
    }

    const verdict = score >= 75 ? 'strong_match' : score >= 50 ? 'potential_match' : 'no_match'
    
    return {
      score: Math.min(100, score),
      summary: `Анализ на лету (правила): Кандидат имеет совпадение по названию должности и владеет частью ключевых технологий. Оценка совпадения составляет ${score}%.`,
      pros,
      cons,
      verdict,
      recommendations
    }
  }
}
