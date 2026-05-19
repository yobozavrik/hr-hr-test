import { JobBoardScraper, ScrapedItem, ScraperSearchParams } from './scraper.interface'

export class WorkUaScraper implements JobBoardScraper {
  private baseUrl = 'https://www.work.ua'

  async searchVacancies(params: ScraperSearchParams): Promise<ScrapedItem[]> {
    const page = params.page ? params.page + 1 : 1
    const searchUrl = `${this.baseUrl}/jobs/?search=${encodeURIComponent(params.text)}&page=${page}`
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
        }
      })

      if (!response.ok) {
        console.error(`Work.ua search failed with status ${response.status}`)
        return []
      }

      const html = await response.text()
      return this.parseVacancyHtml(html)
    } catch (error) {
      console.error('Error fetching Work.ua vacancies:', error)
      return []
    }
  }

  async searchResumes(params: ScraperSearchParams): Promise<ScrapedItem[]> {
    const page = params.page ? params.page + 1 : 1
    const searchUrl = `${this.baseUrl}/resumes/?search=${encodeURIComponent(params.text)}&page=${page}`
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
        }
      })

      if (!response.ok) {
        console.error(`Work.ua resume search failed with status ${response.status}`)
        return []
      }

      const html = await response.text()
      return this.parseResumeHtml(html)
    } catch (error) {
      console.error('Error fetching Work.ua resumes:', error)
      return []
    }
  }

  private parseVacancyHtml(html: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    
    // Split by job-link wrapper to isolate each card
    const parts = html.split(/class="[^"]*job-link[^"]*"/)
    if (parts.length <= 1) return []

    // Skip first part (it's headers/nav)
    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i]
      
      // Extract URL and Title
      const urlTitleMatch = chunk.match(/href="([^"]*?\/jobs\/(\d+)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/)
      if (!urlTitleMatch) continue

      let url = urlTitleMatch[1]
      const id = urlTitleMatch[2]
      const title = urlTitleMatch[3].replace(/<[^>]*>/g, '').trim()

      if (!url.startsWith('http')) {
        url = `${this.baseUrl}${url}`
      }

      // Extract Company and Location (mt-xs)
      let company = 'Роботодавець'
      let location = 'Україна'
      const mtXsMatch = chunk.match(/class="mt-xs">([\s\S]*?)<\/div>/)
      if (mtXsMatch) {
        const mtXsContent = mtXsMatch[1].trim()
        const compMatch = mtXsContent.match(/class="strong-600">([^<]+)<\/span>/)
        if (compMatch) {
          company = compMatch[1].trim()
        }
        const locMatch = mtXsContent.match(/<span class="?">([^<]+)<\/span>\s*$/)
        if (locMatch) {
          location = locMatch[1].trim()
        }
      }

      // Extract Salary from first strong-600 span (if it contains numbers and currency indicator)
      let salaryFrom: number | null = null
      let salaryTo: number | null = null
      let currency: string | null = 'UAH'

      const spanMatch = chunk.match(/<span class="strong-600">([\s\S]*?)<\/span>/)
      if (spanMatch) {
        const rawText = spanMatch[1]
        const decoded = rawText
          .replace(/&nbsp;/gi, ' ')
          .replace(/&thinsp;/gi, ' ')
          .replace(/&#8239;/gi, ' ')
          .replace(/&#160;/gi, ' ')
        
        const hasDigits = /\d/.test(decoded)
        const hasCurrency = /(грн|UAH|\$|€|usd|eur)/i.test(decoded)
        
        if (hasDigits && hasCurrency) {
          const cleanText = decoded.replace(/\s+/g, '')
          if (cleanText.includes('–') || cleanText.includes('-')) {
            const salaryParts = cleanText.split(/[–-]/)
            const fromStr = salaryParts[0].replace(/\D/g, '')
            const toStr = salaryParts[1].replace(/\D/g, '')
            salaryFrom = fromStr ? parseInt(fromStr, 10) : null
            salaryTo = toStr ? parseInt(toStr, 10) : null
          } else {
            const valStr = cleanText.replace(/\D/g, '')
            salaryFrom = valStr ? parseInt(valStr, 10) : null
            salaryTo = salaryFrom
          }

          if (decoded.includes('$') || decoded.toLowerCase().includes('usd')) {
            currency = 'USD'
          } else if (decoded.includes('€') || decoded.toLowerCase().includes('eur')) {
            currency = 'EUR'
          }
        }
      }

      // Extract description snippet
      let description = ''
      const descMatch = chunk.match(/<p class="ellipsis[^>]*>([\s\S]*?)<\/p>/)
      if (descMatch) {
        description = descMatch[1]
          .replace(/&nbsp;/g, ' ')
          .replace(/&thinsp;/g, ' ')
          .replace(/&#8239;/g, ' ')
          .replace(/&hellip;/g, '...')
          .replace(/\s+/g, ' ')
          .trim()
      }

      items.push({
        id: `work_${id}`,
        title,
        company,
        location,
        salaryFrom,
        salaryTo,
        currency,
        description: description || 'Опис вакансії доступний за посиланням.',
        url,
        source: 'work.ua',
      })
    }

    return items
  }

  private parseResumeHtml(html: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    
    // Split by resume-link wrapper to isolate each card
    const parts = html.split(/class="[^"]*resume-link[^"]*"/)
    if (parts.length <= 1) return []

    // Skip first part
    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i]
      
      // Extract URL and Name
      const urlNameMatch = chunk.match(/href="([^"]*?\/resumes\/(\d+)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/)
      if (!urlNameMatch) continue

      let url = urlNameMatch[1]
      const id = urlNameMatch[2]
      let candidateName = 'Шукач'
      let location = 'Україна'

      if (!url.startsWith('http')) {
        url = `${this.baseUrl}${url}`
      }

      // Extract Position/Title
      let title = 'Шукач'
      const titleMatch = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
      }

      // Extract Candidate Name & Location
      const infoMatch = chunk.match(/<span class="strong-600">([^<]+)<\/span>,([\s\S]*?)<\/p>/)
      if (infoMatch) {
        candidateName = infoMatch[1].trim()
        const remainingSpans = infoMatch[2]
        const spans = [...remainingSpans.matchAll(/<span>([^<]+)<\/span>/g)].map(m => m[1].trim())
        if (spans.length > 0) {
          location = spans[spans.length - 1]
            .replace(/&nbsp;/gi, ' ')
            .replace(/&thinsp;/gi, ' ')
            .replace(/&#8239;/gi, ' ')
            .replace(/&#160;/gi, ' ')
        }
      }

      // Extract Salary
      let salaryFrom: number | null = null
      let currency: string | null = 'UAH'
      const salaryMatch = chunk.match(/<b>([\d\s ]+)(?:\s*)(грн|UAH|\$|€|usd|eur)/i)
      if (salaryMatch) {
        const salStr = salaryMatch[1].replace(/[\s ]/g, '')
        salaryFrom = parseInt(salStr, 10) || null
        const cur = salaryMatch[2]
        if (cur.includes('$') || cur.toLowerCase() === 'usd') {
          currency = 'USD'
        } else if (cur.includes('€') || cur.toLowerCase() === 'eur') {
          currency = 'EUR'
        }
      }

      // Extract Info / Description
      let description = ''
      const descMatch = chunk.match(/<p class="mb-0 overflow wordwrap[^>]*>([\s\S]*?)<\/p>/)
      if (descMatch) {
        description = descMatch[1]
          .replace(/&nbsp;/gi, ' ')
          .replace(/&thinsp;/gi, ' ')
          .replace(/&#8239;/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      } else {
        const fallbackDesc = chunk.match(/<p class="mb-0[^>]*>([\s\S]*?)<\/p>/)
        if (fallbackDesc) {
          description = fallbackDesc[1].replace(/<[^>]*>/g, '').trim()
        }
      }

      items.push({
        id: `work_resume_${id}`,
        title: title || 'Резюме',
        candidateName,
        location,
        salaryFrom,
        salaryTo: salaryFrom,
        currency,
        description: description || 'Інформація доступна в резюме за посиланням.',
        url,
        source: 'work.ua',
      })
    }

    return items
  }
}
