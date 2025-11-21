'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
// ZMIANA: Importujemy typ User (lub jego część)
import { Contact, User } from '@prisma/client'

// --- Style (te same co w 'nowy') ---
const fieldsetStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
};
const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #aaa',
    borderRadius: '4px',
};
// --------------------

// ZMIANA: Definiujemy typ dla uproszczonego użytkownika
type SimpleUser = Pick<User, 'id' | 'email'>

export default function EdycjaKontaktuPage() {
    const router = useRouter()
    const params = useParams()
    const contactId = params.id as string // Pobieramy ID z URL

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    // === Stany dla Pól Podstawowych ===
    const [imie, setImie] = useState('')
    const [etap, setEtap] = useState('Nowy')

    // ⬇️ --- ZMIANA: Stany dla listy użytkowników i przypisanego ID --- ⬇️
    const [users, setUsers] = useState<SimpleUser[]>([])
    const [assignedToId, setAssignedToId] = useState<string>('') // ID przypisanego użytkownika
    // ⬆️ --- KONIEC ZMIANY --- ⬆️

    // ... (reszta stanów) ...
    const [email, setEmail] = useState('')
    const [telefon, setTelefon] = useState('')
    const [zrodlo, setZrodlo] = useState('')
    const [branza, setBranza] = useState('')
    const [opis, setOpis] = useState('')
    const [nazwaFirmy, setNazwaFirmy] = useState('')
    const [rodzajDzialki, setRodzajDzialki] = useState('')
    const [potrzebaKlienta, setPotrzebaKlienta] = useState('')
    const [formaOpodatkowania, setFormaOpodatkowania] = useState('')
    const [majatekFirmy, setMajatekFirmy] = useState('')
    const [czyZatrudniaPracownikow, setCzyZatrudniaPracownikow] = useState('')
    const [opoznieniaWPlatnosciach, setOpoznieniaWPlatnosciach] = useState('')
    const [planNaRozwoj, setPlanNaRozwoj] = useState('')
    const [zob_zus, setZob_zus] = useState('')
    const [zob_us, setZob_us] = useState('')
    const [zob_kredyty, setZob_kredyty] = useState('')
    const [zob_faktury, setZob_faktury] = useState('')
    const [zob_inne, setZob_inne] = useState('')
    const [stanCywilny, setStanCywilny] = useState('')
    const [rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa] = useState('')
    const [majatekPrywatny, setMajatekPrywatny] = useState('')
    const [czyBralKredyt10Lat, setCzyBralKredyt10Lat] = useState('')

    // ⬇️ --- ZMIANA: Nowy useEffect do pobierania użytkowników --- ⬇️
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users'); // Używamy nowego API
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                } else {
                    console.error("Nie udało się pobrać użytkowników");
                    setError(prev => prev + ' Błąd ładowania listy użytkowników.');
                }
            } catch (err) {
                console.error(err);
                setError(prev => prev + ' Błąd sieci przy ładowaniu użytkowników.');
            }
        };
        fetchUsers();
    }, []); // Uruchamiamy tylko raz, przy ładowaniu komponentu
    // ⬆️ --- KONIEC ZMIANY --- ⬆️


    // --- POBIERANIE DANYCH KONTAKTU ---
    useEffect(() => {
        if (!contactId) return;

        const fetchContact = async () => {
            setLoading(true)
            const res = await fetch(`/api/contacts/${contactId}`)
            if (!res.ok) {
                setError('Nie udało się pobrać kontaktu.')
                setLoading(false)
                return
            }

            // ZMIANA: Rozszerzamy typ o 'assignedToId'
            const data: Contact & { zobowiazania?: any; assignedToId?: string | null } = await res.json()

            // Ustawiamy stany na podstawie pobranych danych
            setImie(data.imie || '')
            setEtap(data.etap || 'Nowy')
            setEmail(data.email || '')
            setTelefon(data.telefon || '')
            setZrodlo(data.zrodlo || '')
            setBranza(data.branza || '')
            setOpis(data.opis || '')
            setNazwaFirmy(data.nazwaFirmy || '')
            setRodzajDzialki(data.rodzajDzialki || '')
            setPotrzebaKlienta(data.potrzebaKlienta || '')
            setFormaOpodatkowania(data.formaOpodatkowania || '')
            setMajatekFirmy(data.majatekFirmy || '')
            setCzyZatrudniaPracownikow(data.czyZatrudniaPracownikow || '')
            setOpoznieniaWPlatnosciach(data.opoznieniaWPlatnosciach || '')
            setPlanNaRozwoj(data.planNaRozwoj || '')
            setStanCywilny(data.stanCywilny || '')
            setRozdzielnoscMajatkowa(data.rozdzielnoscMajatkowa || '')
            setMajatekPrywatny(data.majatekPrywatny || '')
            setCzyBralKredyt10Lat(data.czyBralKredyt10Lat || '')

            // ⬇️ --- ZMIANA: Ustawiamy ID przypisanego użytkownika --- ⬇️
            setAssignedToId(data.assignedToId || '') // Używamy '' dla "Brak"
            // ⬆️ --- KONIEC ZMIANY --- ⬆️

            // Rozpakowanie JSON
            if (data.zobowiazania) {
                setZob_zus(data.zobowiazania.zus || '')
                setZob_us(data.zobowiazania.us || '')
                setZob_kredyty(data.zobowiazania.kredyty || '')
                setZob_faktury(data.zobowiazania.faktury || '')
                setZob_inne(data.zobowiazania.inne || '')
            }
            setLoading(false)
        }
        fetchContact()
    }, [contactId])

    // Funkcja pomocnicza dla pól Tak/Nie/Brak (bez zmian)
    const renderSelectTakNie = (
        label: string,
        value: string,
        setter: (val: string) => void
    ) => (
        <label>
            {label}:
            <select value={value} onChange={(e) => setter(e.target.value)} style={inputStyle}>
                <option value="">Brak danych</option>
                <option value="Tak">Tak</option>
                <option value="Nie">Nie</option>
            </select>
        </label>
    );

    // --- ZMIANA: WYSYŁANIE METODĄ PATCH ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!imie || !etap) {
            setError('Imię i Etap są wymagane.')
            return
        }
        const zobowiazania = {
            zus: zob_zus, us: zob_us, kredyty: zob_kredyty, faktury: zob_faktury, inne: zob_inne,
        }

        const res = await fetch(`/api/contacts/${contactId}`, { // ZMIANA: URL
            method: 'PATCH', // ZMIANA: Metoda
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imie, etap, email, telefon, zrodlo, branza, opis,
                nazwaFirmy, rodzajDzialki, potrzebaKlienta, formaOpodatkowania,
                majatekFirmy, czyZatrudniaPracownikow, opoznieniaWPlatnosciach,
                planNaRozwoj, zobowiazania,
                stanCywilny, rozdzielnoscMajatkowa, majatekPrywatny, czyBralKredyt10Lat,

                // ⬇️ --- ZMIANA: Dodajemy assignedToId do wysyłki --- ⬇️
                // Wysyłamy null jeśli jest pusty string, inaczej wysyłamy ID
                assignedToId: assignedToId ? assignedToId : null,
                // ⬆️ --- KONIEC ZMIANY --- ⬆️
            }),
        })

        if (res.ok) {
            router.push('/kontakty') // Wróć do listy
            router.refresh()
        } else {
            const data = await res.json()
            setError(data.error || 'Nie udało się zaktualizować kontaktu.')
        }
    }

    if (loading) return <p style={{ textAlign: 'center' }}>Ładowanie danych...</p>

    // --- Renderowanie formularza (kod HTML jest taki sam jak w 'nowy') ---
    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
            <h1>Edytuj kontakt: {imie}</h1> {/* ZMIANA: Tytuł */}
            <form onSubmit={handleSubmit}>

                {/* --- SEKCJA 1: PODSTAWOWE --- */}
                <fieldset style={fieldsetStyle}>
                    <legend>Dane Podstawowe</legend>
                    <label>Imię: <input type="text" value={imie} onChange={(e) => setImie(e.target.value)} required style={inputStyle} /></label>
                    <label>Etap:
                        <select value={etap} onChange={(e) => setEtap(e.target.value)} style={inputStyle}>
                            <option value="Lead">Lead</option>
                            <option value="Po pierwszym kontakcie">Po pierwszym kontakcie</option>
                            <option value="Kompletuje dokumenty">Kompletuje dokumenty</option>
                            <option value="Braki w dokumentach">Braki w dokumentach</option>
                            <option value="Umówiony na spotkanie">Umówiony na spotkanie</option>
                            <option value="Po pierwszym spotkaniu">Po pierwszym spotkaniu</option>
                            <option value="Przygotowany do procesu">Przygotowany do procesu</option>
                            <option value="Siadło">Siadło</option>
                            <option value="Nie Siadło">Nie Siadło</option>
                        </select>
                    </label>

                    {/* ⬇️ --- ZMIANA: Nowy dropdown użytkownika --- ⬇️ */}
                    <label>
                        Przypisany do:
                        <select
                            value={assignedToId}
                            onChange={(e) => setAssignedToId(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">Nie przypisano</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                    </label>
                    {/* ⬆️ --- KONIEC ZMIANY --- ⬆️ */}

                    <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></label>
                    <label>Telefon: <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)} style={inputStyle} /></label>
                    <label>Źródło: <input type="text" value={zrodlo} onChange={(e) => setZrodlo(e.target.value)} style={inputStyle} /></label>
                    <label>Branża: <input type="text" value={branza} onChange={(e) => setBranza(e.target.value)} style={inputStyle} /></label>
                    <label>Opis: <textarea value={opis} onChange={(e) => setOpis(e.target.value)} style={inputStyle} rows={10}/></label>
                </fieldset>

                {/* --- SEKCJA 2: FIRMA --- */}
                <fieldset style={fieldsetStyle}>
                    <legend>Dane Firmy</legend>
                    <label>Nazwa firmy: <input type="text" value={nazwaFirmy} onChange={(e) => setNazwaFirmy(e.target.value)} style={inputStyle} /></label>
                    <label>Rodzaj działki: <input type="text" value={rodzajDzialki} onChange={(e) => setRodzajDzialki(e.target.value)} style={inputStyle} /></label>
                    <label>Forma opodatkowania: <input type="text" value={formaOpodatkowania} onChange={(e) => setFormaOpodatkowania(e.target.value)} style={inputStyle} /></label>
                    <label>Majątek firmy: <textarea value={majatekFirmy} onChange={(e) => setMajatekFirmy(e.target.value)} style={inputStyle} /></label>
                    <label>Potrzeba klienta: <textarea value={potrzebaKlienta} onChange={(e) => setPotrzebaKlienta(e.target.value)} style={inputStyle} /></label>
                    <label>Plan na rozwój: <textarea value={planNaRozwoj} onChange={(e) => setPlanNaRozwoj(e.target.value)} style={inputStyle} /></label>
                    {renderSelectTakNie("Czy zatrudnia pracowników", czyZatrudniaPracownikow, setCzyZatrudniaPracownikow)}
                    {renderSelectTakNie("Opóźnienia w płatnościach", opoznieniaWPlatnosciach, setOpoznieniaWPlatnosciach)}

                    <fieldset style={{...fieldsetStyle, margin: '10px 0 0 0' }}>
                        <legend>Zobowiązania</legend>
                        <label>ZUS: <input type="text" value={zob_zus} onChange={(e) => setZob_zus(e.target.value)} style={inputStyle} /></label>
                        <label>US: <input type="text" value={zob_us} onChange={(e) => setZob_us(e.target.value)} style={inputStyle} /></label>
                        <label>Kredyty: <input type="text" value={zob_kredyty} onChange={(e) => setZob_kredyty(e.target.value)} style={inputStyle} /></label>
                        <label>Faktury: <input type="text" value={zob_faktury} onChange={(e) => setZob_faktury(e.target.value)} style={inputStyle} /></label>
                        <label>Inne: <input type="text" value={zob_inne} onChange={(e) => setZob_inne(e.target.value)} style={inputStyle} /></label>
                    </fieldset>
                </fieldset>

                {/* --- SEKCJA 3: PRYWATNE --- */}
                <fieldset style={fieldsetStyle}>
                    <legend>Dane Prywatne</legend>
                    <label>Stan cywilny: <input type="text" value={stanCywilny} onChange={(e) => setStanCywilny(e.target.value)} style={inputStyle} /></label>
                    <label>Majątek prywatny: <textarea value={majatekPrywatny} onChange={(e) => setMajatekPrywatny(e.target.value)} style={inputStyle} /></label>
                    {renderSelectTakNie("Rozdzielność majątkowa", rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa)}
                    {renderSelectTakNie("Brał kredyt w ciągu 10 lat", czyBralKredyt10Lat, setCzyBralKredyt10Lat)}
                </fieldset>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white', width: '100%', fontSize: '1.2rem' }}>
                    Aktualizuj Kontakt
                </button>
            </form>
        </div>
    )
}