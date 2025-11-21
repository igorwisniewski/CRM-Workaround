'use client' // To musi być komponent kliencki

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client' // Klient przeglądarki!
import { useRouter } from 'next/navigation'

export default function LoginHome() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const supabase = createClient()
    const [error, setError] = useState('')

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Upewnij się, że ta ścieżka zgadza się z tym, co stworzyliśmy
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError('Błąd rejestracji: ' + error.message)
        } else {
            alert('Sprawdź e-mail, aby potwierdzić rejestrację!')
        }
    }
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            setError('Błąd logowania: ' + error.message)
        } else {
            // ⬇️ POPRAWKA ⬇️
            // Zamiast router.push, użyj twardego przeładowania.
            // To zmusi middleware do ponownego uruchomienia i zobaczenia nowej sesji.
            window.location.href = '/kontakty';
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1 style={{ textAlign: 'center' }}>Mój CRM</h1>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSignIn}>
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                    />
                </label>
                <label>
                    Hasło:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                    />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button type="submit" style={{ padding: '10px 20px' }}>
                        Zaloguj
                    </button>
                    <button onClick={handleSignUp} type="button" style={{ padding: '10px 20px', background: '88ffff', border: '1px solid #aaa' }}>
                        Zarejestruj
                    </button>
                </div>
            </form>
        </div>
    )
}