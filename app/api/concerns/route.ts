import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const concernSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  message: z.string().min(1, 'Description of concern is required'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = concernSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await prisma.concern.create({
    data: { ...parsed.data, userId: 'test-user-id'},
  })

  return NextResponse.json(job, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const concerns = await prisma.concern.findMany({
    where: {
      userId: 'test-user-id',
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(concerns)
}