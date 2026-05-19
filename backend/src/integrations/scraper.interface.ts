export interface ScrapedItem {
  id: string
  title: string
  company?: string
  location?: string | null
  salaryFrom?: number | null
  salaryTo?: number | null
  currency?: string | null
  description: string
  url: string
  source: 'work.ua' | 'robota.ua' | 'linkedin'
  skills?: string[]
  candidateName?: string
}

export interface ScraperSearchParams {
  text: string
  page?: number
  location?: string
}

export interface JobBoardScraper {
  searchVacancies(params: ScraperSearchParams): Promise<ScrapedItem[]>
  searchResumes(params: ScraperSearchParams): Promise<ScrapedItem[]>
}
