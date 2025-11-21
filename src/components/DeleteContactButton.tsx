// src/components/DeleteContactButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteContactButton({ contactId }: { contactId: string }) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false) // Dodajemy stan ładowania

    const handleDelete = async () => {
        setError('')
        if (isDeleting) return; // Zapobiegaj podwójnemu kliknięciu

        if (window.confirm('Czy na pewno chcesz usunąć ten kontakt? Spowoduje to również usunięcie wszystkich powiązanych z nim zadań.')) {
            setIsDeleting(true)
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.refresh() // Odśwież tabelę
            } else {
                const data = await res.json()
                setError(data.error || 'Nie udało się usunąć.')
                alert(`BŁĄD: ${data.error}`)
            }
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            // ZMIENIONE STYLE NA KLASY TAILWIND
            className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
        </button>
    )
}