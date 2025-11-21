// src/components/UserColorPicker.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserProps {
    id: string;
    email: string | null;
    kolor: string | null;
}

export default function UserColorPicker({ user }: { user: UserProps }) {
    // Domyślny kolor to biały, jeśli user nie ma
    const [color, setColor] = useState(user.kolor || '#ffffff')
    const [message, setMessage] = useState('')

    const router = useRouter()

    const handleSave = async () => {
        setMessage('Zapisywanie...')

        const res = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kolor: color }),
        })

        if (res.ok) {
            setMessage('Zapisano!')
            // Odświeżamy dane na serwerze, aby kalendarz/zadania pobrały nowy kolor
            router.refresh()
        } else {
            const data = await res.json()
            setMessage(`Błąd: ${data.error}`)
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '50px', height: '30px' }}
            />
            <button onClick={handleSave} style={{ padding: '5px 10px' }}>
                Zapisz
            </button>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>{message}</span>
        </div>
    )
}