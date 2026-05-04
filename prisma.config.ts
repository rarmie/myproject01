import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: "postgresql://postgres.uhzcrsuqpdlslvfnzgam:masangya0909@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  },
})