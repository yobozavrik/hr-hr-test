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
      const urlTitleMatch = chunk.match(/href="([^"]+\/jobs\/(\d+)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/)
      if (!urlTitleMatch) continue

      let url = urlTitleMatch[1]
      const id = urlTitleMatch[2]
      let title = urlTitleMatch[3].replace(/<[^>]*>/g, '').trim()

      if (!url.startsWith('http')) {
        url = `${this.baseUrl}${url}`
      }

      // Extract Company
      let company = ''
      const companyMatch = chunk.match(/(?:<span><b>|class="strong">)([^<]+)(?:<\/b><\/span>|<\/span>)/)
      if (companyMatch) {
        company = companyMatch[1].trim()
      } else {
        const altCompanyMatch = chunk.match(/<span>([^<]+)<\/span>/)
        if (altCompanyMatch) company = altCompanyMatch[1].trim()
      }

      // Extract Salary
      let salaryFrom: number | null = null
      let salaryTo: number | null = null
      let currency: string | null = 'UAH'

      const salaryMatch = chunk.match(/(?:<b class="text-light">|<b>)([\d\s –-]+)(?:\s*)(грн|UAH|\$|€|usd|eur)/i)
      if (salaryMatch) {
        const salStr = salaryMatch[1].replace(/[\s ]/g, '') // remove spaces
        const cur = salaryMatch[2]
        
        if (cur.includes('$') || cur.toLowerCase() === 'usd') {
          currency = 'USD'
        } else if (cur.includes('€') || cur.toLowerCase() === 'eur') {
          currency = 'EUR'
        }

        if (salStr.includes('–') || salStr.includes('-')) {
          const parts = salStr.split(/[–-]/)
          salaryFrom = parseInt(parts[0], 10) || null
          salaryTo = parseInt(parts[1], 10) || null
        } else {
          salaryFrom = parseInt(salStr, 10) || null
          salaryTo = salaryFrom
        }
      }

      // Extract description snippet
      let description = ''
      const descMatch = chunk.match(/<p class="[^"]*text-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/)
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]*>/g, '').trim()
      }

      // Location
      let location = 'Украина'
      const locMatch = chunk.match(/(?:<span>·\s*|·\s*)([А-Яа-яA-Za-z\s-]+)(?:\s*·|\s*<\/span>)/)
      if (locMatch) {
        location = locMatch[1].trim()
      }

      items.push({
        id: `work_${id}`,
        title,
        company,
        location,
        salaryFrom,
        salaryTo,
        currency,
        description: description || 'Описание вакансии доступно по ссылке.',
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
      const urlNameMatch = chunk.match(/href="([^"]+\/resumes\/(\d+)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/)
      if (!urlNameMatch) continue

      let url = urlNameMatch[1]
      const id = urlNameMatch[2]
      let candidateName = urlNameMatch[3].replace(/<[^>]*>/g, '').trim()

      if (!url.startsWith('http')) {
        url = `${this.baseUrl}${url}`
      }

      // Extract Position/Title
      let title = 'Соискатель'
      const titleMatch = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      if (titleMatch) {
        const cleanH2 = titleMatch[1].replace(/<[^>]*>/g, '').trim()
        title = cleanH2.replace(candidateName, '').trim().replace(/^,/, '').trim() || cleanH2
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
      const descMatch = chunk.match(/<p class="[^"]*text-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/)
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]*>/g, '').trim()
      }

      // Location
      let location = 'Украина'
      const locMatch = chunk.match(/(?:·\s*)([А-Яа-яA-Za-z\s-]+)(?:\s*·|\s*<\/p>|\s*·\s*<b>)/)
      if (locMatch) {
        location = locMatch[1].trim()
      }

      items.push({
        id: `work_resume_${id}`,
        title: title || 'Резюме',
        candidateName,
        location,
        salaryFrom,
        salaryTo: salaryFrom,
        currency,
        description: description || 'Информация доступна в резюме по ссылке.',
        url,
        source: 'work.ua',
      })
    }

    return items
  }
}
