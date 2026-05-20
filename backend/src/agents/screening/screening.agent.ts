import { AbstractAgent } from '../base/agent.abstract'
import type { AgentInput } from '../base/agent.interface'
import type { ScreeningResult } from '../base/agent.types'
import { TechnicalEvaluator } from './evaluators/technical.evaluator'
import { CulturalEvaluator } from './evaluators/cultural.evaluator'
import { AvailabilityEvaluator } from './evaluators/availability.evaluator'
import { QuestionGenerator } from './question.generator'

export class ScreeningAgent extends AbstractAgent {
  readonly id = 'screening'
  readonly name = 'Скринінг-Агент'
  readonly description = 'Глибока перевірка кваліфікації та підготовка питань'
  readonly capabilities = ['technical_evaluation', 'cultural_match_check', 'question_generation']

  private technicalEvaluator!: TechnicalEvaluator
  private culturalEvaluator!: CulturalEvaluator
  private availabilityEvaluator!: AvailabilityEvaluator
  private questionGenerator!: QuestionGenerator

  protected async onInitialize(): Promise<void> {
    this.technicalEvaluator = new TechnicalEvaluator()
    this.culturalEvaluator = new CulturalEvaluator()
    this.availabilityEvaluator = new AvailabilityEvaluator()
    this.questionGenerator = new QuestionGenerator()
  }

  protected async onExecute(input: AgentInput): Promise<ScreeningResult> {
    const candidate = input.payload.candidate || {}

    const techRating = this.technicalEvaluator.evaluate(candidate.skills || [])
    const cultRating = this.culturalEvaluator.evaluate(candidate.experienceYears || 0)
    const availRating = this.availabilityEvaluator.evaluate(candidate.noticePeriod)

    const overallScore = Math.round((techRating * 0.5) + (cultRating * 0.3) + (availRating * 0.2))
    const passed = overallScore >= 75

    const generatedQuestions = this.questionGenerator.generate(
      candidate.fullName || 'Candidate',
      candidate.skills || ['TypeScript']
    )

    return {
      passed,
      overallScore,
      technicalRating: techRating,
      culturalRating: cultRating,
      generatedQuestions
    }
  }
}
