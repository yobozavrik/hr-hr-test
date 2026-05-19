import { createApp } from '../backend/src/app'
import { createPrisma } from '../backend/src/db'
import { loadEnv } from '../backend/src/env'

const env = loadEnv(process.env as Record<string, string>)
const prisma = createPrisma(env.DATABASE_URL)
const app = createApp({ env, prisma })

const handler = async (req: Request) => {
  return app.fetch(req)
}

export default handler
