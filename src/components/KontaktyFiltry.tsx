// src/components/KontaktyFiltry.tsx
'use client' // WAŻNE: Na samej górze!

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

// Definiujemy etapy, aby używać ich w filtrach
const ETAPY = [
    "Lead",
    "Po pierwszym kontakcie",
    "Kompletuje dokumenty",
    "Braki w dokumentach",
    "Umówiony na spotkanie",
    "Po pierwszym spotkaniu",
    "Przygotowany do procesu",
    "Siadło",
    "Nie Siadło"
];

export default function KontaktyFiltry() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [etap, setEtap] = useState(searchParams.get('etap') || 'wszystkie')
    const [szukaj, setSzukaj] = useState(searchParams.get('szukaj') || '')

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEtap = e.target.value
        setEtap(newEtap)

        const params = new URLSearchParams(searchParams.toString())
        if (newEtap === 'wszystkie') {
            params.delete('etap')
        } else {
            params.set('etap', newEtap)
        }
        router.push(`/kontakty?${params.toString()}`)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams(searchParams.toString())
        if (!szukaj) {
            params.delete('szukaj')
        } else {
            params.set('szukaj', szukaj)
        }
        router.push(`/kontakty?${params.toString()}`)
    }

    const clearFilters = () => {
        setEtap('wszystkie')
        setSzukaj('')
        router.push('/kontakty')
    }

    return (
        <div style={{ display: 'flex', gap: '15px', margin: '20px 0', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
                <input
                    type="text"
                    placeholder="Szukaj (imię, email, firma...)"
                    value={szukaj}
                    onChange={(e) => setSzukaj(e.target.value)}
                    style={{ padding: '8px', minWidth: '250px' }}
                />
                <button type="submit" style={{ padding: '8px 12px' }}>Szukaj</button>
            </form>

            <select
                value={etap}
                onChange={handleFilterChange}
                style={{ padding: '8px' }}
            >
                <option value="wszystkie">Wszystkie etapy</option>
                {ETAPY.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            <button onClick={clearFilters} style={{ padding: '8px 12px', background: '#eee', border: '1px solid #ccc' }}>
                Wyczyść
            </button>
        </div>
    )
}