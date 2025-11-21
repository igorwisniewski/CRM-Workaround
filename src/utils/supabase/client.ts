// src/utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Również definiujemy zmienne na górze
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    )
}