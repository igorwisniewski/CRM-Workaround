// src/components/AddTaskForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Definiujemy typ dla propsów (dane wejściowe komponentu)
interface AddTaskFormProps {
    contactId: string;
    users: {
        id: string;
        email: string | null;
    }[];
}

// Style
const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #aaa',
    borderRadius: '4px',
    marginBottom: '10px'
};

export default function AddTaskForm({ contactId, users }: AddTaskFormProps) {
    const router = useRouter()
    const [nazwa, setNazwa] = useState('')
    const [termin, setTermin] = useState('')
    const [assignedToId, setAssignedToId] = useState('')
    const [opis, setOpis] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Ustawiamy domyślnego użytkownika, jeśli nie wybrano
        const finalAssignedToId = assignedToId || users[0]?.id
        if (!finalAssignedToId) {
            setError('Nie można przypisać zadania, brak użytkowników.')
            return
        }

        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nazwa,
                termin,
                opis,
                contactId,
                assignedToId: finalAssignedToId,
            })
        })

        if (res.ok) {
            // Sukces - resetuj formularz i odśwież stronę
            setNazwa('')
            setTermin('')
            setOpis('')
            setError('')
            router.refresh()
        } else {
            const data = await res.json()
            setError(data.error || 'Nie udało się dodać zadania.')
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
            <h3>Dodaj nowe zadanie</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <label>Nazwa zadania:</label>
            <input
                type="text"
                value={nazwa}
                onChange={(e) => setNazwa(e.target.value)}
                style={inputStyle}
                required
            />

            <label>Termin (data i godzina):</label>
            <input
                type="datetime-local" // Specjalny input do daty i czasu
                value={termin}
                onChange={(e) => setTermin(e.target.value)}
                style={inputStyle}
                required
            />

            <label>Przypisz do:</label>
            <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                style={inputStyle}
            >
                <option value="">Wybierz użytkownika...</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                ))}
            </select>

            <label>Opis:</label>
            <textarea
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px' }}
            />

            <button type="submit" style={{ padding: '10px 15px', background: 'blue', color: 'white' }}>
                Dodaj zadanie
            </button>
        </form>
    )
}