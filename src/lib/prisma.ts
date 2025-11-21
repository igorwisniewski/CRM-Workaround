// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Ręczne sprawdzenie, czy zmienna jest załadowana.
// To da nam nasz własny, jasny błąd, jeśli nadal jej brakuje.
if (!process.env.DATABASE_URL) {
    throw new Error(
        'BŁĄD KRYTYCZNY: Zmienna DATABASE_URL nie została załadowana. Sprawdź plik .env.local i zrestartuj serwer.'
    )
}

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        // log: ['query'],
    })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
