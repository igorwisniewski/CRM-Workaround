import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }

        // 1. Pobierz kontakt
        const contact = await prisma.contact.findUnique({
            where: { id: id }
        })

        if (!contact) {
            return NextResponse.json({ error: 'Nie znaleziono kontaktu' }, { status: 404 });
        }

        // 2. Pobierz zadania
        const tasks = await prisma.task.findMany({
            where: { contactId: id },
            include: {
                assignedTo: {
                    select: { email: true, kolor: true }
                }
            },
            orderBy: { termin: 'asc' }
        })

        // 3. Pobierz listę userów (do przypisywania)
        const users = await prisma.user.findMany({
            select: { id: true, email: true }
        })

        return NextResponse.json({ contact, tasks, users });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}