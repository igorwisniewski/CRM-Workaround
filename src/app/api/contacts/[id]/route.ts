import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// --- POBIERANIE 1 KONTAKTU ---
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Brak ID' }, { status: 400 });
        }

        const contact = await prisma.contact.findUnique({
            where: { id: id }
        })

        if (!contact) {
            return NextResponse.json({ error: 'Nie znaleziono kontaktu' }, { status: 404 });
        }
        return NextResponse.json(contact);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// --- AKTUALIZACJA 1 KONTAKTU ---
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()

        const updatedContact = await prisma.contact.update({
            where: { id: id },
            data: body,
        })
        return NextResponse.json(updatedContact, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// --- USUWANIE KONTAKTU ---
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    // Sprawdzenie roli ADMIN
    const userProfile = await prisma.user.findUnique({ where: { email: session.user.email }})
    if (userProfile?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Brak uprawnień Admina' }, { status: 403 })
    }

    try {
        const { id } = await params

        // Transakcja usuwania
        await prisma.$transaction([
            prisma.task.deleteMany({ where: { contactId: id } }),
            prisma.contact.delete({ where: { id: id } })
        ])

        return NextResponse.json({ message: 'Usunięto' }, { status: 200 })

    } catch (error: any) {
        console.error("Błąd usuwania:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}