import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Brak ID zadania' }, { status: 400 });
        }

        await prisma.task.delete({
            where: { id: id },
        })

        return NextResponse.json({ message: 'Usunięto zadanie' }, { status: 200 })

    } catch (error: any) {
        console.error("Błąd usuwania zadania:", error)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Zadanie nie istnieje' }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}