import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

// Funkcja GET do pobierania listy użytkowników
export async function GET() {
    const supabase = createClient()

    // Sprawdzamy, czy użytkownik jest zalogowany
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        // Pobieramy tylko ID i email, sortujemy alfabetycznie
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
            },
            orderBy: {
                email: 'asc'
            }
        })
        return NextResponse.json(users)
    } catch (error) {
        console.error("Błąd podczas pobierania użytkowników:", error)
        return NextResponse.json({ error: 'Nie udało się pobrać użytkowników' }, { status: 500 })
    }
}