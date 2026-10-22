// src/components/Navbar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { Sparkles, ArrowUpRight, Search } from "lucide-react"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/team", label: "Directory" },
]

export default function Navbar() {
  const pathname = usePathname()

  const openCommandMenu = () => {
    window.dispatchEvent(new Event("open-command-menu"))
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="sticky top-4 z-50 mx-auto max-w-4xl px-4"
    >
      <div className="flex h-14 items-center justify-between rounded-full border border-white/12 bg-zinc-950/75 px-3 pl-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        {/* Clean Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid size-7 place-items-center rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            {siteConfig.name}
          </span>
        </Link>

        {/* Center Navigation Pills */}
        <nav className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-pill"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    className="absolute inset-0 -z-10 rounded-full border border-white/15 bg-white/10 shadow-inner"
                  />
                )}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions: Spotlight Search + Claim Card */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandMenu}
            aria-label="Search roster"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-500/40 hover:bg-white/[0.08] hover:text-white"
          >
            <Search className="size-3.5 text-violet-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 md:inline-block">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/register"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition-all duration-200 hover:scale-[1.03] hover:bg-zinc-100 active:scale-[0.97]"
          >
            <span>Claim Card</span>
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  )
}