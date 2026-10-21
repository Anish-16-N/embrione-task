import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import SmoothScroll from "@/components/SmoothScroll"
import InteractiveBackground from "@/components/InteractiveBackground"
import { Toaster } from "@/components/ui/sonner"
import { siteConfig } from "@/lib/siteConfig"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.tagline,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background`}
      >
        <SmoothScroll />
        <InteractiveBackground />
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-white/10 py-12 text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p>© 2026 {siteConfig.name}. Curated Builder Directory.</p>
            <div className="flex items-center gap-6">
              <Link href="/team" className="hover:text-foreground">
                Directory
              </Link>
              <Link href="/register" className="hover:text-foreground">
                Claim Card
              </Link>
              <Link href="/admin" className="hover:text-foreground">
                Curator Portal
              </Link>
            </div>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}