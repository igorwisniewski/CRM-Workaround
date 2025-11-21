// src/components/LogoutButton.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout} className="rounded-full bg-blue-800"
            style={{ padding: '5px 10px', color: 'white', border: 'none', cursor: 'pointer' }}
        >
            Wyloguj
        </button>
    )
}