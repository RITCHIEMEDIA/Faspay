import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PWAInstall } from "@/components/pwa-install"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Faspay - Secure Digital Banking",
  description: "Fast, secure, and reliable digital banking platform for modern financial needs",
  keywords: ["banking", "digital wallet", "money transfer", "fintech", "secure payments"],
  authors: [{ name: "Faspay Team" }],
  creator: "Faspay",
  publisher: "Faspay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://faspay.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Faspay - Secure Digital Banking",
    description: "Fast, secure, and reliable digital banking platform for modern financial needs",
    url: "https://faspay.app",
    siteName: "Faspay",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Faspay - Secure Digital Banking",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faspay - Secure Digital Banking",
    description: "Fast, secure, and reliable digital banking platform for modern financial needs",
    images: ["/og-image.png"],
    creator: "@faspay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Faspay" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <PWAInstall />
        </ThemeProvider>
      </body>
    </html>
  )
}
