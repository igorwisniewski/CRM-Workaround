// src/app/api/contacts/[id]/route.ts

// ZMIANA: Usunięto 'export const dynamic = 'force-dynamic'' - nie jest tu konieczne
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// --- POBIERANIE 1 KONTAKTU (dla strony edycji) ---
// Poprawna sygnatura funkcji dla App Routera z Promise dla params
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        // ZMIANA: Używamy 'await params', aby dostać się do id
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
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
// Poprawna sygnatura funkcji
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        // ZMIANA: Używamy 'await params'
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }

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

// Poprawna sygnatura funkcji
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    const userProfile = await prisma.user.findUnique({ where: { id: user.id }})
    if (userProfile?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Brak uprawnień Admina' }, { status: 403 })
    }

    try {
        // ZMIANA: Używamy 'await params'
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }

        // Transakcja usuwania zadań i kontaktu
        const deleteTasks = prisma.task.deleteMany({
            where: { contactId: id },
        })

        const deleteContact = prisma.contact.delete({
            where: { id: id },
        })

        await prisma.$transaction([
            deleteTasks,
            deleteContact
        ])

        return NextResponse.json({ message: 'Usunięto' }, { status: 200 })

    } catch (error: any) {
        console.error("Błąd podczas usuwania kontaktu:", error)
        if (error.code) {
            return NextResponse.json({ error: `Błąd Prismy ${error.code}: ${error.message}` }, { status: 500 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}