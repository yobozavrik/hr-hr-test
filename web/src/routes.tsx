import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { RootLayout } from './pages/layout'
import { HomePage } from './pages/home'
import { DashboardPage, VacanciesPage, ResumesPage, MatchesPage, TasksPage, AnalyticsPage, AgentsPage } from './pages'
import { SearchPage } from './pages/search'
import { EmailPage } from './pages/email'
import { SettingsPage } from './pages/settings'
import { NotFoundPage, ServerErrorPage } from './pages/error-pages'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: DashboardPage,
})

const vacanciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/vacancies',
  component: VacanciesPage,
})

const resumesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/resumes',
  component: ResumesPage,
})

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/matches',
  component: MatchesPage,
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/tasks',
  component: TasksPage,
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/search',
  component: SearchPage,
})

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/analytics',
  component: AnalyticsPage,
})

const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/agents',
  component: AgentsPage,
})

const emailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/email',
  component: EmailPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/settings',
  component: SettingsPage,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFoundPage,
})

const serverErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/500',
  component: ServerErrorPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  vacanciesRoute,
  resumesRoute,
  matchesRoute,
  tasksRoute,
  searchRoute,
  analyticsRoute,
  agentsRoute,
  emailRoute,
  settingsRoute,
  notFoundRoute,
  serverErrorRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
