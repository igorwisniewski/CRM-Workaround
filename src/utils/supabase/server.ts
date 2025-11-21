// src/utils/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
    // Ta zmienna to teraz Promise<ReadonlyRequestCookies>
    const cookieStore = cookies();

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                // Funkcja 'get' musi być async, aby użyć await
                get: async (name: string) => {
                    const store = await cookieStore; // Czekamy na obiekt ciasteczek
                    return store.get(name)?.value;
                },
                // Funkcja 'set' musi być async
                set: async (name: string, value: string, options: CookieOptions) => {
                    try {
                        const store = await cookieStore; // Czekamy na obiekt ciasteczek
                        store.set({ name, value, ...options });
                    } catch (error) {
                        // Obsługa błędu (np. gdy cookie jest ustawiane po wysłaniu odpowiedzi)
                    }
                },
                // Funkcja 'remove' musi być async
                remove: async (name: string, options: CookieOptions) => {
                    try {
                        const store = await cookieStore; // Czekamy na obiekt ciasteczek
                        store.set({ name, value: "", ...options });
                    } catch (error) {
                        // Obsługa błędu
                    }
                },
            },
        }
    );
}