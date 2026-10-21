import type { Metadata } from "next"
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
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background`}>
        <SmoothScroll />
        <InteractiveBackground />
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-white/10 py-12 text-center text-xs text-muted-foreground">
          <p>© 2026 {siteConfig.name}. All rights reserved.</p>
        </footer>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}