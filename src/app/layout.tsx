import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LUMEN — Plataforma Pedagógica Inteligente",
  description: "Encontrá el recurso justo en segundos, entendé qué es sin abrirlo, y usá IA para adaptarlo a tu clase.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
