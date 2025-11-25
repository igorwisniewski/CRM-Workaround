import { PrismaClient } from '@prisma/client'
import { Client } from 'pg'
import * as dotenv from 'dotenv'

// Ładujemy zmienne środowiskowe
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

// Klient do starej bazy (Supabase Postgres)
const pgClient = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
})

async function main() {
    if (!process.env.SUPABASE_DATABASE_URL) {
        console.error('❌ Brak zmiennej SUPABASE_DATABASE_URL w pliku .env')
        process.exit(1)
    }

    console.log('🔌 Łączenie z bazą Supabase...')
    await pgClient.connect()

    console.log('🧹 Czyszczenie nowej bazy (opcjonalne)...')
    // Uwaga: To usunie dane z MySQL przed importem, aby uniknąć duplikatów ID.
    // Jeśli chcesz tylko dodać dane, zakomentuj te linie, ale możesz napotkać błędy "Unique constraint".
    await prisma.task.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.user.deleteMany()

    console.log('🚀 Rozpoczynam migrację...')

    // --- 1. UŻYTKOWNICY ---
    console.log('👤 Pobieranie użytkowników...')

    // Pobieramy hasła z auth.users i profile z public.User
    // Łączymy je po ID. Jeśli hasło jest w auth.users, bierzemy je (jest zahaszowane bcryptem).
    // Jeśli user nie ma hasła (np. logował się Googlem), ustawiamy losowe lub puste.
    const oldUsersQuery = `
    SELECT 
      u.id, 
      u.email, 
      u.kolor, 
      u.role,
      au.encrypted_password as password
    FROM "User" u
    LEFT JOIN auth.users au ON u.id = au.id::text
  `

    const { rows: oldUsers } = await pgClient.query(oldUsersQuery)

    console.log(`   Znaleziono ${oldUsers.length} użytkowników. Zapisywanie do MySQL...`)

    for (const u of oldUsers) {
        await prisma.user.create({
            data: {
                id: u.id, // Zachowujemy oryginalne ID (UUID)
                email: u.email,
                role: u.role === 'ADMIN' ? 'ADMIN' : 'USER',
                kolor: u.kolor,
                // Jeśli hasło istnieje w Supabase, przenosimy hash.
                // Jeśli nie (np. logowanie social), ustawiamy placeholder.
                password: u.password || '$2a$10$placeholder_hash_change_me',
            }
        })
    }

    // --- 2. KONTAKTY ---
    console.log('📇 Pobieranie kontaktów...')
    const { rows: oldContacts } = await pgClient.query(`SELECT * FROM "Contact"`)
    console.log(`   Znaleziono ${oldContacts.length} kontaktów.`)

    for (const c of oldContacts) {
        await prisma.contact.create({
            data: {
                id: c.id,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                imie: c.imie,
                etap: c.etap,
                email: c.email,
                telefon: c.telefon,
                zrodlo: c.zrodlo,
                branza: c.branza,
                opis: c.opis,
                nazwaFirmy: c.nazwaFirmy,
                rodzajDzialki: c.rodzajDzialki,
                potrzebaKlienta: c.potrzebaKlienta,
                formaOpodatkowania: c.formaOpodatkowania,
                zobowiazania: c.zobowiazania, // Postgres JSONB -> MySQL Json (Prisma obsłuży typy)
                majatekFirmy: c.majatekFirmy,
                czyZatrudniaPracownikow: c.czyZatrudniaPracownikow,
                opoznieniaWPlatnosciach: c.opoznieniaWPlatnosciach,
                planNaRozwoj: c.planNaRozwoj,
                stanCywilny: c.stanCywilny,
                rozdzielnoscMajatkowa: c.rozdzielnoscMajatkowa,
                majatekPrywatny: c.majatekPrywatny,
                czyBralKredyt10Lat: c.czyBralKredyt10Lat,

                // Relacje - używamy ID, które przenieśliśmy wyżej
                createdById: c.createdById,
                assignedToId: c.assignedToId,
            }
        })
    }

    // --- 3. ZADANIA ---
    console.log('✅ Pobieranie zadań...')
    const { rows: oldTasks } = await pgClient.query(`SELECT * FROM "Task"`)
    console.log(`   Znaleziono ${oldTasks.length} zadań.`)

    for (const t of oldTasks) {
        await prisma.task.create({
            data: {
                id: t.id,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
                nazwa: t.nazwa,
                opis: t.opis,
                termin: t.termin,
                wykonane: t.wykonane,
                contactId: t.contactId,
                createdById: t.createdById,
                assignedToId: t.assignedToId,
            }
        })
    }

    console.log('🎉 Migracja zakończona sukcesem!')
}

main()
    .catch((e) => {
        console.error('❌ Błąd migracji:', e)
        process.exit(1)
    })
    .finally(async () => {
        await pgClient.end()
        await prisma.$disconnect()
    })