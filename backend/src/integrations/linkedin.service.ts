import { JobBoardScraper, ScrapedItem, ScraperSearchParams } from './scraper.interface'

export class LinkedInScraper implements JobBoardScraper {
  private apiKey: string | null = null
  private apiHost = 'linkedin-data-api.p.rapidapi.com' // Example stable RapidAPI LinkedIn Data API

  constructor() {
    this.apiKey = process.env.LINKEDIN_API_KEY || process.env.RAPIDAPI_KEY || null
  }

  async searchVacancies(params: ScraperSearchParams): Promise<ScrapedItem[]> {
    if (!this.apiKey) {
      console.log('LinkedIn API key not configured. Using high-quality mocks.')
      return this.generateMockVacancies(params.text)
    }

    try {
      // Example call to a standard RapidAPI LinkedIn search endpoint
      const response = await fetch(`https://${this.apiHost}/search-jobs?keywords=${encodeURIComponent(params.text)}&locationId=102264497&page=${(params.page || 0) + 1}`, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`LinkedIn API error: status ${response.status}`)
      }

      const data = (await response.json()) as any
      if (data && Array.isArray(data.items)) {
        return data.items.map((item: any) => ({
          id: `linkedin_${item.id || item.jobId}`,
          title: item.title || item.jobTitle || 'Job Role',
          company: item.company?.name || item.companyName || 'Company',
          location: item.location || 'Remote',
          salaryFrom: item.salaryMin || null,
          salaryTo: item.salaryMax || null,
          currency: item.salaryCurrency || 'USD',
          description: item.description || item.snippet || 'Description available on LinkedIn.',
          url: item.url || `https://www.linkedin.com/jobs/view/${item.id || item.jobId}`,
          source: 'linkedin',
        }))
      }

      return this.generateMockVacancies(params.text)
    } catch (error) {
      console.error('LinkedIn API vacancy search failed. Falling back to mocks:', error)
      return this.generateMockVacancies(params.text)
    }
  }

  async searchResumes(params: ScraperSearchParams): Promise<ScrapedItem[]> {
    if (!this.apiKey) {
      console.log('LinkedIn API key not configured for resumes. Using mocks.')
      return this.generateMockResumes(params.text)
    }

    try {
      // Example call to search profiles
      const response = await fetch(`https://${this.apiHost}/search-people?keywords=${encodeURIComponent(params.text)}&page=${(params.page || 0) + 1}`, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`LinkedIn API error: status ${response.status}`)
      }

      const data = (await response.json()) as any
      if (data && Array.isArray(data.items)) {
        return data.items.map((item: any) => ({
          id: `linkedin_resume_${item.id || item.profileId}`,
          title: item.headline || `${params.text} Specialist`,
          candidateName: `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'LinkedIn Member',
          location: item.location || 'Remote / Worldwide',
          description: item.summary || item.about || 'View full profile on LinkedIn.',
          url: item.profileUrl || `https://www.linkedin.com/in/${item.username || item.profileId}`,
          source: 'linkedin',
        }))
      }

      return this.generateMockResumes(params.text)
    } catch (error) {
      console.error('LinkedIn API resume search failed. Falling back to mocks:', error)
      return this.generateMockResumes(params.text)
    }
  }

  private generateMockVacancies(text: string): ScrapedItem[] {
    return [
      {
        id: 'linkedin_mock_1',
        title: `Lead ${text} Architect`,
        company: 'EPAM Systems',
        location: 'Remote, Europe',
        salaryFrom: 5000,
        salaryTo: 7500,
        currency: 'USD',
        description: `We are looking for a remote Lead ${text} Architect to design complex platforms for our global enterprises. 6+ years of production experience required. Excellent benefits package.`,
        url: 'https://www.linkedin.com/jobs/view/mock-lead-1',
        source: 'linkedin',
      },
      {
        id: 'linkedin_mock_2',
        title: `Senior ${text} Specialist`,
        company: 'Grammarly',
        location: 'Kyiv, Ukraine (Hybrid)',
        salaryFrom: 6000,
        salaryTo: 8000,
        currency: 'USD',
        description: `Grammarly is looking for a Senior ${text} to join our core product team. You will lead development of new features that will impact over 30 million active users.`,
        url: 'https://www.linkedin.com/jobs/view/mock-senior-2',
        source: 'linkedin',
      },
    ]
  }

  private generateMockResumes(text: string): ScrapedItem[] {
    return [
      {
        id: 'linkedin_resume_mock_1',
        title: `Senior ${text} Consultant`,
        candidateName: 'Dmitry Kovalenko',
        location: 'Kyiv, Ukraine',
        description: `Experienced professional specializing in ${text}. Designed enterprise-scale web projects, managed dev teams of 12+ developers, reduced time-to-market by 35%. Tech Stack: Node.js, React, GCP.`,
        url: 'https://www.linkedin.com/in/mock-dmitry-1',
        source: 'linkedin',
      },
      {
        id: 'linkedin_resume_mock_2',
        title: `${text} Evangelist & Team Lead`,
        candidateName: 'Elena Petrova',
        location: 'Lviv, Ukraine',
        description: `Passionate Team Lead and ${text} developer. Expert in building performant frontend architectures. Active open source contributor. Focused on UX, clean code, and automated testing.`,
        url: 'https://www.linkedin.com/in/mock-elena-2',
        source: 'linkedin',
      },
    ]
  }
}
