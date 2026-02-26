import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Themixa - Sistema de Gestão Jurídica',
  description: 'Sistema completo de gestão para escritórios de advocacia modernos',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://themixa.com.br'),

  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {children}
        <CookieConsentBanner />
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
