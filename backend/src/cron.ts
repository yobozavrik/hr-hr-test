import { createBackendRuntime, type BackendRuntime } from './runtime'
import { HRService } from './hr/service'

type CronTask = (runtime: BackendRuntime) => Promise<void>

const cronTasks = {
  noop: async () => {
    console.log('Cron noop task completed.')
  },
  'db:ping': async ({ prisma }) => {
    await prisma.$queryRaw`SELECT 1`
    console.log('Cron db:ping task completed.')
  },
  'daily:digest': async ({ prisma }) => {
    const service = new HRService(prisma)
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      try {
        const digest = await service.getDailyDigest(user.id)
        console.log(`Daily digest for ${user.email}:`, {
          newVacancies: digest.newVacancies,
          newResumes: digest.newResumes,
          newMatches: digest.newMatches,
          upcomingTasks: digest.upcomingTasks.length,
        })
      } catch (error) {
        console.error(`Failed to generate digest for ${user.email}:`, error)
      }
    }
    
    console.log('Cron daily:digest task completed.')
  },
} satisfies Record<string, CronTask>

export type CronTaskName = keyof typeof cronTasks

export async function runCronTask(taskName: string, runtime: BackendRuntime) {
  const task = cronTasks[taskName as CronTaskName]

  if (!task) {
    throw new Error(`Unknown cron task "${taskName}". Available tasks: ${Object.keys(cronTasks).join(', ')}`)
  }

  await task(runtime)
}

export async function main(argv: string[] = Bun.argv.slice(2)) {
  const [taskName] = argv

  if (!taskName) {
    console.error(`Cron task name is required. Available tasks: ${Object.keys(cronTasks).join(', ')}`)
    process.exit(1)
  }

  const runtime = createBackendRuntime()

  try {
    await runCronTask(taskName, runtime)
  } finally {
    await runtime.close()
  }
}

if (import.meta.main) {
  await main()
}
