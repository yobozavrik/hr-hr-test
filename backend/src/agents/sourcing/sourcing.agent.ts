import { AbstractAgent } from '../base/agent.abstract'
import type { AgentInput } from '../base/agent.interface'
import type { SourcingResult } from '../base/agent.types'
import { LinkedInScraper } from './scrapers/linkedin.scraper'
import { WorkUaScraper } from './scrapers/work-ua.scraper'
import { RobotaUaScraper } from './scrapers/robota-ua.scraper'
import { ResumeParser } from './parsers/resume.parser'
import { DataEnricher } from './enrichers/data.enricher'

export class SourcingAgent extends AbstractAgent {
  readonly id = 'sourcing'
  readonly name = 'Марта'
  readonly description = 'Пошук кандидатів на джерелах'
  readonly capabilities = ['search_vacancies', 'search_resumes', 'parse_job_boards', 'enrich_profiles']

  private linkedinScraper!: LinkedInScraper
  private workUaScraper!: WorkUaScraper
  private robotaUaScraper!: RobotaUaScraper
  private parser!: ResumeParser
  private enricher!: DataEnricher

  protected async onInitialize(): Promise<void> {
    this.linkedinScraper = new LinkedInScraper()
    this.workUaScraper = new WorkUaScraper()
    this.robotaUaScraper = new RobotaUaScraper()
    this.parser = new ResumeParser()
    this.enricher = new DataEnricher()
  }

  protected async onExecute(input: AgentInput): Promise<SourcingResult> {
    const query = input.payload.query || 'Software Engineer'
    const location = input.payload.location || 'Remote'
    const sources = input.payload.sources || ['linkedin', 'work', 'robota']

    const rawCandidates: any[] = []

    if (sources.includes('linkedin')) {
      const results = await this.linkedinScraper.search(query, location)
      rawCandidates.push(...results)
    }
    if (sources.includes('work')) {
      const results = await this.workUaScraper.search(query, location)
      rawCandidates.push(...results)
    }
    if (sources.includes('robota')) {
      const results = await this.robotaUaScraper.search(query, location)
      rawCandidates.push(...results)
    }

    const parsedProfiles = rawCandidates.map(raw => this.parser.parse(raw))
    const enrichedProfiles = await Promise.all(
      parsedProfiles.map(p => this.enricher.enrich(p))
    )

    return {
      candidates: enrichedProfiles,
      totalFound: enrichedProfiles.length,
      sources,
      searchQuery: query
    }
  }
}
