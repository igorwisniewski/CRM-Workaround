'use client' // WAŻNE: Na samej górze!

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

// Definiujemy propsy, aby komponent mógł przyjąć listę użytkowników
type UserProp = {
    id: string;
    email: string;
}

interface AssignedFiltrProps {
    users?: UserProp[]; // Lista jest opcjonalna (np. dla zwykłego usera)
}

export default function AssignedFiltr({ users }: AssignedFiltrProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Tworzymy stan dla 'userId', tak jak miałeś dla 'etap'
    const [userId, setUserId] = useState(searchParams.get('userId') || 'wszyscy')

    // Tworzymy funkcję 'handleUserChange', która działa tak samo jak Twoja 'handleFilterChange'
    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUserId = e.target.value
        setUserId(newUserId) // Ustawiamy stan

        const params = new URLSearchParams(searchParams.toString())
        if (newUserId === 'wszyscy') {
            params.delete('userId') // Czyścimy parametr, jeśli wybrano "Wszyscy"
        } else {
            params.set('userId', newUserId) // Ustawiamy nowy parametr
        }
        // Używamy router.push, dokładnie tak jak w Twoim kodzie
        router.push(`/kontakty?${params.toString()}`)
    }

    // Jeśli komponent nie otrzyma listy użytkowników (np. nie jest adminem),
    // niczego nie renderujemy.
    if (!users || users.length === 0) {
        return null
    }

    // Renderujemy tylko dropdown (select)
    return (
        <select
            value={userId}
            onChange={handleUserChange}
            style={{ padding: '8px', marginLeft: '15px' }} // Dodajemy margines, by oddzielić go od reszty
        >
            <option value="wszyscy">Wszyscy użytkownicy</option>
            <option value="nieprzypisani">Nie przypisani</option>
            {users.map(user => (
                <option key={user.id} value={user.id}>
                    {user.email}
                </option>
            ))}
        </select>
    )
}