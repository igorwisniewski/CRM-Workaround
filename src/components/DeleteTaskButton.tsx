// src/components/DeleteTaskButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setError('')
        if (isDeleting) return;

        console.clear();
        console.log(`Próba usunięcia zadania o ID: ${taskId}`);
        console.log(`Wysyłanie żądania DELETE do: /api/tasks/${taskId}`);

        if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            setIsDeleting(true);
            try {
                const res = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                })

                if (res.ok) {
                    console.log('Sukces! Odpowiedź serwera:', res);

                    // 1. KOMUNIKAT O SUKCESIE
                    alert('Zadanie zostało pomyślnie usunięte.');

                    // 2. ODŚWIEŻENIE STRONY
                    router.refresh();
                } else {
                    // Twoja bardzo dobra logika obsługi błędów:
                    console.error('Błąd! Odpowiedź serwera NIE była OK.');
                    console.log('Status odpowiedzi:', res.status, res.statusText);
                    try {
                        const data = await res.json();
                        console.error('Treść błędu (JSON):', data);
                        setError(data.error || 'Nieznany błąd serwera.');
                        alert(`BŁĄD: ${data.error}`);
                    } catch (jsonError) {
                        console.error('Odpowiedź serwera nie jest JSON-em. Odczyt jako tekst...');
                        const textData = await res.text();
                        console.error('Treść błędu (Tekst):', textData);
                        setError('Błąd serwera, odpowiedź nie była w formacie JSON.');
                        alert(`BŁĄD SERWERA: Odpowiedź nie była w formacie JSON.`);
                    }
                }
            } catch (err: any) {
                console.error('Błąd sieciowy (fetch):', err);
                setError('Błąd sieciowy.')
                alert(`BŁĄD SIECIOWY: ${err.message}`)
            } finally {
                setIsDeleting(false);
            }
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            // Zaktualizowane style Tailwind
            className="py-1 px-2 bg-red-600 text-white text-xs font-medium rounded
                       hover:bg-red-700 transition-colors disabled:opacity-50"
        >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
        </button>
    )
}