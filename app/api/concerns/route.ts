import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import {authOptions} from '@/app/api/auth/[...nextauth]/route'
import { ConcernStatus } from '@/lib/generated/prisma/enums'

const VALID_STATUSES = new Set(Object.values(ConcernStatus))

const concernSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  message: z.string().min(1, 'Description of concern is required'),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user.id){
    return NextResponse.json(
      {error: 'Unauthorized'},
      {status: 401}
    )
  }

  const body = await req.json()
  const parsed = concernSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await prisma.concern.create({
    data: { ...parsed.data, userId: session.user.id},
  })

  return NextResponse.json(job, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user.id){
    return NextResponse.json(
      {error: 'Unauthorized'},
      {status: 401}
    )
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  if (status && !VALID_STATUSES.has(status as ConcernStatus)){
    return NextResponse.json({error: 'Invalid status'}, {status: 400})
  }

  const concerns = await prisma.concern.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as ConcernStatus } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(concerns)
}