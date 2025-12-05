// src/components/DisplayZobowiazania.tsx
import React from 'react'
import { Prisma } from '@prisma/client'

interface Zobowiazania {
    zus?: string;
    us?: string;
    kredyty?: string;
    faktury?: string;
    inne?: string;
}

// Funkcja pomocnicza, aby wiersze wyglądały identycznie jak w DisplayField
const Row = ({ label, value }: { label: string, value: string | undefined | null }) => {
    if (!value || value.trim() === '') return null; // Nie renderuj pustych
    return (
        <div className="flex py-2 border-b border-zinc-900 last:border-b-0">
            <strong className="w-48 flex-shrink-0 text-zinc-600 font-medium">{label}:</strong>
            <span className="flex-1 text-zinc-800 break-words">{value}</span>
        </div>
    )
}

export default function DisplayZobowiazania({ data }: { data: Prisma.JsonValue | null | undefined }) {
    if (!data) return null;

    const zobowiazania = data as Zobowiazania;

    const hasData = Object.values(zobowiazania).some(val => val && val.trim().length > 0);
    if (!hasData) return null;

    return (
        // Używamy border-t (border-top) aby oddzielić tę sekcję od reszty pól
        <div className="mt-4 pt-4 border-t border-zinc-900">
            {/* Tytuł sekcji Zobowiązania */}
            <h3 className="mb-1 text-base font-semibold text-zinc-900">Zobowiązania</h3>

            <div className="flex flex-col">
                <Row label="ZUS" value={zobowiazania.zus} />
                <Row label="US" value={zobowiazania.us} />
                <Row label="Kredyty" value={zobowiazania.kredyty} />
                <Row label="Faktury" value={zobowiazania.faktury} />
                <Row label="Inne" value={zobowiazania.inne} />
            </div>
        </div>
    )
}