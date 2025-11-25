// src/app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // <--- ZMIANA: Importujemy auth z NextAuth

// Funkcja GET do pobierania listy użytkowników
export async function GET() {
    // 1. Sprawdzamy, czy użytkownik jest zalogowany przy użyciu NextAuth
    const session = await auth()

    if (!session?.user?.email) {
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