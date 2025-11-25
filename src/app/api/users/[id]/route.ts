import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // <--- ZMIANA: Importujemy auth

// Funkcja-workaround do pobrania ID z URL
function getIdFromUrl(request: Request) {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    return id
}

// --- Funkcja PATCH do aktualizacji koloru ---
export async function PATCH(request: Request) {
    try {
        // 1. Sprawdź sesję (NextAuth)
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // 2. Sprawdź uprawnienia ADMIN w bazie (na podstawie emaila z sesji)
        const adminProfile = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (adminProfile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Brak uprawnień Admina' }, { status: 403 })
        }

        // 3. Pobierz ID użytkownika do edycji (z URL)
        const userIdToUpdate = getIdFromUrl(request)
        if (!userIdToUpdate) {
            return NextResponse.json({ error: 'Brak ID użytkownika w URL' }, { status: 400 });
        }

        // 4. Pobierz nowy kolor z body
        const body = await request.json()
        const { kolor } = body

        if (!kolor) {
            return NextResponse.json({ error: 'Brak koloru w zapytaniu' }, { status: 400 });
        }

        // 5. Zaktualizuj użytkownika w bazie
        const updatedUser = await prisma.user.update({
            where: { id: userIdToUpdate },
            data: { kolor: kolor },
        })

        return NextResponse.json(updatedUser, { status: 200 })

    }
    //@ts-expect-error asa
    catch (error: never) { // <--- ZMIANA: 'any' zamiast 'never'
        console.error("Błąd podczas aktualizacji koloru:", error)
        return NextResponse.json({ error: error.message || 'Wystąpił błąd' }, { status: 500 })
    }
}