import path from 'node:path'
import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DIRECT_URL

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: connectionString,
  },
})