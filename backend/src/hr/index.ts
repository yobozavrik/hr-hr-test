import { Hono } from 'hono'
import { createVacancyRoutes } from './vacancy.routes'
import { createResumeRoutes } from './resume.routes'
import { createMatchRoutes } from './match.routes'
import { createTaskRoutes } from './task.routes'
import { createEmailRoutes } from './email.routes'
import { createSalaryRoutes } from './salary.routes'
import { createDigestRoutes } from './digest.routes'
import { createSearchRoutes } from './search.routes'
import { createAIRoutes } from './ai.routes'

export function createHRRoutes(db: any) {
  const app = new Hono()

  app.route('/vacancies', createVacancyRoutes(db))
  app.route('/resumes', createResumeRoutes(db))
  app.route('/matches', createMatchRoutes(db))
  app.route('/tasks', createTaskRoutes(db))
  app.route('/emails', createEmailRoutes(db))
  app.route('/salary', createSalaryRoutes(db))
  app.route('/digest', createDigestRoutes(db))
  app.route('/search', createSearchRoutes(db))
  app.route('/ai', createAIRoutes())

  return app
}
