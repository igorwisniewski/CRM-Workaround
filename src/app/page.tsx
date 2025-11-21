// Usuwamy całą logikę serwerową (createClient, redirect)

import LoginHome from "@/components/LoginHome";

export default function HomePage() {
  // Ta strona teraz po prostu renderuje formularz logowania.
  // "Bramkarzem" będzie middleware.
  return (
      <LoginHome />
  )
}