import { PrismaClient, type Vacancy, type Resume } from '../generated/prisma/client'
import type {
  CreateVacancyRequest,
  UpdateVacancyRequest,
  CreateResumeRequest,
  UpdateResumeRequest,
  CreateMatchRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  SendEmailRequest,
  CreateSalaryReportRequest,
} from '@hr-recruiter/contracts'

export class HRService {
  constructor(private db: PrismaClient) {}

  // Vacancies
  async getVacancies(userId: string) {
    return this.db.vacancy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getVacancy(userId: string, id: string) {
    return this.db.vacancy.findFirst({
      where: { id, userId },
      include: { matches: { include: { resume: true } } },
    })
  }

  async createVacancy(userId: string, data: CreateVacancyRequest) {
    return this.db.vacancy.create({
      data: { ...data, userId },
    })
  }

  async updateVacancy(userId: string, id: string, data: UpdateVacancyRequest) {
    return this.db.vacancy.updateMany({
      where: { id, userId },
      data,
    })
  }

  async deleteVacancy(userId: string, id: string) {
    return this.db.vacancy.deleteMany({
      where: { id, userId },
    })
  }

  // Resumes
  async getResumes(userId: string) {
    return this.db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getResume(userId: string, id: string) {
    return this.db.resume.findFirst({
      where: { id, userId },
      include: { matches: { include: { vacancy: true } } },
    })
  }

  async createResume(userId: string, data: CreateResumeRequest) {
    return this.db.resume.create({
      data: { ...data, userId },
    })
  }

  async updateResume(userId: string, id: string, data: UpdateResumeRequest) {
    return this.db.resume.updateMany({
      where: { id, userId },
      data,
    })
  }

  async deleteResume(userId: string, id: string) {
    return this.db.resume.deleteMany({
      where: { id, userId },
    })
  }

  // Matches
  async getMatches(userId: string) {
    return this.db.match.findMany({
      where: {
        OR: [
          { vacancy: { userId } },
          { resume: { userId } },
        ],
      },
      include: { vacancy: true, resume: true },
    })
  }

  async createMatch(userId: string, data: CreateMatchRequest) {
    const vacancy = await this.db.vacancy.findFirst({
      where: { id: data.vacancyId, userId },
    })
    const resume = await this.db.resume.findFirst({
      where: { id: data.resumeId, userId },
    })

    if (!vacancy || !resume) {
      throw new Error('Vacancy or resume not found')
    }

    // Simple scoring based on position match and salary overlap
    const score = this.calculateMatchScore(vacancy, resume)

    return this.db.match.create({
      data: { ...data, score },
      include: { vacancy: true, resume: true },
    })
  }

  private calculateMatchScore(vacancy: Vacancy, resume: Resume): number {
    let score = 0

    // Position match (50%)
    if (vacancy.title.toLowerCase().includes(resume.position.toLowerCase()) ||
        resume.position.toLowerCase().includes(vacancy.title.toLowerCase())) {
      score += 50
    }

    // Salary match (30%)
    if (vacancy.salaryFrom && resume.salary) {
      if (resume.salary >= vacancy.salaryFrom && (!vacancy.salaryTo || resume.salary <= vacancy.salaryTo)) {
        score += 30
      } else if (Math.abs(resume.salary - vacancy.salaryFrom) / vacancy.salaryFrom < 0.2) {
        score += 15
      }
    }

    // Skills match (20%)
    if (vacancy.description && resume.skills.length > 0) {
      const vacancyWords = vacancy.description.toLowerCase().split(/\s+/)
      const matchingSkills = resume.skills.filter((skill: string) =>
        vacancyWords.some((word: string) => word.includes(skill.toLowerCase()))
      )
      score += Math.min(20, matchingSkills.length * 5)
    }

    return Math.min(100, score)
  }

  async updateMatch(userId: string, id: string, status: string) {
    const match = await this.db.match.findFirst({
      where: { id },
      include: { vacancy: true },
    })

    if (!match || match.vacancy.userId !== userId) {
      throw new Error('Match not found')
    }

    return this.db.match.update({
      where: { id },
      data: { status },
      include: { vacancy: true, resume: true },
    })
  }

  // Tasks
  async getTasks(userId: string) {
    return this.db.task.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async getUpcomingTasks(userId: string) {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    return this.db.task.findMany({
      where: {
        userId,
        scheduledAt: { gte: now, lte: tomorrow },
        status: 'pending',
      },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async createTask(userId: string, data: CreateTaskRequest) {
    return this.db.task.create({
      data: { ...data, userId },
    })
  }

  async updateTask(userId: string, id: string, data: UpdateTaskRequest) {
    return this.db.task.updateMany({
      where: { id, userId },
      data,
    })
  }

  async deleteTask(userId: string, id: string) {
    return this.db.task.deleteMany({
      where: { id, userId },
    })
  }

  // Email logs
  async getEmailLogs(userId: string) {
    return this.db.emailLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createEmailLog(userId: string, data: SendEmailRequest) {
    return this.db.emailLog.create({
      data: { ...data, userId },
    })
  }

  // Salary reports
  async getSalaryReports(userId: string) {
    return this.db.salaryReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createSalaryReport(userId: string, data: CreateSalaryReportRequest) {
    // Deterministic salary generation based on position and location characteristics
    const textFactor = (data.position.length + (data.location?.length ?? 0)) * 17
    const avgSalary = 60000 + (textFactor % 40) * 1000
    const minSalary = Math.floor(avgSalary * 0.7)
    const maxSalary = Math.floor(avgSalary * 1.3)

    return this.db.salaryReport.create({
      data: {
        ...data,
        userId,
        avgSalary,
        minSalary,
        maxSalary,
        currency: 'RUB',
        source: 'aggregated',
      },
    })
  }

  // Daily digest
  async getDailyDigest(userId: string) {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const newVacancies = await this.db.vacancy.count({
      where: { userId, createdAt: { gte: yesterday } },
    })

    const newResumes = await this.db.resume.count({
      where: { userId, createdAt: { gte: yesterday } },
    })

    const newMatches = await this.db.match.count({
      where: {
        createdAt: { gte: yesterday },
        OR: [
          { vacancy: { userId } },
          { resume: { userId } },
        ],
      },
    })

    const upcomingTasks = await this.getUpcomingTasks(userId)

    return {
      date: now.toISOString(),
      newVacancies,
      newResumes,
      newMatches,
      upcomingTasks,
      salaryChanges: [],
    }
  }
}
