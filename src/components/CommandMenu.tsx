// src/components/CommandMenu.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
    Search,
    Sparkles,
    Users,
    ArrowRight,
    ShieldCheck,
    Layers,
    CornerDownLeft,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"
import {
    SHOWCASE_PROFILES,
    filterValidCraftRosterMembers,
} from "@/lib/showcaseProfiles"
import type { Member } from "@/lib/types"

export default function CommandMenu() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [builders, setBuilders] = useState<Member[]>(SHOWCASE_PROFILES)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setOpen((prev) => !prev)
            } else if (e.key === "Escape") {
                setOpen(false)
            }
        }
        const onCustomOpen = () => setOpen(true)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("open-command-menu", onCustomOpen)
        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("open-command-menu", onCustomOpen)
        }
    }, [])

    useEffect(() => {
        if (!open) return
        supabase
            .from("members")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
                if (!error && data && data.length > 0) {
                    setBuilders(filterValidCraftRosterMembers(data as Member[]))
                }
            })
    }, [open])

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()

        const quickActions = [
            {
                id: "nav-register",
                type: "action" as const,
                title: "Claim Your Builder Card",
                subtitle: "Create and preview your interactive card",
                href: "/register",
                icon: Sparkles,
            },
            {
                id: "nav-team",
                type: "action" as const,
                title: "Explore Full Directory",
                subtitle: "Browse all verified builders & filters",
                href: "/team",
                icon: Users,
            },
            {
                id: "nav-admin",
                type: "action" as const,
                title: "Curator Moderation Portal",
                subtitle: "Review pending builder submissions",
                href: "/admin",
                icon: ShieldCheck,
            },
        ].filter(
            (a) =>
                !q ||
                a.title.toLowerCase().includes(q) ||
                a.subtitle.toLowerCase().includes(q)
        )

        const matchingBuilders = builders
            .filter((b) => {
                if (!q) return true
                return (
                    b.name.toLowerCase().includes(q) ||
                    b.srn.toLowerCase().includes(q) ||
                    b.branch.toLowerCase().includes(q) ||
                    b.domain.toLowerCase().includes(q)
                )
            })
            .slice(0, 6)
            .map((b) => ({
                id: `builder-${b.id}`,
                type: "builder" as const,
                title: b.name,
                subtitle: `${b.srn} · ${b.domain} · ${b.branch}`,
                photoUrl: b.photo_url,
                badge: b.position,
                href: `/u/${encodeURIComponent(b.srn.replace(/^@/, ""))}`,
            }))

        const matchingDomains = siteConfig.domains
            .filter((d) => q && d.toLowerCase().includes(q))
            .map((d) => ({
                id: `domain-${d}`,
                type: "domain" as const,
                title: `Filter by ${d}`,
                subtitle: "View builders in this craft",
                href: `/team?domain=${encodeURIComponent(d)}`,
                icon: Layers,
            }))

        return [...matchingBuilders, ...matchingDomains, ...quickActions]
    }, [query, builders])

    useEffect(() => {
        setSelectedIndex(0)
    }, [query, open])

    const handleSelect = (href: string) => {
        setOpen(false)
        setQuery("")
        router.push(href)
    }

    const handleListKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) => (prev + 1) % results.length)
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        } else if (e.key === "Enter" && results[selectedIndex]) {
            e.preventDefault()
            handleSelect(results[selectedIndex].href)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 px-4 pt-[14vh] backdrop-blur-md"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleListKeyDown}
                        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-950/95 shadow-[0_25px_80px_rgba(139,92,246,0.28)]"
                    >
                        {/* Search Input Bar */}
                        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                            <Search className="size-4 shrink-0 text-violet-400" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search builders, @handles, skills (Next.js, Figma, AI)..."
                                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                            />
                            <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                                ESC
                            </kbd>
                        </div>

                        {/* Scrollable Results List with mousepad wheel containment */}
                        <div
                            onWheel={(e) => e.stopPropagation()}
                            className="max-h-[380px] overflow-y-auto overscroll-contain p-2"
                        >
                            {results.length === 0 ? (
                                <div className="py-12 text-center text-sm text-zinc-500">
                                    No builders or actions match &ldquo;{query}&rdquo;
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {results.map((item, idx) => {
                                        const active = idx === selectedIndex
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                onClick={() => handleSelect(item.href)}
                                                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-colors ${active
                                                    ? "bg-violet-500/15 text-white"
                                                    : "text-zinc-300 hover:bg-white/5"
                                                    }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    {item.type === "builder" ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={item.photoUrl}
                                                            alt={item.title}
                                                            className="size-9 shrink-0 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-violet-300">
                                                            <item.icon className="size-4" />
                                                        </span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {item.title}
                                                        </p>
                                                        <p className="truncate text-xs text-zinc-400">
                                                            {item.subtitle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    {item.type === "builder" && (
                                                        <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 sm:inline-block">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {active ? (
                                                        <CornerDownLeft className="size-3.5 text-violet-300" />
                                                    ) : (
                                                        <ArrowRight className="size-3.5 text-zinc-600" />
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer Hints */}
                        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-5 py-2.5 text-[11px] text-zinc-500">
                            <span>Use ↑↓ arrows to navigate, Enter to open</span>
                            <span className="font-mono text-violet-400/80">
                                CraftRoster Spotlight
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}