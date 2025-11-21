// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// Funkcja-workaround do pobrania ID z URL
function getIdFromUrl(request: Request) {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    return id
}

// --- Funkcja PATCH do aktualizacji koloru ---
export async function PATCH(request: Request) {
    const supabase = createClient()

    try {
        // 1. Sprawdź, czy zalogowany user to ADMIN
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        const adminProfile = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (adminProfile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Brak uprawnień Admina' }, { status: 403 })
        }

        // 2. Pobierz ID użytkownika do edycji (z URL)
        const userIdToUpdate = getIdFromUrl(request)
        if (!userIdToUpdate) {
            return NextResponse.json({ error: 'Brak ID użytkownika w URL' }, { status: 400 });
        }

        // 3. Pobierz nowy kolor z body
        const body = await request.json()
        const { kolor } = body

        if (!kolor) {
            return NextResponse.json({ error: 'Brak koloru w zapytaniu' }, { status: 400 });
        }

        // 4. Zaktualizuj użytkownika w bazie
        const updatedUser = await prisma.user.update({
            where: { id: userIdToUpdate },
            data: { kolor: kolor },
        })

        return NextResponse.json(updatedUser, { status: 200 })

    } catch (error: any) {
        console.error("Błąd podczas aktualizacji koloru:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}