// src/app/api/contact-details/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// Ta sama funkcja-workaround co w API kontaktów
function getIdFromUrl(request: Request) {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    return id
}

export async function GET(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        const contactId = getIdFromUrl(request)
        if (!contactId) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }

        // 1. Pobierz kontakt
        const contact = await prisma.contact.findUnique({
            where: { id: contactId }
        })

        if (!contact) {
            return NextResponse.json({ error: 'Nie znaleziono kontaktu' }, { status: 404 });
        }

        // 2. Pobierz zadania (z kolorem i mailem usera)
        const tasks = await prisma.task.findMany({
            where: { contactId: contactId },
            include: {
                assignedTo: {
                    select: { email: true, kolor: true }
                }
            },
            orderBy: { termin: 'asc' }
        })

        // 3. Pobierz listę userów (dla formularza)
        const users = await prisma.user.findMany({
            select: { id: true, email: true }
        })

        // Zwróć wszystko jako jeden obiekt
        return NextResponse.json({ contact, tasks, users });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}