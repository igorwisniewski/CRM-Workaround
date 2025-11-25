// src/components/LogoutButton.tsx
'use client'

import { signOut } from "next-auth/react"

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-full bg-blue-800"
            style={{ padding: '5px 10px', color: 'white', border: 'none', cursor: 'pointer' }}
        >
            Wyloguj
        </button>
    )
}