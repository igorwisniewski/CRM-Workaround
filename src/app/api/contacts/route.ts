import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 401 })
        }

        const body = await request.json()

        const nowyKontakt = await prisma.contact.create({
            data: {
                // Podstawowe
                imie: body.imie,
                etap: body.etap,
                email: body.email,
                telefon: body.telefon,
                zrodlo: body.zrodlo,
                branza: body.branza,
                opis: body.opis,

                // Relacje
                createdById: user.id,
                // ZMIANA: Jeśli formularz przysłał assignedToId, użyj go. Jeśli nie - przypisz do twórcy.
                assignedToId: body.assignedToId || user.id,

                // Dane Firmowe
                nazwaFirmy: body.nazwaFirmy,
                rodzajDzialki: body.rodzajDzialki,
                potrzebaKlienta: body.potrzebaKlienta,
                formaOpodatkowania: body.formaOpodatkowania,
                majatekFirmy: body.majatekFirmy,
                czyZatrudniaPracownikow: body.czyZatrudniaPracownikow,
                opoznieniaWPlatnosciach: body.opoznieniaWPlatnosciach,
                planNaRozwoj: body.planNaRozwoj,

                // Dane Prywatne
                stanCywilny: body.stanCywilny,
                rozdzielnoscMajatkowa: body.rozdzielnoscMajatkowa,
                majatekPrywatny: body.majatekPrywatny,
                czyBralKredyt10Lat: body.czyBralKredyt10Lat,

                // Zobowiązania (stare)
                zobowiazania: body.zobowiazania,


                procesy: body.procesy,             // Tablica JSON
                wartosc: body.wartosc,             // Float/Int
                czyWystawilOpinie: body.czyWystawilOpinie // Boolean
            },
        })

        return NextResponse.json(nowyKontakt, { status: 201 })

    } catch (error: any) {
        console.error('BŁĄD API:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}