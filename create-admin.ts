// create-admin.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@crm.pl'
    const password = 'R9A)@$S~@gy9YQG' // Tutaj wpisz hasło, jakie chcesz ustawić

    console.log(`⏳ Tworzenie administratora: ${email}...`)

    // 1. Generujemy hash hasła (tak samo jak robi to aplikacja)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 2. Upsert - tworzy użytkownika lub aktualizuje go, jeśli już istnieje
    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            kolor: '#0000ff' // Niebieski kolor dla admina
        },
        create: {
            email: email,
            password: hashedPassword,
            role: 'ADMIN',
            kolor: '#0000ff'
        },
    })

    console.log(`✅ SUKCES! Użytkownik ${user.email} został utworzony/zaktualizowany.`)
    console.log(`🔑 Możesz się zalogować hasłem: ${password}`)
}

main()
    .catch((e) => {
        console.error('❌ BŁĄD:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })