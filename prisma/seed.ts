import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString})
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const testUser = await prisma.user.upsert({
    where: { email: 'user@gmail.com'},
    update: {
      password: hashedPassword,
    },
    create: {
      name: 'Test User',
      email: 'user@gmail.com',
      password: hashedPassword,
      updatedAt: new Date()
    }
  })

  const jobs = [
    { company: 'Google', role: 'Frontend Developer', status: 'APPLIED', salary: '$120,000', link: 'https://careers.google.com' },
    { company: 'Meta', role: 'React Engineer', status: 'INTERVIEW', salary: '$130,000', link: 'https://metacareers.com' },
    { company: 'Netflix', role: 'UI Engineer', status: 'WISHLIST', salary: '$140,000', link: 'https://jobs.netflix.com' },
    { company: 'Apple', role: 'Software Engineer', status: 'REJECTED', salary: '$125,000', link: 'https://apple.com/jobs' },
    { company: 'Spotify', role: 'Full Stack Developer', status: 'OFFER', salary: '$115,000', link: 'https://spotify.com/jobs' },
  ]

  for (const job of jobs) {
    await prisma.jobApplication.create({
      data: {
        userId: testUser.id,
        ...job,
        status: job.status as any,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })