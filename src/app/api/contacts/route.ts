// src/app/api/contacts/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server' // Klient serwerowy
import { prisma } from '@/lib/prisma' // Używamy globalnej instancji Prismy

export async function POST(request: Request) {
    const supabase = createClient()

    try {

        // 1. Sprawdź, czy użytkownik jest zalogowany
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // 1.5 Sprawdź, czy user istnieje w public.User
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!userProfile) {
            // To jest błąd, który wystąpi, jeśli nie dodałeś ręcznie admina
            return NextResponse.json({ error: `Krytyczny błąd: Użytkownik (ID: ${user.id}) nie ma profilu w tabeli User.` }, { status: 500 })
        }

        // 2. Pobierz dane z formularza
        const body = await request.json()

        const nowyKontakt = await prisma.contact.create({
            data: {
                // Stare pola
                imie: body.imie,
                etap: body.etap,
                email: body.email,
                telefon: body.telefon,
                zrodlo: body.zrodlo,
                branza: body.branza,
                opis: body.opis,
                createdById: user.id,
                assignedToId: user.id,

                // NOWE POLA:
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

                // Specjalna obsługa pola JSON
                // Frontend wyśle nam obiekt, a Prisma zapisze go jako JSON
                zobowiazania: body.zobowiazania,
            },
        })

        // 4. Zwróć sukces
        return NextResponse.json(nowyKontakt, { status: 201 })

    } catch (error: any) {
        // 5. Złap JAKIKOLWIEK błąd i odeślij go jako JSON

        console.error('BŁĄD KRYTYCZNY w /api/contacts:', error)

        let errorMessage = 'Nieznany błąd serwera.'

        if (error.code) {
            errorMessage = `Błąd Prismy ${error.code}: ${error.message}`
        } else {
            errorMessage = error.message
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}