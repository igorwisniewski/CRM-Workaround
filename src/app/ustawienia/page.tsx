import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // <--- ZMIANA: Import auth
import { redirect } from 'next/navigation'
import UserColorPicker from '@/components/UserColorPicker'

export default async function UstawieniaPage() {
    // 1. Pobierz sesję
    const session = await auth()

    if (!session?.user?.email) {
        redirect('/login')
    }

    // 2. Sprawdź rolę w bazie
    const userProfile = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (userProfile?.role !== 'ADMIN') {
        // Jeśli to nie admin, przekieruj do kontaktów
        redirect('/kontakty')
    }

    // 3. Pobierz wszystkich użytkowników
    const allUsers = await prisma.user.findMany({
        orderBy: { email: 'asc' }
    })

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', background: '#fff' }}>
            <h1>Ustawienia Użytkowników</h1>
            <p>Zarządzaj kolorami przypisanymi do użytkowników.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {allUsers.map(user => (
                    <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd' }}>
                        <strong>{user.email}</strong>
                        {/* UserColorPicker to komponent kliencki (use client),
                            więc możemy mu przekazać dane usera jako propsy.
                            Upewnij się tylko, że UserColorPicker nie importuje Supabase. */}
                        <UserColorPicker user={user} />
                    </div>
                ))}
            </div>
        </div>
    )
}