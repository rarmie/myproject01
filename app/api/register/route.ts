import NextAuth, {NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
import z from "zod";
import { NextResponse } from "next/server";
import { parse } from "path";

const registerSchema = z.object({
    firstName: z.string().min(1,'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(10, "Password must be at least 10 characters"),
    confirmPassword: z.string().min(10),
}).refine((data) => data.password === data.confirmPassword,
{
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export async function POST(request: Request){

    try{
        const body = await request.json()
        const parsed = registerSchema.safeParse(body)

        if (!parsed.success){
            return NextResponse.json(
                {error: parsed.error.flatten().fieldErrors},
                {status: 400}
            )
        }

        const {firstName, lastName, email, password} = parsed.data
        const name = `${firstName} ${lastName}`.trim()
        
        const existingUser = await prisma.user.findUnique({
            where: {email}
        })

        if (existingUser){
            return NextResponse.json(
                {error: 'An account with this email already exists.'},
                {status: 409}
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        return NextResponse.json(
            {message: 'Account successfully created.'},
            {status: 201}
        )
    }
    catch(error){
        console.error('Registration error:', error)
        return NextResponse.json(
            {error: 'Something went wrong, please try again.'},
            {status: 500}
        )
    }
}