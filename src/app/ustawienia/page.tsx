// src/app/ustawienia/page.tsx
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UserColorPicker from '@/components/UserColorPicker' // Importujemy nasz komponent

export default async function UstawieniaPage() {
    const supabase = createClient()

    // 1. Sprawdź, czy to Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: user.id }
    })
    if (userProfile?.role !== 'ADMIN') {
        // Jeśli to nie admin, przekieruj
        redirect('/kontakty')
    }

    // 2. Pobierz wszystkich użytkowników
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
                        <UserColorPicker user={user} />
                    </div>
                ))}
            </div>
        </div>
    )
}