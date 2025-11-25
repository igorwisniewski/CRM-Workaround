'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from "next-auth/react"

export default function LoginHome() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true) // Tryb: logowanie czy rejestracja
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                // --- LOGOWANIE ---
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                })

                if (result?.error) {
                    setError("Nieprawidłowy email lub hasło.")
                } else {
                    router.push("/kontakty")
                    router.refresh()
                }
            }
        } catch (err) {
            setError("Wystąpił nieoczekiwany błąd.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1 style={{ textAlign: 'center' }}>Mój CRM</h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                <button
                    onClick={() => setIsLogin(true)}
                    style={{ fontWeight: isLogin ? 'bold' : 'normal', borderBottom: isLogin ? '2px solid blue' : 'none' }}
                >
                    Logowanie
                </button>

            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
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
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', marginTop: '16px', background: 'blue', color: 'white', cursor: 'pointer' }}
                >
                    {loading ? 'Czekaj...' : (isLogin ? 'Zaloguj' : ' ')}
                </button>
            </form>
        </div>
    )
}