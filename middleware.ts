import { auth } from "@/auth"

export default auth((req) => {
    // Logika przekierowań jest opcjonalna tutaj, jeśli masz ją w auth.ts
    // Ale dla pewności zostawmy podstawowe sprawdzenie
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    // Jeśli jesteś na stronie logowania i zalogowany -> przekieruj do kontaktów
    if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/kontakty', nextUrl))
    }

    // Jeśli nie jesteś zalogowany i próbujesz wejść w chronione -> przekieruj do logowania
    if (!isLoggedIn && nextUrl.pathname !== '/' && !nextUrl.pathname.startsWith('/api/auth')) {
        return Response.redirect(new URL('/', nextUrl))
    }
})

// Wykluczamy pliki statyczne i API auth z middleware
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}