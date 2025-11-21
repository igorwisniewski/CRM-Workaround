// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// Funkcja do ręcznego pobrania ID z URL (workaround)
function getIdFromUrl(request: Request) {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    return id
}

export async function DELETE(request: Request) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Sprawdzamy tylko, czy ktoś jest zalogowany
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        const taskId = getIdFromUrl(request)
        if (!taskId) {
            return NextResponse.json({ error: 'Brak ID zadania w adresie URL' }, { status: 400 });
        }

        // Usuwamy zadanie bez sprawdzania roli
        await prisma.task.delete({
            where: { id: taskId },
        })

        return NextResponse.json({ message: 'Usunięto zadanie' }, { status: 200 })

    } catch (error: any) {
        console.error("Błąd podczas usuwania zadania:", error)
        if (error.code === 'P2025') { // Kod błędu Prismy, gdy rekord nie istnieje
            return NextResponse.json({ error: 'Nie znaleziono zadania do usunięcia' }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}