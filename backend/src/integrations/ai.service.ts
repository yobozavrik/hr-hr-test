import {
  ARTUR_ASSESSMENT_PROMPT,
  SOFIA_OUTREACH_PROMPT,
  DANILO_ANALYTICS_PROMPT,
  MARTA_SOURCING_PROMPT
} from './prompts'

export interface AIAnalysisResult {
  score: number
  summary: string
  pros: string[]
  cons: string[]
  verdict: 'strong_match' | 'potential_match' | 'no_match'
  recommendations: string[]
}

export interface AISofiaOutreachResult {
  subject: string
  content: string
}

export interface AIDaniloSalaryResult {
  position: string
  min: number
  median: number
  max: number
  currency: string
  demand: 'High' | 'Medium' | 'Low'
  advice: string
}

export interface AIMartaSourcingResult {
  expansions: string[]
  titles: string[]
  booleanSearch: string
}

export class AIService {
  private openaiApiKey = process.env.OPENAI_API_KEY || null
  private geminiApiKey = process.env.GEMINI_API_KEY || null
  private groqApiKey = process.env.GROQ_API_KEY || null

  private async executeAIPrompt<T>(prompt: string, fallbackFn: () => T): Promise<T> {
    if (this.openaiApiKey) {
      try {
        return await this.callOpenAI<T>(prompt)
      } catch (e) {
        console.error('OpenAI call failed, trying Gemini:', e)
      }
    }

    if (this.geminiApiKey) {
      try {
        return await this.callGemini<T>(prompt)
      } catch (e) {
        console.error('Gemini call failed, trying Groq:', e)
      }
    }

    if (this.groqApiKey) {
      try {
        return await this.callGroq<T>(prompt)
      } catch (e) {
        console.error('Groq call failed, running local rules-based fallback:', e)
      }
    }

    return fallbackFn()
  }

  // Artur - Assessment
  async analyzeMatch(params: {
    vacancyTitle: string
    vacancyDescription: string
    candidateName: string
    candidatePosition: string
    candidateSkills: string[]
    candidateExperience?: string
    candidateEducation?: string
  }): Promise<AIAnalysisResult> {
    const prompt = `
${ARTUR_ASSESSMENT_PROMPT}

VACANCY:
Title: ${params.vacancyTitle}
Description: ${params.vacancyDescription}

CANDIDATE:
Name: ${params.candidateName}
Desired Position: ${params.candidatePosition}
Skills: ${params.candidateSkills.join(', ')}
Experience: ${params.candidateExperience || 'Not specified'}
Education: ${params.candidateEducation || 'Not specified'}
`
    return this.executeAIPrompt<AIAnalysisResult>(prompt, () => this.fallbackRulesBasedAnalysis(params))
  }

  // Sofia - Outreach
  async generateOutreach(params: {
    candidateName: string
    candidatePosition: string
    vacancyTitle: string
  }): Promise<AISofiaOutreachResult> {
    const prompt = `
${SOFIA_OUTREACH_PROMPT}

CANDIDATE NAME: ${params.candidateName}
CANDIDATE POSITION: ${params.candidatePosition}
VACANCY TITLE: ${params.vacancyTitle}
`
    return this.executeAIPrompt<AISofiaOutreachResult>(prompt, () => ({
      subject: `Пропозиція співпраці: позиція "${params.vacancyTitle}"`,
      content: `Шановний ${params.candidateName || 'кандидате'},\n\nМене звати Софія, я ІІ-Координатор. Ми переглянули ваше резюме на позицію "${params.candidatePosition}" і вважаємо, що ваші навички ідеально відповідають вакансії "${params.vacancyTitle}".\n\nБудемо раді поспілкуватися на короткому інтерв'ю!\n\nЗ повагою,\nСофія.`
    }))
  }

  // Danilo - Salary Analytics
  async analyzeSalary(params: {
    position: string
  }): Promise<AIDaniloSalaryResult> {
    const prompt = `
${DANILO_ANALYTICS_PROMPT}

ROLE TO ANALYZE: ${params.position}
`
    return this.executeAIPrompt<AIDaniloSalaryResult>(prompt, () => {
      const baseSalary = params.position.toLowerCase().includes('senior') ? 4000 : params.position.toLowerCase().includes('junior') ? 1000 : 2500
      return {
        position: params.position,
        min: baseSalary - Math.round(baseSalary * 0.2),
        median: baseSalary,
        max: baseSalary + Math.round(baseSalary * 0.3),
        currency: 'USD',
        demand: params.position.toLowerCase().includes('react') || params.position.toLowerCase().includes('node') ? 'High' : 'Medium',
        advice: `Рекомендується орієнтуватися на бюджет $${baseSalary} для зменшення терміну закриття вакансії.`
      }
    })
  }

  // Marta - Sourcing Query Expander
  async expandSearchQuery(params: {
    text: string
  }): Promise<AIMartaSourcingResult> {
    const prompt = `
${MARTA_SOURCING_PROMPT}

SEARCH TEXT: ${params.text}
`
    return this.executeAIPrompt<AIMartaSourcingResult>(prompt, () => ({
      expansions: [params.text, `${params.text} Developer`, `Software Engineer ${params.text}`],
      titles: [params.text, `${params.text} Developer`],
      booleanSearch: `"${params.text}" AND ("developer" OR "engineer")`
    }))
  }

  private async callOpenAI<T>(prompt: string): Promise<T> {
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
    return JSON.parse(content) as T
  }

  private async callGemini<T>(prompt: string): Promise<T> {
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
    return JSON.parse(content) as T
  }

  private async callGroq<T>(prompt: string): Promise<T> {
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
    return JSON.parse(content) as T
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
