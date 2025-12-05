'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AddTaskForm from '@/components/AddTaskForm'
import { Contact, Task, Prisma } from '@prisma/client'
import DisplayField from '@/components/DisplayField'
import DisplayZobowiazania from '@/components/DisplayZobowiazania'
import DeleteTaskButton from '@/components/DeleteTaskButton';

// Rozszerzony typ dla zadania
type TaskWithUser = Task & {
    assignedTo: {
        email: string | null;
        kolor: string | null;
    }
}

// Rozszerzony typ dla kontaktu
type ContactWithDetails = Contact & {
    zobowiazania: Prisma.JsonValue | null;
    procesy: Prisma.JsonValue | null; // Dodajemy typowanie dla procesów
}

// Typ pomocniczy dla pojedynczego procesu
type ProcesItem = {
    id: number;
    nazwa: string;
    kwota: string;
}

function formatTermin(date: Date) {
    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(date));
}

// Formatowanie waluty
function formatPLN(amount: number) {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
}

const sectionStyle = "bg-white border border-zinc-200 rounded-lg p-5 shadow-sm mb-6";

export default function ContactDetailsPage() {
    const params = useParams()
    const contactId = params.id as string

    const [contact, setContact] = useState<ContactWithDetails | null>(null)
    const [tasks, setTasks] = useState<TaskWithUser[]>([])
    const [users, setUsers] = useState<{ id: string, email: string | null }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Stan dla procesów po sparsowaniu
    const [parsedProcesy, setParsedProcesy] = useState<ProcesItem[]>([])

    useEffect(() => {
        if (!contactId) return;

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/contact-details/${contactId}`)

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Nie udało się pobrać danych')
                }

                const data = await res.json()
                setContact(data.contact)
                setTasks(data.tasks)
                setUsers(data.users)

                // Parsowanie procesów do wyświetlenia
                if (data.contact.procesy) {
                    try {
                        const raw = data.contact.procesy;
                        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        if (Array.isArray(parsed)) {
                            setParsedProcesy(parsed);
                        }
                    } catch (e) { console.error("Błąd parsowania procesów", e) }
                }

            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [contactId])

    if (loading) return <p className="text-center p-20">Ładowanie danych...</p>
    if (error) return <p className="text-center p-20 text-red-600">Błąd: {error}</p>
    if (!contact) return <p className="text-center p-20">Nie znaleziono kontaktu.</p>

    return (
        <div className="max-w-7xl mx-auto p-5 grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* === KOLUMNA LEWA (Szczegóły) === */}
            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-zinc-800">{contact.imie}</h1>
                    <Link
                        href={`/kontakty/edycja/${contact.id}`}
                        className="py-2 px-4 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors shadow-sm"
                    >
                        Edytuj Kontakt
                    </Link>
                </div>

                {/* --- SEKCJA: Dane Podstawowe --- */}
                <div className={sectionStyle}>
                    <h2 className="text-xl font-semibold text-zinc-950 mb-3">Dane Podstawowe</h2>
                    <DisplayField label="Etap" value={contact.etap} />
                    <DisplayField label="Email" value={contact.email} />
                    <DisplayField label="Telefon" value={contact.telefon} />
                    <DisplayField label="Branża" value={contact.branza} />
                    <DisplayField label="Źródło" value={contact.zrodlo} />
                    <DisplayField label="Opis" value={contact.opis} />
                </div>

                {/* --- NOWA SEKCJA: PROCESY I WARTOŚĆ --- */}
                <div className={sectionStyle} style={{ borderLeft: '4px solid #2563eb' }}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold text-zinc-950">Procesy i Wartość</h2>
                        <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Suma: {formatPLN(contact.wartosc || 0)}
                        </span>
                    </div>

                    {parsedProcesy.length > 0 ? (
                        <div className="overflow-hidden rounded-md border border-zinc-200">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-zinc-50">
                                <tr>
                                    <th className="py-2 px-4 text-left font-medium text-zinc-500">Rodzaj</th>
                                    <th className="py-2 px-4 text-right font-medium text-zinc-500">Kwota</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                {parsedProcesy.map((p) => (
                                    <tr key={p.id}>
                                        <td className="py-2 px-4 text-zinc-800">{p.nazwa}</td>
                                        <td className="py-2 px-4 text-right font-mono text-zinc-700">
                                            {parseFloat(p.kwota).toLocaleString('pl-PL')} PLN
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-zinc-400 italic text-sm">Brak aktywnych procesów.</p>
                    )}
                </div>

                {/* --- SEKCJA: Dane Firmy --- */}
                <div className={sectionStyle}>
                    <h2 className="text-xl font-semibold text-zinc-950 mb-3">Dane Firmy</h2>
                    <DisplayField label="Nazwa firmy" value={contact.nazwaFirmy} />
                    <DisplayField label="Rodzaj działki" value={contact.rodzajDzialki} />
                    <DisplayField label="Forma opodatkowania" value={contact.formaOpodatkowania} />
                    <DisplayField label="Majątek firmy" value={contact.majatekFirmy} />
                    <DisplayField label="Potrzeba klienta" value={contact.potrzebaKlienta} />
                    <DisplayField label="Plan na rozwój" value={contact.planNaRozwoj} />
                    <DisplayField label="Zatrudnia pracowników" value={contact.czyZatrudniaPracownikow} />
                    <DisplayField label="Opóźnienia w płatnościach" value={contact.opoznieniaWPlatnosciach} />
                    <DisplayZobowiazania data={contact.zobowiazania} />
                </div>

                {/* --- SEKCJA: Dane Prywatne --- */}
                <div className={sectionStyle}>
                    <h2 className="text-xl font-semibold text-zinc-950 mb-3">Dane Prywatne</h2>
                    <DisplayField label="Stan cywilny" value={contact.stanCywilny} />
                    <DisplayField label="Majątek prywatny" value={contact.majatekPrywatny} />
                    <DisplayField label="Rozdzielność majątkowa" value={contact.rozdzielnoscMajatkowa} />
                    <DisplayField label="Kredyt w ciągu 10 lat" value={contact.czyBralKredyt10Lat} />

                    {/* NOWE POLE: OPINIA */}
                    <div className="flex py-2 border-b border-zinc-100 last:border-0">
                        <strong className="w-48 flex-shrink-0 text-zinc-900 font-medium">Wystawił opinię:</strong>
                        <span className={`flex-1 font-medium ${contact.czyWystawilOpinie ? 'text-green-600' : 'text-zinc-900'}`}>
                            {contact.czyWystawilOpinie ? '✅ TAK' : 'Nie'}
                        </span>
                    </div>
                </div>

                <hr className="my-6" />

                {/* --- SEKCJA: Zadania --- */}
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-4">
                        Zadania ({tasks.length})
                    </h2>
                    <div className="flex flex-col gap-3">
                        {tasks.length === 0 && (
                            <p className="text-zinc-500">Brak zadań dla tego kontaktu.</p>
                        )}
                        {tasks.map(task => (
                            <div key={task.id} className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <strong className="text-lg font-semibold text-zinc-800">{task.nazwa}</strong>
                                    <span className="font-bold text-sm text-zinc-950">
                                        {formatTermin(task.termin)}
                                    </span>
                                </div>
                                <p className="text-zinc-950 my-2">{task.opis}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span
                                        className="py-1 px-3 rounded-full text-xs font-medium text-white"
                                        style={{ backgroundColor: task.assignedTo.kolor || '#808080' }}
                                    >
                                        {task.assignedTo.email}
                                    </span>
                                    <DeleteTaskButton taskId={task.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === KOLUMNA PRAWA (Formularz dodawania zadań) === */}
            <div className="pt-0 md:pt-16">
                <AddTaskForm contactId={contact.id} users={users} />
            </div>

        </div>
    )
}