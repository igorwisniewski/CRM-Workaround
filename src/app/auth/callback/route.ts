// src/app/auth/callback/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client' // 1. Import Prismy

const prisma = new PrismaClient() // 2. Inicjalizacja

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = createClient()
        // Wymień kod autoryzacyjny na sesję
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Błąd wymiany kodu:', error.message)
            return NextResponse.redirect(`${requestUrl.origin}/login?error=Błąd potwierdzenia e-mail`)
        }

        // 3. KLUCZOWY BLOK: Stwórz użytkownika w naszej bazie
        if (data.user) {
            try {
                // Sprawdź, czy user już nie istnieje (na wszelki wypadek)
                const existingUser = await prisma.user.findUnique({
                    where: { id: data.user.id }
                })

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            id: data.user.id,
                            email: data.user.email,
                            role: 'USER' // Domyślna rola
                        }
                    })
                }
            } catch (prismaError) {
                console.error("Błąd zapisu usera w Prisma:", prismaError)
                // Coś poszło bardzo nie tak
            }
        }
    }

    // Sukces! Przekieruj do głównej strony po zalogowaniu
    return NextResponse.redirect(`${requestUrl.origin}/kontakty`)
}