'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// --- STYLE ---
const fieldsetStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    backgroundColor: '#fff', // Jasne tło dla kontrastu
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #aaa',
    borderRadius: '4px',
};

// Typ dla pojedynczego procesu w formularzu
type Proces = {
    id: number;
    nazwa: string;
    kwota: string;
}

export default function NowyKontaktPage() {
    const router = useRouter()
    const [error, setError] = useState('')

    // === Stany dla Pól Podstawowych ===
    const [imie, setImie] = useState('')
    const [etap, setEtap] = useState('Nowy')
    const [email, setEmail] = useState('')
    const [telefon, setTelefon] = useState('')
    const [zrodlo, setZrodlo] = useState('')
    const [branza, setBranza] = useState('')
    const [opis, setOpis] = useState('')

    // === Stany dla Zakładki "Firma" ===
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

    // === Stany dla Zakładki "Prywatne" ===
    const [stanCywilny, setStanCywilny] = useState('')
    const [rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa] = useState('')
    const [majatekPrywatny, setMajatekPrywatny] = useState('')
    const [czyBralKredyt10Lat, setCzyBralKredyt10Lat] = useState('')

    // === NOWE STANY: PROCESY I OPINIA ===
    const [procesy, setProcesy] = useState<Proces[]>([])
    const [wartosc, setWartosc] = useState(0)
    const [czyWystawilOpinie, setCzyWystawilOpinie] = useState(false)

    // --- Efekt do automatycznego sumowania wartości ---
    useEffect(() => {
        const suma = procesy.reduce((acc, curr) => acc + (parseFloat(curr.kwota) || 0), 0);
        setWartosc(suma);
    }, [procesy])

    // --- Funkcje obsługi procesów ---
    const dodajProces = () => {
        setProcesy([...procesy, { id: Date.now(), nazwa: 'Kredyt', kwota: '0' }])
    }

    const usunProces = (id: number) => {
        setProcesy(procesy.filter(p => p.id !== id))
    }

    const zmienProces = (id: number, pole: 'nazwa' | 'kwota', val: string) => {
        setProcesy(procesy.map(p => p.id === id ? { ...p, [pole]: val } : p))
    }

    // Funkcja pomocnicza dla pól Tak/Nie/Brak
    const renderSelectTakNie = (
        label: string,
        value: string,
        setter: (val: string) => void
    ) => (
        <label>
            <strong>{label}:</strong>
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

        if (!imie || !etap) {
            setError('Imię i Etap są wymagane.')
            return
        }

        const zobowiazania = {
            zus: zob_zus,
            us: zob_us,
            kredyty: zob_kredyty,
            faktury: zob_faktury,
            inne: zob_inne,
        }

        const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Podstawowe
                imie, etap, email, telefon, zrodlo, branza, opis,
                // Firma
                nazwaFirmy, rodzajDzialki, potrzebaKlienta, formaOpodatkowania,
                majatekFirmy, czyZatrudniaPracownikow, opoznieniaWPlatnosciach,
                planNaRozwoj, zobowiazania,
                // Prywatne
                stanCywilny, rozdzielnoscMajatkowa, majatekPrywatny, czyBralKredyt10Lat,

                // === NOWE POLA ===
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
            setError(data.error || 'Nie udało się dodać kontaktu.')
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
            <h1 className="text-2xl font-bold mb-4">Dodaj nowy kontakt</h1>
            <form onSubmit={handleSubmit}>

                {/* --- SEKCJA 1: PODSTAWOWE --- */}
                <fieldset style={fieldsetStyle}>
                    <legend className="text-lg font-semibold text-blue-600">Dane Podstawowe</legend>
                    <label>Imię: <input type="text" value={imie} onChange={(e) => setImie(e.target.value)} required
                                        style={inputStyle}/></label>
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
                    <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                         style={inputStyle}/></label>
                    <label>Telefon: <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                                           style={inputStyle}/></label>
                    <label>Źródło: <input type="text" value={zrodlo} onChange={(e) => setZrodlo(e.target.value)}
                                          style={inputStyle}/></label>
                    <label>Branża: <input type="text" value={branza} onChange={(e) => setBranza(e.target.value)}
                                          style={inputStyle}/></label>
                    <label>Opis: <textarea value={opis} onChange={(e) => setOpis(e.target.value)}
                                           style={inputStyle} rows={4}/></label>
                </fieldset>

                {/* --- NOWA SEKCJA: PROCESY --- */}
                <fieldset style={{...fieldsetStyle, borderColor: '#3b82f6', backgroundColor: '#f0f9ff'}}>
                    <legend className="text-lg font-semibold text-blue-600">Procesy i Wartość</legend>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                        <button
                            type="button"
                            onClick={dodajProces}
                            style={{ padding: '5px 10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            + Dodaj proces
                        </button>
                    </div>

                    {procesy.map((p) => (
                        <div key={p.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block' }}>Rodzaj</label>
                                <select
                                    value={p.nazwa}
                                    onChange={e => zmienProces(p.id, 'nazwa', e.target.value)}
                                    style={{...inputStyle, padding: '5px'}}
                                >
                                    <option value="Kredyt">Kredyt</option>
                                    <option value="Leasing">Leasing</option>
                                    <option value="Faktoring">Faktoring</option>
                                    <option value="Inne">Inne</option>
                                </select>
                            </div>
                            <div style={{ width: '150px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block' }}>Wartość (PLN)</label>
                                <input
                                    type="number"
                                    value={p.kwota}
                                    onChange={e => zmienProces(p.id, 'kwota', e.target.value)}
                                    style={{...inputStyle, padding: '5px'}}
                                    placeholder="0"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => usunProces(p.id)}
                                style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', padding: '5px 10px' }}
                            >
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
                    <legend className="text-lg font-semibold text-blue-600">Dane Firmy</legend>
                    <label>Nazwa firmy: <input type="text" value={nazwaFirmy}
                                               onChange={(e) => setNazwaFirmy(e.target.value)}
                                               style={inputStyle}/></label>
                    <label>Rodzaj działki: <input type="text" value={rodzajDzialki}
                                                  onChange={(e) => setRodzajDzialki(e.target.value)}
                                                  style={inputStyle}/></label>
                    <label>Forma opodatkowania: <input type="text" value={formaOpodatkowania}
                                                       onChange={(e) => setFormaOpodatkowania(e.target.value)}
                                                       style={inputStyle}/></label>
                    <label>Majątek firmy: <textarea value={majatekFirmy}
                                                    onChange={(e) => setMajatekFirmy(e.target.value)}
                                                    style={inputStyle}/></label>
                    <label>Potrzeba klienta: <textarea value={potrzebaKlienta} onChange={(e) => setPotrzebaKlienta(e.target.value)} style={inputStyle} /></label>
                    <label>Plan na rozwój: <textarea value={planNaRozwoj} onChange={(e) => setPlanNaRozwoj(e.target.value)} style={inputStyle} /></label>

                    {renderSelectTakNie("Czy zatrudnia pracowników", czyZatrudniaPracownikow, setCzyZatrudniaPracownikow)}
                    {renderSelectTakNie("Opóźnienia w płatnościach", opoznieniaWPlatnosciach, setOpoznieniaWPlatnosciach)}

                    <fieldset style={{...fieldsetStyle, margin: '10px 0 0 0', backgroundColor: '#fafafa' }}>
                        <legend style={{fontSize: '0.9rem', color: '#666'}}>Zobowiązania (wpisz notatkę lub kwotę)</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <label><span style={{fontSize: '12px'}}>ZUS:</span> <input type="text" value={zob_zus} onChange={(e) => setZob_zus(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize: '12px'}}>US:</span> <input type="text" value={zob_us} onChange={(e) => setZob_us(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize: '12px'}}>Kredyty:</span> <input type="text" value={zob_kredyty} onChange={(e) => setZob_kredyty(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize: '12px'}}>Faktury:</span> <input type="text" value={zob_faktury} onChange={(e) => setZob_faktury(e.target.value)} style={inputStyle} /></label>
                            <label><span style={{fontSize: '12px'}}>Inne:</span> <input type="text" value={zob_inne} onChange={(e) => setZob_inne(e.target.value)} style={inputStyle} /></label>
                        </div>
                    </fieldset>
                </fieldset>

                {/* --- SEKCJA 3: PRYWATNE I OPINIA --- */}
                <fieldset style={fieldsetStyle}>
                    <legend className="text-lg font-semibold text-blue-600">Dane Prywatne</legend>
                    <label>Stan cywilny: <input type="text" value={stanCywilny} onChange={(e) => setStanCywilny(e.target.value)} style={inputStyle} /></label>
                    <label>Majątek prywatny: <textarea value={majatekPrywatny} onChange={(e) => setMajatekPrywatny(e.target.value)} style={inputStyle} /></label>

                    {renderSelectTakNie("Rozdzielność majątkowa", rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa)}
                    {renderSelectTakNie("Brał kredyt w ciągu 10 lat", czyBralKredyt10Lat, setCzyBralKredyt10Lat)}

                    {/* CHECKBOX OPINII */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
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

                <button type="submit" style={{ padding: '12px', background: 'blue', color: 'white', width: '100%', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                    Dodaj kontakt
                </button>
            </form>
        </div>
    )
}