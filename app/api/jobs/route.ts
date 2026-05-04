import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const jobSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
  link: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = jobSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await prisma.jobApplication.create({
    data: { ...parsed.data, userId: 'test-user-id' },
  })

  return NextResponse.json(job, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const jobs = await prisma.jobApplication.findMany({
    where: {
      userId: 'test-user-id',
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(jobs)
}