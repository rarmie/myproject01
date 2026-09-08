import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import {authOptions} from '@/app/api/auth/[...nextauth]/route'

const updateSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']).optional(),
  link: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user.id){
    return NextResponse.json(
      {error: 'Unauthorized'},
      {status: 401}
    )
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await prisma.jobApplication.update({
    where: { 
      id: params.id,
      userId: session.user.id
     },
    data: parsed.data,
  })

  return NextResponse.json(job)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user.id){
    return NextResponse.json(
      {error: 'Unauthorized'},
      {status: 401}
    )
  }
  await prisma.jobApplication.delete({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
  })

  return NextResponse.json({ message: 'Job deleted successfully' })
}