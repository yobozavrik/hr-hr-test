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
    return `Проаналізуй відповідність кандидата вимогам вакансії.
    
ВАКАНСІЯ:
Назва: ${params.vacancyTitle}
Опис: ${params.vacancyDescription}

КАНДИДАТ:
Ім'я: ${params.candidateName}
Бажана посада: ${params.candidatePosition}
Ключові навички: ${params.candidateSkills.join(', ')}
Досвід роботи: ${params.candidateExperience || 'Не вказано'}
Освіта: ${params.candidateEducation || 'Не вказано'}

Поверни результат ВИКЛЮЧНО в форматі JSON з наступними полями:
{
  "score": <число від 0 до 100>,
  "summary": "<коротке резюме відповідності українською мовою, 2-3 речення>",
  "pros": ["<перевага 1>", "<перевага 2>", ...],
  "cons": ["<недолік/ризик 1>", "<недолік/ризик 2>", ...],
  "verdict": "strong_match" | "potential_match" | "no_match",
  "recommendations": ["<рекомендація/питання для інтерв'ю 1>", "<питання 2>", ...]
}
Жодного зайвого тексту поза JSON, розмітки \`\`\`json або інших пояснень. Тільки чистий JSON.`
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
      pros.push('Назва бажаної посади кандидата збігається або близька до вакансії.')
    } else {
      cons.push('Назва бажаної посади кандидата відрізняється від вакансії.')
      recommendations.push('Уточнити у кандидата його гнучкість щодо назви позиції та кола обов’язків.')
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
        pros.push(`Кандидат володіє ключовими технологіями вакансії (${matchedSkills} збігів).`)
      } else {
        cons.push('Не виявлено явних збігів щодо ключових технічних навичок в описі вакансії.')
        recommendations.push('Провести технічне інтерв’ю для глибокої перевірки стека.')
      }
    } else {
      cons.push('В резюме кандидата не вказано ключових навичок.')
      recommendations.push('Попросити кандидата скласти список ключових навичок та технологій.')
    }

    // Experience match
    const exp = params.candidateExperience || ''
    if (exp) {
      score += 10
      pros.push('У кандидата заповнено блок із досвідом роботи.')
      recommendations.push('Детально обговорити останній проєкт та роль кандидата в команді.')
    } else {
      cons.push('Досвід роботи в резюме не описаний детально.')
      recommendations.push('Запросити детальний опис попередніх місць роботи та досягнень.')
    }

    const verdict = score >= 75 ? 'strong_match' : score >= 50 ? 'potential_match' : 'no_match'
    
    return {
      score: Math.min(100, score),
      summary: `Аналіз на льоту (правила): Кандидат має збіг за назвою посади та володіє частиною ключових технологій. Оцінка відповідності становить ${score}%.`,
      pros,
      cons,
      verdict,
      recommendations
    }
  }
}
