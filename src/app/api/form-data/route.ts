import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        const [users, contacts] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, email: true }
            }),
            prisma.contact.findMany({
                select: { id: true, imie: true, nazwaFirmy: true },
                orderBy: { imie: 'asc' }
            })
        ])

        return NextResponse.json({ users, contacts })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}