import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { Inter } from "next/font/google"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Join Edutu - The AI Powered App for Global Opportunities",
  description:
    "Edutu uses AI to find, filter, and personalize scholarships, fellowships, and global opportunities — then helps you prepare with a clear roadmap. Join our waitlist today!",
  keywords: ["AI", "scholarships", "fellowships", "global opportunities", "education", "Edutu", "waitlist"],
  authors: [{ name: "Edutu" }],
  creator: "Edutu",
  publisher: "Edutu",
  openGraph: {
    title: "Join Edutu - The AI Powered App for Global Opportunities",
    description:
      "Edutu uses AI to find, filter, and personalize scholarships, fellowships, and global opportunities — then helps you prepare with a clear roadmap.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Edutu - AI Powered App for Global Opportunities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Edutu - The AI Powered App for Global Opportunities",
    description:
      "Edutu uses AI to find, filter, and personalize scholarships, fellowships, and global opportunities — then helps you prepare with a clear roadmap.",
    images: ["/hero-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  )
}
