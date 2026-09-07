import { getServerSession } from "next-auth"
import {authOptions} from '@/app/api/auth/[...nextauth]/route'

export default async function Home(){
    const session = await getServerSession(authOptions)

    return(
        <section className="p-3">
            <h1 className="font-bold text-3xl">Dashboard</h1>
            <p>Welcome back, {' '} {session?.user.name}</p>
        </section>
    )
}