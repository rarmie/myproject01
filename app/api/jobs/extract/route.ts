import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const extractSchema = z.object({
    text: z.string().min(1),
})

export async function POST(req: NextRequest){
    const session = await getServerSession(authOptions)

    if (!session?.user.id){
        return NextResponse.json(
            {error: 'Unauthorized'},
            {status: 401}
        )
    }

    const body = await req.json()
    const parsed = extractSchema.safeParse(body)

    if (!parsed.success){
        return NextResponse.json(
            {error: parsed.error.flatten()},
            {status: 400}
        )
    }

    const backendRes = await fetch(`${process.env.BACKEND_URL}/extract`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(parsed.data)
    })

    if (!backendRes.ok){
        return NextResponse.json(
            {error: 'Extraction failed'},
            {status: 502}
        )
    }

    const extracted = await backendRes.json()
    return NextResponse.json(extracted)
}