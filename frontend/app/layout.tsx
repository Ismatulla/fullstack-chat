import type { Metadata } from 'next'
import type React from 'react'

import { ThemeProvider } from 'next-themes'
import './global.css'

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Modern chat application with real-time messaging',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased flex  mx-auto">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
