import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // <--- ZMIANA

export async function POST(request: Request) {
    try {
        // 1. Nowa autoryzacja
        const session = await auth()

        // UWAGA: session.user.id jest dostępne, jeśli skonfigurowałeś callback w auth.ts
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // Pobieramy usera z bazy, żeby mieć pewność co do ID i roli
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 401 })
        }

        const body = await request.json()

        const nowyKontakt = await prisma.contact.create({
            data: {
                imie: body.imie,
                etap: body.etap,
                email: body.email,
                telefon: body.telefon,
                zrodlo: body.zrodlo,
                branza: body.branza,
                opis: body.opis,
                // Używamy ID z bazy
                createdById: user.id,
                assignedToId: user.id, // Domyślnie przypisz do twórcy

                nazwaFirmy: body.nazwaFirmy,
                rodzajDzialki: body.rodzajDzialki,
                potrzebaKlienta: body.potrzebaKlienta,
                formaOpodatkowania: body.formaOpodatkowania,
                majatekFirmy: body.majatekFirmy,
                czyZatrudniaPracownikow: body.czyZatrudniaPracownikow,
                opoznieniaWPlatnosciach: body.opoznieniaWPlatnosciach,
                planNaRozwoj: body.planNaRozwoj,
                stanCywilny: body.stanCywilny,
                rozdzielnoscMajatkowa: body.rozdzielnoscMajatkowa,
                majatekPrywatny: body.majatekPrywatny,
                czyBralKredyt10Lat: body.czyBralKredyt10Lat,
                zobowiazania: body.zobowiazania,
            },
        })

        return NextResponse.json(nowyKontakt, { status: 201 })

    } catch (error: any) {
        console.error('BŁĄD:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}