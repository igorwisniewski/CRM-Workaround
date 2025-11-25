// src/components/Navbar.tsx
import Link from 'next/link'
import { auth } from '@/auth' // Importujemy nową funkcję autoryzacji
import { prisma } from '@/lib/prisma'
import LogoutButton from '@/components/LogoutButton'

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

export default async function Navbar() {
    // 1. Pobieramy sesję z NextAuth
    const session = await auth()
    const user = session?.user

    if (!user || !user.email) {
        return null
    }

    // 2. Pobieramy rolę z bazy (opcjonalne, jeśli rola nie jest w sesji)
    // Uwaga: user.id z sesji może wymagać rozszerzenia typów, ale email jest zawsze
    const userProfile = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true }
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

                {/* 3. Link widoczny tylko dla ADMINA */}
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