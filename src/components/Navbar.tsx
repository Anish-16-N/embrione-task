// src/components/Navbar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"

const links = [
  { href: "/team", label: "Directory" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
        {/* Dynamically uses siteConfig.name ("CraftRoster") instead of hardcoded Embrione */}
        <Link href="/" className="text-sm font-semibold tracking-tight">{siteConfig.name}</Link>
        <nav className="flex items-center gap-6 text-[13px]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`roll ${pathname === l.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              <span>{l.label}</span>
              <span aria-hidden="true">{l.label}</span>
            </Link>
          ))}
          <Link
            href="/register"
            className="btn-sweep press rounded-full bg-foreground px-3.5 py-1.5 font-medium text-background hover:scale-[1.04] active:scale-[0.95]"
          >
            Claim Your Card
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}