// src/components/DisplayField.tsx
import React from 'react'

interface DisplayFieldProps {
    label: string;
    value: string | null | undefined;
}

export default function DisplayField({ label, value }: DisplayFieldProps) {
    // Nie renderuj nic, jeśli nie ma wartości
    if (!value) {
        return null;
    }

    return (
        // Używamy flexboxa do wyrównania
        // 'py-2' (padding góra/dół) da odstęp między wierszami
        // 'border-b' (border-bottom) da linię oddzielającą
        // 'last:border-b-0' usunie ostatnią linię w sekcji
        <div className="flex py-2 border-b border-zinc-100 last:border-b-0">
            {/* Etykieta:
              - 'w-48' nadaje stałą szerokość (możesz zmienić na np. w-52 jeśli trzeba)
              - 'flex-shrink-0' zapobiega kurczeniu się etykiety
            */}
            <strong className="w-48 flex-shrink-0 text-zinc-600 font-medium">{label}:</strong>

            {/* Wartość:
              - 'flex-1' sprawia, że zajmuje resztę dostępnego miejsca
              - 'break-words' pozwala na łamanie bardzo długiego tekstu
            */}
            <span className="flex-1 text-zinc-800 break-words">{value}</span>
        </div>
    )
}