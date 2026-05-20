import { AbstractAgent } from '../base/agent.abstract'
import type { AgentInput } from '../base/agent.interface'
import type { MatchingResult } from '../base/agent.types'
import { SkillsScorer } from './scorers/skills.scorer'
import { SalaryScorer } from './scorers/salary.scorer'
import { LocationScorer } from './scorers/location.scorer'
import { ExperienceScorer } from './scorers/experience.scorer'

export class MatchingAgent extends AbstractAgent {
  readonly id = 'matching'
  readonly name = 'Артур'
  readonly description = 'Семантичне співставлення резюме та вакансії'
  readonly capabilities = ['candidate_scoring', 'skills_gap_analysis', 'salary_match_check']

  private skillsScorer!: SkillsScorer
  private salaryScorer!: SalaryScorer
  private locationScorer!: LocationScorer
  private experienceScorer!: ExperienceScorer

  protected async onInitialize(): Promise<void> {
    this.skillsScorer = new SkillsScorer()
    this.salaryScorer = new SalaryScorer()
    this.locationScorer = new LocationScorer()
    this.experienceScorer = new ExperienceScorer()
  }

  protected async onExecute(input: AgentInput): Promise<MatchingResult> {
    const candidate = input.payload.candidate || {}
    const vacancy = input.payload.vacancy || {}

    const skillsScore = this.skillsScorer.score(candidate.skills || [], vacancy.skills || [])
    const salaryScore = this.salaryScorer.score(candidate.salaryExpectation || 0, vacancy.budgetMax || 5000)
    const locationScore = this.locationScorer.score(candidate.location || 'Remote', vacancy.location || 'Remote')
    const expScore = this.experienceScorer.score(candidate.experienceYears || 0, vacancy.requiredYears || 3)

    const finalScore = Math.round((skillsScore * 0.4) + (salaryScore * 0.2) + (locationScore * 0.2) + (expScore * 0.2))

    const strengths: string[] = []
    const gaps: string[] = []

    if (skillsScore > 75) strengths.push('Відмінний збіг по технічному стеку')
    else gaps.push('Слабкий збіг по ключовим технологіям')

    if (salaryScore >= 100) strengths.push('Очікування по зарплаті в межах бюджету')
    else gaps.push('Очікування по зарплате перевищують бюджет')

    if (expScore >= 100) strengths.push('Достатній досвід роботи')
    else gaps.push('Рівень досвіду нижче вимог вакансії')

    return {
      matchScore: finalScore,
      strengths,
      gaps
    }
  }
}
