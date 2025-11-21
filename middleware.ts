import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // Tworzymy odpowiedź, którą będziemy modyfikować (dodawać ciasteczka)
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Sprawdzamy użytkownika
    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // 2. Logika Przekierowań

    // A. Jeśli user jest zalogowany i wchodzi na stronę logowania -> wyślij do /kontakty
    if (user && pathname === '/') {
        url.pathname = '/kontakty'
        return NextResponse.redirect(url)
    }

    // B. Jeśli user NIE jest zalogowany i chce wejść w strefę prywatną -> wyślij do /
    if (!user && (
        pathname.startsWith('/kontakty') ||
        pathname.startsWith('/zadania') ||
        pathname.startsWith('/kalendarz') ||
        pathname.startsWith('/ustawienia')
    )) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // 3. Zwracamy odpowiedź z odświeżonymi ciasteczkami
    return response
}

export const config = {
    matcher: [
        '/',
        '/kontakty/:path*',
        '/zadania/:path*',
        '/kalendarz/:path*',
        '/ustawienia/:path*',
    ],
}