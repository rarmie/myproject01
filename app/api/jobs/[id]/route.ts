import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']).optional(),
  link: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await prisma.jobApplication.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(job)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.jobApplication.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ message: 'Job deleted successfully' })
}