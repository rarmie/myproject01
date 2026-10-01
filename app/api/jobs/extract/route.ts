import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const extractSchema = z.object({
    text: z.string().trim().min(20).max(50_000),
})

export async function POST(req: NextRequest){
    const session = await getServerSession(authOptions)

    if (!session?.user.id){
        return NextResponse.json(
            {error: 'Unauthorized'},
            {status: 401}
        )
    }

    let body: unknown

    try{
        body = await req.json()
    } catch{
        return NextResponse.json(
            {error: 'Invalid JSON body.'},
            {status: 400}
        )
    }

    
    const parsed = extractSchema.safeParse(body)

    if (!parsed.success){
        return NextResponse.json(
            {error: parsed.error.flatten()},
            {status: 400}
        )
    }

    let backendRes: Response

    try{
        backendRes = await fetch(`${process.env.BACKEND_URL}/extract`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(parsed.data),
            signal: AbortSignal.timeout(30_000)
        })
    } catch(err){
        if (err instanceof Error && err.name === 'TimeoutError'){
            return NextResponse.json(
                {error: "The extraction took too long. Try again."},
                {status: 504}
            )
        }

        return NextResponse.json(
            {error: "Extraction failed. Try again later."},
            {status: 502}
        )
    }

    

    if (backendRes.status === 429 || backendRes.status === 503){
        return NextResponse.json(
            {error: 'Extraction failed. Try again later.'},
            {status: backendRes.status}
        )
    }

    if (!backendRes.ok){
        return NextResponse.json(
            {error: "Extraction failed. Try again later."},
            {status: 502}
        )
    }

    const extracted = await backendRes.json()
    return NextResponse.json(extracted)
}