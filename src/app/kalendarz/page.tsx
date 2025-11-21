// src/app/kalendarz/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction' // dla dateClick
import plLocale from '@fullcalendar/core/locales/pl'
// Typ dla eventów
interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    backgroundColor: string;
    borderColor: string;
}

export default function KalendarzPage() {
    const router = useRouter()
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)

    // Pobieramy zadania z naszego API
    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch('/api/tasks')
                if (!res.ok) throw new Error('Błąd pobierania zadań')
                const data = await res.json()
                setEvents(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    // To jest funkcja z Twojej prośby:
    // Co się stanie po kliknięciu pustego pola
    const handleDateClick = (arg: { date: Date; allDay: boolean }) => {
        // Pobieramy datę i godzinę w formacie ISO
        const isoDate = arg.date.toISOString()

        // Przekierowujemy do nowego formularza, podając termin w URL
        router.push(`/zadania/nowy?termin=${isoDate}`)
    }

    if (loading) {
        return <p style={{ textAlign: 'center', padding: '50px' }}>Ładowanie kalendarza...</p>
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek" // Widok tygodniowy
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events} // Nasze zadania z API
                locales={[plLocale]} // <-- DODAJ TEN PROP
                locale="pl"
                firstDay={1} // Tydzień zaczyna się od poniedziałku
                selectable={true}
                dateClick={handleDateClick} // Nasza funkcja do tworzenia
                height="calc(100vh - 150px)"
                // eventClick={(info) => {
                //   // W przyszłości: kliknięcie na zadanie
                //   alert('Zadanie: ' + info.event.title)
                // }}
            />
        </div>
    )
}