// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // <--- ZMIANA: Importujemy auth

export async function GET(request: Request) {
    try {
        // 1. Sprawdź sesję
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // 2. Pobierz ID użytkownika z bazy na podstawie maila
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 401 })
        }

        // Na razie kalendarz pokazuje zadania tylko zalogowanego użytkownika
        // Możemy to później rozbudować o filtr (jak na stronie /zadania)
        const tasks = await prisma.task.findMany({
            where: {
                assignedToId: user.id, // Używamy ID z bazy
            },
            include: {
                assignedTo: { select: { kolor: true } } // Pobieramy kolor usera
            }
        })

        // Mapujemy zadania Prismy na format eventów FullCalendar
        const events = tasks.map(task => ({
            id: task.id,
            title: task.nazwa,
            start: task.termin, // Data i godzina rozpoczęcia
            backgroundColor: task.assignedTo.kolor || '#3788d8', // Domyślny niebieski
            borderColor: task.assignedTo.kolor || '#3788d8',
            allDay: false // Zakładamy, że zadania mają konkretne godziny
        }))

        return NextResponse.json(events)

    } catch (error: any) {
        console.error('BŁĄD API (GET ZADANIA):', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // 1. Sprawdź sesję
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // 2. Pobierz ID użytkownika z bazy (twórcy)
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Nie znaleziono użytkownika' }, { status: 401 })
        }

        const body = await request.json()

        // Walidacja (prosta)
        if (!body.nazwa || !body.termin || !body.contactId || !body.assignedToId) {
            return NextResponse.json({ error: 'Brakuje wymaganych pól zadania' }, { status: 400 })
        }

        const newTask = await prisma.task.create({
            data: {
                nazwa: body.nazwa,
                opis: body.opis,
                termin: new Date(body.termin), // Przekształcamy string na datę
                contactId: body.contactId,
                assignedToId: body.assignedToId,
                createdById: user.id, // Ustawiamy twórcę (z bazy)
            }
        })

        return NextResponse.json(newTask, { status: 201 })

    } catch (error: any) {
        console.error('BŁĄD API ZADAŃ:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}