// src/components/ZadaniaFiltry.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface User {
    id: string;
    email: string | null;
}

interface ZadaniaFiltryProps {
    users: User[];
    currentUserId: string; // ID aktualnie zalogowanego usera
}

export default function ZadaniaFiltry({ users, currentUserId }: ZadaniaFiltryProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Domyślnie wybrany jest użytkownik z URL, lub zalogowany użytkownik
    const [selectedUser, setSelectedUser] = useState(searchParams.get('userId') || currentUserId)

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUserId = e.target.value
        setSelectedUser(newUserId)

        // Budujemy nowy URL
        const params = new URLSearchParams(searchParams.toString())
        params.set('userId', newUserId)
        router.push(`/zadania?${params.toString()}`)
    }

    return (
        <div style={{ margin: '20px 0', padding: '10px', background: '#f0f0f0', borderRadius: '8px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                Pokaż zadania dla:
            </label>
            <select
                value={selectedUser}
                onChange={handleFilterChange}
                style={{ padding: '8px', minWidth: '250px' }}
            >
                {/* Dodajemy "Moje zadania" jako opcję domyślną */}
                <option value={currentUserId}>Moje zadania</option>

                {/* Filtrujemy, by nie powielać siebie na liście */}
                {users.filter(u => u.id !== currentUserId).map(user => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                ))}
            </select>
        </div>
    )
}