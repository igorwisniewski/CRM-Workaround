// src/app/kontakty/page.tsx

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // Importujemy auth z NextAuth
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import KontaktyFiltry from '@/components/KontaktyFiltry'
import DeleteContactButton from "@/components/DeleteContactButton";
import AssignedFiltr from "@/components/Przypisanyfiltr";

// Definiujemy typy dla strony (propsy przekazywane z URL)
interface KontaktyPageProps {
    searchParams: Promise<{
        etap?: string;
        szukaj?: string;
        userId?: string;
    }>
}

// Funkcja pomocnicza do formatowania daty
function formatDate(date: Date) {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

// Funkcja pomocnicza do kolorowania etapów
function getEtapClasses(etap: string | null | undefined): string {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap";

    switch (etap) {
        case "Lead":
            return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
        case "Po pierwszym kontakcie":
            return `${baseClasses} bg-cyan-100 text-cyan-800 border-cyan-200`;
        case "Kompletuje dokumenty":
            return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
        case "Braki w dokumentach":
            return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
        case "Umówiony na spotkanie":
            return `${baseClasses} bg-indigo-100 text-indigo-800 border-indigo-200`;
        case "Po pierwszym spotkaniu":
            return `${baseClasses} bg-purple-100 text-purple-800 border-purple-200`;
        case "Przygotowany do procesu":
            return `${baseClasses} bg-lime-100 text-lime-800 border-lime-200`;
        case "Siadło":
            return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
        case "Nie Siadło":
            return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
}

// Główny komponent strony (Komponent Serwerowy)
export default async function KontaktyPage({ searchParams }: KontaktyPageProps) {
    // 1. Uwierzytelnianie (NextAuth)
    const session = await auth()

    if (!session?.user?.email) {
        redirect('/')
    }

    // Pobieramy profil użytkownika z bazy
    const userProfile = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!userProfile) {
        redirect('/')
    }

    // 2. Budowanie zapytania (WHERE) dla Prismy
    const params = await searchParams;
    const { etap, szukaj, userId } = params;
    const where: Prisma.ContactWhereInput = {}

    // Logika filtrowania 'assignedToId'
    if (userProfile.role === 'ADMIN') {
        // ADMIN: Może filtrować
        if (userId && userId !== 'wszyscy') {
            if (userId === 'nieprzypisani') {
                // @ts-expect-error norma
                where.assignedToId = null;
            } else {
                where.assignedToId = userId;
            }
        }
    } else {
        // ZWYKŁY USER: Widzi tylko kontakty przypisane do siebie
        where.assignedToId = userProfile.id;
    }

    if (etap && etap !== 'wszystkie') {
        where.etap = etap
    }

    if (szukaj) {
        where.OR = [
            { imie: { contains: szukaj } }, // W MySQL 'contains' jest domyślnie case-insensitive
            { email: { contains: szukaj } },
            { telefon: { contains: szukaj } },
            { nazwaFirmy: { contains: szukaj } },
        ]
    }

    // 3. Pobranie kontaktów
    const kontakty = await prisma.contact.findMany({
        where: where,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            createdAt: true,
            imie: true,
            etap: true,
            nazwaFirmy: true,
            telefon: true,
            assignedTo: {
                select: {
                    email: true
                }
            }
        }
    })

    // Definiujemy typ dla użytkowników w filtrze
    type UserForFilter = {
        id: string;
        email: string | null;
    }

    let usersList: UserForFilter[] = []

    if (userProfile?.role === 'ADMIN') {
        // FIX: Pobieramy wszystkich, a potem filtrujemy w JS, żeby uniknąć błędu "Argument `not` must not be null"
        // To jest bezpieczne obejście problemu z Prisma + MySQL w niektórych wersjach.
        const allUsers = await prisma.user.findMany({
            select: { id: true, email: true },
            orderBy: { email: 'asc' }
        })

        // Filtrujemy tylko tych, co mają email (chociaż typ mówi String?, w bazie może być null)
        usersList = allUsers.filter(u => u.email !== null);
    }

    return (
        <div className="max-w-8xl mx-auto p-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-zinc-800">
                    Kontakty
                    <span className="text-zinc-500 font-normal ml-2">({kontakty.length})</span>
                    {userProfile.role === 'ADMIN' && (
                        <span className="text-lg font-normal text-blue-600 ml-3">(Admin)</span>
                    )}
                </h1>
                <Link
                    href="/kontakty/nowy"
                    className="inline-flex items-center py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                    + Dodaj nowy
                </Link>
            </div>
            {/* @ts-expect-error usersList type fix */}
            <AssignedFiltr users={usersList} />

            <KontaktyFiltry />

            {/* --- TABELA --- */}
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-zinc-200">
                <table className="w-full border-collapse">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                        <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Data dodania</th>
                        <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Imię</th>
                        <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Firma</th>
                        <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Telefon</th>
                        <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Etap</th>
                        {userProfile.role === 'ADMIN' && (
                            <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Przypisany do</th>
                        )}
                        <th className="p-3 text-left text-sm font-semibold text-zinc-600 uppercase">Akcje</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                    {kontakty.map((kontakt) => (
                        <tr key={kontakt.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-3 text-zinc-700 whitespace-noww-rap">{formatDate(kontakt.createdAt)}</td>
                            <td className="p-3 text-zinc-900 whitespace-nowrap">
                                <Link
                                    href={`/kontakty/${kontakt.id}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {kontakt.imie}
                                </Link>
                            </td>
                            <td className="p-3 text-zinc-700 whitespace-nowrap">{kontakt.nazwaFirmy}</td>
                            <td className="p-3 text-zinc-700 whitespace-nowrap">{kontakt.telefon}</td>

                            <td className="p-3 whitespace-nowrap">
                                <span className={getEtapClasses(kontakt.etap)}>
                                    {kontakt.etap || 'Brak etapu'}
                                </span>
                            </td>

                            {userProfile.role === 'ADMIN' && (
                                <td className="p-3 text-zinc-700 whitespace-nowrap">{kontakt.assignedTo?.email}</td>
                            )}
                            <td className="p-3 flex gap-2 items-center">
                                <Link
                                    href={`/kontakty/edycja/${kontakt.id}`}
                                    className="py-1 px-3 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Edytuj
                                </Link>
                                <DeleteContactButton contactId={kontakt.id} />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {kontakty.length === 0 && (
                <div className="text-center text-zinc-500 mt-10 py-10 bg-white rounded-lg shadow border border-zinc-200">
                    <p>Nie znaleziono kontaktów.</p>
                </div>
            )}
        </div>
    )
}