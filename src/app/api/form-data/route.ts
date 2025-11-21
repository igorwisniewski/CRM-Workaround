// src/app/api/form-data/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // Pobieramy obie listy naraz
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