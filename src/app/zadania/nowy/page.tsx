// src/app/zadania/nowy/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Style
const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '15px'
};
const formStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px'
};

// Typy dla danych z API
interface User { id: string; email: string | null; }
interface Contact { id: string; imie: string; nazwaFirmy: string | null; }

// Funkcja pomocnicza do formatowania daty dla inputa
function formatISOForInput(isoDate: string) {
    const date = new Date(isoDate);
    // datetime-local wymaga formatu YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
}

function NoweZadanieForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Stany formularza
    const [nazwa, setNazwa] = useState('')
    const [termin, setTermin] = useState('')
    const [assignedToId, setAssignedToId] = useState('')
    const [contactId, setContactId] = useState('')
    const [opis, setOpis] = useState('')

    // Stany dla dropdownów
    const [users, setUsers] = useState<User[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Efekt do pobrania danych dla dropdownów i ustawienia terminu
    useEffect(() => {
        // 1. Ustaw termin z URL
        const terminParam = searchParams.get('termin')
        if (terminParam) {
            setTermin(formatISOForInput(terminParam))
        }

        // 2. Pobierz userów i kontakty
        async function fetchData() {
            try {
                const res = await fetch('/api/form-data')
                if (!res.ok) throw new Error('Błąd pobierania danych')
                const data = await res.json()
                setUsers(data.users)
                setContacts(data.contacts)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!nazwa || !termin || !contactId || !assignedToId) {
            setError('Wypełnij wszystkie wymagane pola.')
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
                assignedToId,
            })
        })

        if (res.ok) {
            // Sukces - wróć do kalendarza
            router.push('/kalendarz')
        } else {
            const data = await res.json()
            setError(data.error || 'Nie udało się dodać zadania.')
        }
    }

    if (loading) return <p>Ładowanie...</p>

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h2>Nowe zadanie</h2>
            <p>Tworzenie zadania dla terminu klikniętego w kalendarzu.</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <label>Nazwa zadania: *</label>
            <input
                type="text"
                value={nazwa}
                onChange={(e) => setNazwa(e.target.value)}
                style={inputStyle}
                required
            />

            <label>Termin (data i godzina): *</label>
            <input
                type="datetime-local"
                value={termin}
                onChange={(e) => setTermin(e.target.value)}
                style={inputStyle}
                required
            />

            <label>Powiązany kontakt: *</label>
            <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                style={inputStyle}
                required
            >
                <option value="">Wybierz kontakt...</option>
                {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                        {contact.imie} ({contact.nazwaFirmy || 'prywatny'})
                    </option>
                ))}
            </select>

            <label>Przypisz do: *</label>
            <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                style={inputStyle}
                required
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
                style={{ ...inputStyle, minHeight: '100px' }}
            />

            <button type="submit" style={{ padding: '10px 15px', background: 'blue', color: 'white' }}>
                Utwórz zadanie
            </button>
        </form>
    )
}

// Używamy Suspense, bo useSearchParams musi być w komponencie klienckim
export default function NoweZadaniePage() {
    return (
        <Suspense fallback={<p>Ładowanie...</p>}>
            <NoweZadanieForm />
        </Suspense>
    )
}