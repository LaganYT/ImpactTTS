import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Edge TTS Text-to-Speech',
  description: 'Convert text to speech using Microsoft Edge TTS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
