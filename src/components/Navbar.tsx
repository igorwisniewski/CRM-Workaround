// src/components/Navbar.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma' // <-- 1. IMPORTUJEMY PRISMA
import LogoutButton from '@/components/LogoutButton'

// ... (style bez zmian) ...
const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: '#333',
    color: 'white',
};
const navLinksStyle = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
};
const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
};
const userEmailStyle = {
    marginRight: '1rem',
    fontSize: '0.9rem',
    color: '#ccc',
};
// ... (style bez zmian) ...


export default async function Navbar() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // 2. SPRAWDZAMY ROLĘ UŻYTKOWNIKA
    const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true } // Pobieramy tylko rolę
    })

    return (
        <nav style={navStyle}>
            <div style={navLinksStyle}>
                <Link href="/kontakty" style={linkStyle}>
                    Kontakty
                </Link>
                <Link href="/zadania" style={linkStyle}>
                    Zadania
                </Link>
                <Link href="/kalendarz" style={linkStyle}>
                    Kalendarz
                </Link>

                {/* 3. LINK WIDOCZNY TYLKO DLA ADMINA */}
                {userProfile?.role === 'ADMIN' && (
                    <Link href="/ustawienia" style={linkStyle}>
                        Ustawienia
                    </Link>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={userEmailStyle}>{user.email}</span>
                <LogoutButton />
            </div>
        </nav>
    )
}