import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { RootLayout } from './pages/layout'
import { HomePage } from './pages/home'
import { DashboardPage, VacanciesPage, ResumesPage, MatchesPage, TasksPage, IntegrationsPage } from './pages'

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

const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/integrations',
  component: IntegrationsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  vacanciesRoute,
  resumesRoute,
  matchesRoute,
  tasksRoute,
  integrationsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
