'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Contact, User } from '@prisma/client'

// --- STYLE (Klasyczne / Jasne) ---
const fieldsetStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    backgroundColor: '#fff', // Jasne tło
    color: '#000'            // Ciemny tekst
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #aaa',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#000'
};

const labelStyle = {
    fontWeight: 'bold' as const,
    marginBottom: '4px',
    display: 'block'
};
// --------------------

// Typ dla procesu
type Proces = {
    id: number;
    nazwa: string;
    kwota: string;
}

// Typ dla uproszczonego użytkownika
type SimpleUser = Pick<User, 'id' | 'email'>

export default function EdycjaKontaktuPage() {
    const router = useRouter()
    const params = useParams()
    const contactId = params.id as string

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    // === Stany Podstawowe ===
    const [imie, setImie] = useState('')
    const [etap, setEtap] = useState('Nowy')

    // Użytkownicy
    const [users, setUsers] = useState<SimpleUser[]>([])
    const [assignedToId, setAssignedToId] = useState<string>('')

    // === NOWE STANY: PROCESY I OPINIA ===
    const [procesy, setProcesy] = useState<Proces[]>([])
    const [wartosc, setWartosc] = useState(0) // Suma
    const [czyWystawilOpinie, setCzyWystawilOpinie] = useState(false)

    // Reszta pól
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

    // 1. Pobieranie użytkowników
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) { console.error(err); }
        };
        fetchUsers();
    }, []);

    // 2. Pobieranie kontaktu
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

            const data = await res.json()

            // Mapowanie danych
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
            setAssignedToId(data.assignedToId || '')

            // NOWE POLA
            setCzyWystawilOpinie(data.czyWystawilOpinie || false)

            // Procesy (JSON)
            if (data.procesy) {
                try {
                    const parsed = typeof data.procesy === 'string'
                        ? JSON.parse(data.procesy)
                        : data.procesy;
                    if (Array.isArray(parsed)) setProcesy(parsed);
                } catch (e) { console.error(e) }
            }

            // Zobowiązania
            if (data.zobowiazania) {
                const zob = data.zobowiazania as any;
                setZob_zus(zob.zus || '')
                setZob_us(zob.us || '')
                setZob_kredyty(zob.kredyty || '')
                setZob_faktury(zob.faktury || '')
                setZob_inne(zob.inne || '')
            }
            setLoading(false)
        }
        fetchContact()
    }, [contactId])

    // 3. Auto-sumowanie wartości
    useEffect(() => {
        const suma = procesy.reduce((acc, curr) => acc + (parseFloat(curr.kwota) || 0), 0);
        setWartosc(suma);
    }, [procesy])

    // Funkcje pomocnicze
    const dodajProces = () => setProcesy([...procesy, { id: Date.now(), nazwa: 'Kredyt', kwota: '0' }])
    const usunProces = (id: number) => setProcesy(procesy.filter(p => p.id !== id))
    const zmienProces = (id: number, pole: 'nazwa' | 'kwota', val: string) => {
        setProcesy(procesy.map(p => p.id === id ? { ...p, [pole]: val } : p))
    }

    const renderSelectTakNie = (label: string, value: string, setter: (val: string) => void) => (
        <label>
            <span style={labelStyle}>{label}:</span>
            <select value={value} onChange={(e) => setter(e.target.value)} style={inputStyle}>
                <option value="">Brak danych</option>
                <option value="Tak">Tak</option>
                <option value="Nie">Nie</option>
            </select>
        </label>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const zobowiazania = {
            zus: zob_zus, us: zob_us, kredyty: zob_kredyty, faktury: zob_faktury, inne: zob_inne,
        }

        const res = await fetch(`/api/contacts/${contactId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imie, etap, email, telefon, zrodlo, branza, opis,
                nazwaFirmy, rodzajDzialki, potrzebaKlienta, formaOpodatkowania,
                majatekFirmy, czyZatrudniaPracownikow, opoznieniaWPlatnosciach,
                planNaRozwoj, zobowiazania,
                stanCywilny, rozdzielnoscMajatkowa, majatekPrywatny, czyBralKredyt10Lat,
                assignedToId: assignedToId ? assignedToId : null,

                // Nowe pola
                procesy,
                wartosc,
                czyWystawilOpinie
            }),
        })

        if (res.ok) {
            router.push('/kontakty')
            router.refresh()
        } else {
            const data = await res.json()
            setError(data.error || 'Błąd zapisu')
        }
    }

    if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Ładowanie danych...</p>

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
            <h1>Edytuj kontakt: {imie}</h1>

            <form onSubmit={handleSubmit}>

                {/* --- SEKCJA 1: PODSTAWOWE --- */}
                <fieldset style={fieldsetStyle}>
                    <legend style={{ fontWeight: 'bold', color: '#2563eb' }}>Dane Podstawowe</legend>

                    <label>
                        <span style={labelStyle}>Imię i Nazwisko:</span>
                        <input type="text" value={imie} onChange={(e) => setImie(e.target.value)} required style={inputStyle} />
                    </label>

                    <label>
                        <span style={labelStyle}>Etap:</span>
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

                    <label>
                        <span style={labelStyle}>Przypisany do:</span>
                        <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} style={inputStyle}>
                            <option value="">Nie przypisano</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                    </label>

                    <label><span style={labelStyle}>Email:</span> <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></label>
                    <label><span style={labelStyle}>Telefon:</span> <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)} style={inputStyle} /></label>
                    <label><span style={labelStyle}>Źródło:</span> <input type="text" value={zrodlo} onChange={(e) => setZrodlo(e.target.value)} style={inputStyle} /></label>
                    <label><span style={labelStyle}>Branża:</span> <input type="text" value={branza} onChange={(e) => setBranza(e.target.value)} style={inputStyle} /></label>
                    <label><span style={labelStyle}>Opis:</span> <textarea value={opis} onChange={(e) => setOpis(e.target.value)} style={inputStyle} rows={5}/></label>
                </fieldset>

                {/* --- NOWA SEKCJA: PROCESY --- */}
                <fieldset style={{...fieldsetStyle, backgroundColor: '#f9fafb'}}>
                    <legend style={{ fontWeight: 'bold', color: '#2563eb' }}>Procesy i Wartość</legend>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                        <button type="button" onClick={dodajProces} style={{ padding: '5px 10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            + Dodaj proces
                        </button>
                    </div>

                    {procesy.map((p) => (
                        <div key={p.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', display: 'block', color: '#666' }}>Rodzaj</label>
                                <select value={p.nazwa} onChange={e => zmienProces(p.id, 'nazwa', e.target.value)}
                                        style={{...inputStyle, padding: '5px'}}>
                                    <option value="Restrukturyzacja">Restrukturyzacja</option>
                                    <option value="Upadłość Konsumencka">Upadłość Konsumencka</option>
                                    <option value="Upadłość Gospodarcza">Upadłość Gospodarcza</option>
                                    <option value="Fundacja">Fundacja</option>
                                    <option value="Inne">Inne</option>
                                </select>
                            </div>
                            <div style={{width: '150px' }}>
                                <label style={{ fontSize: '12px', display: 'block', color: '#666' }}>Wartość (PLN)</label>
                                <input type="number" value={p.kwota} onChange={e => zmienProces(p.id, 'kwota', e.target.value)} style={{...inputStyle, padding: '5px'}} placeholder="0" />
                            </div>
                            <button type="button" onClick={() => usunProces(p.id)} style={{ color: 'red', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', padding: '5px' }}>
                                ✕
                            </button>
                        </div>
                    ))}

                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px', textAlign: 'right', border: '1px solid #ddd' }}>
                        <span style={{ marginRight: '10px', color: '#333' }}>Łączna wartość:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                            {wartosc.toLocaleString('pl-PL')} PLN
                        </span>
                    </div>
                </fieldset>

                {/* --- SEKCJA 2: FIRMA --- */}
                <fieldset style={fieldsetStyle}>
                    <legend style={{ fontWeight: 'bold', color: '#2563eb' }}>Dane Firmy</legend>
                    <label><span style={labelStyle}>Nazwa firmy:</span> <input type="text" value={nazwaFirmy} onChange={(e) => setNazwaFirmy(e.target.value)} style={inputStyle} /></label>
                    <label><span style={labelStyle}>Plan na rozwój:</span> <textarea value={planNaRozwoj} onChange={(e) => setPlanNaRozwoj(e.target.value)} style={inputStyle} /></label>
                    {renderSelectTakNie("Czy zatrudnia pracowników", czyZatrudniaPracownikow, setCzyZatrudniaPracownikow)}
                    {renderSelectTakNie("Opóźnienia w płatnościach", opoznieniaWPlatnosciach, setOpoznieniaWPlatnosciach)}

                    {/* Zobowiązania stare */}
                    <div style={{ marginTop: '15px', padding: '10px', borderTop: '1px solid #ddd' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>Zobowiązania (Stary format):</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <label><span style={{fontSize:'12px'}}>ZUS:</span> <input type="text" value={zob_zus} onChange={(e) => setZob_zus(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize:'12px'}}>US:</span> <input type="text" value={zob_us} onChange={(e) => setZob_us(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize:'12px'}}>Kredyty:</span> <input type="text" value={zob_kredyty} onChange={(e) => setZob_kredyty(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize:'12px'}}>Faktury:</span> <input type="text" value={zob_faktury} onChange={(e) => setZob_faktury(e.target.value)} style={inputStyle} /></label>
                        </div>
                    </div>
                </fieldset>

                {/* --- SEKCJA 3: PRYWATNE I INNE --- */}
                <fieldset style={fieldsetStyle}>
                    <legend style={{ fontWeight: 'bold', color: '#2563eb' }}>Dane Prywatne</legend>
                    <label><span style={labelStyle}>Stan cywilny:</span> <input type="text" value={stanCywilny} onChange={(e) => setStanCywilny(e.target.value)} style={inputStyle} /></label>
                    <label><span style={labelStyle}>Majątek prywatny:</span> <textarea value={majatekPrywatny} onChange={(e) => setMajatekPrywatny(e.target.value)} style={inputStyle} /></label>

                    {renderSelectTakNie("Rozdzielność majątkowa", rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa)}
                    {renderSelectTakNie("Brał kredyt w ciągu 10 lat", czyBralKredyt10Lat, setCzyBralKredyt10Lat)}

                    {/* CHECKBOX OPINII */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                        <input
                            type="checkbox"
                            id="opinia"
                            checked={czyWystawilOpinie}
                            onChange={e => setCzyWystawilOpinie(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="opinia" style={{ fontWeight: 'bold', color: '#166534', cursor: 'pointer' }}>
                            Klient wystawił opinię (Google/Social Media)
                        </label>
                    </div>
                </fieldset>

                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                <button type="submit" style={{ padding: '12px', background: 'blue', color: 'white', width: '100%', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                    Zapisz Zmiany
                </button>
            </form>
        </div>
    )
}