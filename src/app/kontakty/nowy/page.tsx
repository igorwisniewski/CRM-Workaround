// src/app/kontakty/nowy/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// --- NOWE STYLE ---
const fieldsetStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '12px', // Trochę więcej odstępu
};

// Styl dla wszystkich inputów, selectów i textarea
const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #aaa', // DODANY BORDER
    borderRadius: '4px',
};
// --------------------


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
    // ZMIANA: z false na '' (string)
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
    // ZMIANA: z false na '' (string)
    const [rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa] = useState('')
    const [majatekPrywatny, setMajatekPrywatny] = useState('')
    const [czyBralKredyt10Lat, setCzyBralKredyt10Lat] = useState('')

    // Funkcja pomocnicza dla pól Tak/Nie/Brak
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
            <h1>Dodaj nowy kontakt</h1>
            <form onSubmit={handleSubmit}>

                {/* --- SEKCJA 1: PODSTAWOWE --- */}
                <fieldset style={fieldsetStyle}>
                    <legend>Dane Podstawowe</legend>
                    <label>Imię: <input type="text" value={imie} onChange={(e) => setImie(e.target.value)} required
                                        style={inputStyle}/></label>
                    <label>Etap:
                        <select value={etap} onChange={(e) => setEtap(e.target.value)} style={inputStyle}>
                            {/* NOWE OPCJE: */}
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
                                           style={inputStyle}/></label>
                </fieldset>

                {/* --- SEKCJA 2: FIRMA --- */}
                <fieldset style={fieldsetStyle}>
                    <legend>Dane Firmy</legend>
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

                    {/* ZMIANA: Checkbox na Select */}
                    {renderSelectTakNie("Czy zatrudnia pracowników", czyZatrudniaPracownikow, setCzyZatrudniaPracownikow)}
                    {renderSelectTakNie("Opóźnienia w płatnościach", opoznieniaWPlatnosciach, setOpoznieniaWPlatnosciach)}

                    <fieldset style={{...fieldsetStyle, margin: '10px 0 0 0' }}>
                        <legend>Zobowiązania (wpisz notatkę lub kwotę)</legend>
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

                    {/* ZMIANA: Checkbox na Select */}
                    {renderSelectTakNie("Rozdzielność majątkowa", rozdzielnoscMajatkowa, setRozdzielnoscMajatkowa)}
                    {renderSelectTakNie("Brał kredyt w ciągu 10 lat", czyBralKredyt10Lat, setCzyBralKredyt10Lat)}
                </fieldset>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white', width: '100%', fontSize: '1.2rem' }}>Zapisz kontakt</button>
            </form>
        </div>
    )
}