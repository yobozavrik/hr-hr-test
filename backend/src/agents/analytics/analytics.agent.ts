import { AbstractAgent } from '../base/agent.abstract'
import type { AgentInput } from '../base/agent.interface'
import type { AnalyticsResult } from '../base/agent.types'
import { SalaryAnalyzer } from './salary.analyzer'
import { MarketAnalyzer } from './market.analyzer'
import { TrendAnalyzer } from './trend.analyzer'
import { CompetitorAnalyzer } from './competitor.analyzer'

export class AnalyticsAgent extends AbstractAgent {
  readonly id = 'analytics'
  readonly name = 'Данило'
  readonly description = 'Аналіз ринку праці та зарплатних трендів'
  readonly capabilities = ['market_analysis', 'salary_benchmarking', 'trend_tracking']

  private salaryAnalyzer!: SalaryAnalyzer
  private marketAnalyzer!: MarketAnalyzer
  private trendAnalyzer!: TrendAnalyzer
  private competitorAnalyzer!: CompetitorAnalyzer

  protected async onInitialize(): Promise<void> {
    this.salaryAnalyzer = new SalaryAnalyzer()
    this.marketAnalyzer = new MarketAnalyzer()
    this.trendAnalyzer = new TrendAnalyzer()
    this.competitorAnalyzer = new CompetitorAnalyzer()
  }

  protected async onExecute(input: AgentInput): Promise<AnalyticsResult> {
    const role = input.payload.query || 'Software Engineer'

    const salaries = this.salaryAnalyzer.analyze(role)
    const demandIndex = this.marketAnalyzer.getDemandIndex(role)
    const competitorActiveCount = this.competitorAnalyzer.getActiveCompetitorPostingsCount(role)

    return {
      salaryMin: salaries.min,
      salaryMax: salaries.max,
      salaryMedian: salaries.median,
      demandIndex,
      competitorActiveCount
    }
  }
}
