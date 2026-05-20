import { AbstractAgent } from '../base/agent.abstract'
import type { AgentInput } from '../base/agent.interface'
import type { OutreachResult } from '../base/agent.types'
import { EmailService } from './email.service'
import { CalendarService } from './calendar.service'
import { interviewTemplate } from './templates/interview.template'
import { offerTemplate } from './templates/offer.template'
import { rejectionTemplate } from './templates/rejection.template'

export class OutreachAgent extends AbstractAgent {
  readonly id = 'outreach'
  readonly name = 'Софія'
  readonly description = 'Підготовка повідомлень та координація зустрічей'
  readonly capabilities = ['personalized_outreach', 'email_generation', 'meeting_scheduling']

  private emailService!: EmailService
  private calendarService!: CalendarService

  protected async onInitialize(): Promise<void> {
    this.emailService = new EmailService()
    this.calendarService = new CalendarService()
  }

  protected async onExecute(input: AgentInput): Promise<OutreachResult> {
    const candidate = input.payload.candidate || {}
    const role = input.payload.role || 'Software Engineer'
    const type = input.payload.type || 'interview'

    let draft = { subject: '', body: '' }
    if (type === 'offer') {
      draft = offerTemplate(candidate.fullName || 'Candidate', role)
    } else if (type === 'rejection') {
      draft = rejectionTemplate(candidate.fullName || 'Candidate', role)
    } else {
      draft = interviewTemplate(candidate.fullName || 'Candidate', role)
      const slots = await this.calendarService.getAvailableSlots()
      draft.body += `\n\nВільні слоти:\n- ${slots.join('\n- ')}`
    }

    const email = candidate.email || 'candidate@example.com'
    const sent = await this.emailService.sendEmail(email, draft.subject, draft.body)

    return {
      emailSubject: draft.subject,
      emailBody: draft.body,
      sent
    }
  }
}
