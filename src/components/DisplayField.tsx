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
        <div className="flex py-2 border-b border-zinc-800 last:border-0">
            <strong className="w-48 flex-shrink-0 text-zinc-950 font-medium">{label}:</strong>
            <span className="flex-1 text-zinc-900 break-words">{value}</span>
        </div>
    )
}