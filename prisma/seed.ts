import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ 
  connectionString: "postgresql://postgres.uhzcrsuqpdlslvfnzgam:masangya0909@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
})
const prisma = new PrismaClient({ adapter })

async function main() {
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
        userId: 'test-user-id',
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