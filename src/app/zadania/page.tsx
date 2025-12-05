// Konieczne dla dynamicznego wyszukiwania
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth' // Importujemy NextAuth
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import ZadaniaFiltry from '@/components/ZadaniaFiltry'

// Definicja propsów dla strony
interface ZadaniaPageProps {
    searchParams: Promise<{
        userId?: string;
    }>
}

// Funkcja pomocnicza do formatowania terminu
function formatTermin(date: Date) {
    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(date));
}

export default async function ZadaniaPage({ searchParams }: ZadaniaPageProps) {
    // 1. Uwierzytelnianie (NextAuth)
    const session = await auth()

    if (!session?.user?.email) {
        redirect('/login')
    }

    // Pobieramy profil zalogowanego użytkownika z bazy (dla roli i ID)
    const userProfile = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!userProfile) {
        redirect('/login')
    }

    // 2. Pobieramy listę wszystkich użytkowników (dla filtra)
    const allUsers = await prisma.user.findMany({
        select: { id: true, email: true }
    })

    // 3. Logika filtrowania i autoryzacji
    const params = await searchParams;
    const selectedUserId = params.userId; // User wybrany w filtrze

    let targetUserId: string;

    // Sprawdzamy, czyje zadania mamy pokazać
    if (selectedUserId) {
        // Jeśli wybrano kogoś w filtrze
        if (userProfile.role === 'ADMIN') {
            // Admin może zobaczyć każdego
            targetUserId = selectedUserId;
        } else {
            // Zwykły user próbuje kogoś podglądać - blokujemy i pokazujemy jego
            targetUserId = userProfile.id;
        }
    } else {
        // Domyślnie (bez filtra) - pokaż zadania zalogowanego usera
        targetUserId = userProfile.id;
    }

    // 4. Budowanie zapytania do bazy
    const where: Prisma.TaskWhereInput = {
        assignedToId: targetUserId,
        wykonane: false, // Pokaż tylko NIEWYKONANE zadania
    }

    // 5. Pobranie zadań
    const tasks = await prisma.task.findMany({
        where: where,
        include: {
            contact: { // Potrzebujemy nazwy kontaktu
                select: { id: true, imie: true }
            },
            assignedTo: { // Potrzebujemy koloru
                select: { email: true, kolor: true }
            }
        },
        orderBy: {
            termin: 'asc' // Najbliższe terminy na górze
        }
    })

    // Znajdź wybranego użytkownika, aby wyświetlić jego email w tytule
    const selectedUserData = allUsers.find(u => u.id === targetUserId);

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
            <h1>
                Zadania dla: {selectedUserData?.email || '...'}
            </h1>

            {/* Pokazujemy filtr tylko Adminom */}
            {userProfile.role === 'ADMIN' && (
                <ZadaniaFiltry users={allUsers} currentUserId={userProfile.id} />
            )}

            {/* Lista zadań */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                {tasks.map(task => (
                    <div key={task.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '1.2rem' }}>{task.nazwa}</strong>
                            <span style={{ fontWeight: 'bold', color: 'red' }}>
                                Termin: {formatTermin(task.termin)}
                            </span>
                        </div>

                        <p style={{ margin: '10px 0' }}>{task.opis}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link href={`/kontakty/${task.contact.id}`} style={{ color: 'blue', textDecoration: 'underline' }}>
                                Dotyczy: {task.contact.imie}
                            </Link>
                            <span style={{
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                color: 'white',
                                background: task.assignedTo.kolor || '#808080'
                            }}>
                                {task.assignedTo.email}
                            </span>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '20px' }}>
                        Brak aktywnych zadań dla tego użytkownika.
                    </p>
                )}
            </div>
        </div>
    )
}