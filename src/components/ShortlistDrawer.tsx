// src/components/ShortlistDrawer.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
    Bookmark,
    X,
    Copy,
    Download,
    Trash2,
    ArrowUpRight,
    Check,
} from "lucide-react"
import { toast } from "sonner"
import { EASE_OUT } from "@/lib/motion"

export type ShortlistedBuilder = {
    handle: string
    name: string
    domain: string
    position: string
    branch: string
    photoUrl: string | null
    email?: string
}

const STORAGE_KEY = "craftroster_shortlist_v1"

export function getStoredShortlist(): ShortlistedBuilder[] {
    if (typeof window === "undefined") return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as ShortlistedBuilder[]) : []
    } catch {
        return []
    }
}

export function toggleShortlistBuilder(builder: ShortlistedBuilder): boolean {
    const current = getStoredShortlist()
    const cleanHandle = builder.handle.startsWith("@")
        ? builder.handle.toLowerCase()
        : `@${builder.handle.toLowerCase()}`

    const exists = current.some((b) => b.handle.toLowerCase() === cleanHandle)
    const updated = exists
        ? current.filter((b) => b.handle.toLowerCase() !== cleanHandle)
        : [...current, { ...builder, handle: cleanHandle }]

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("shortlist-updated"))
    return !exists
}

export default function ShortlistDrawer() {
    const [items, setItems] = useState<ShortlistedBuilder[]>([])
    const [open, setOpen] = useState(false)
    const [copiedAll, setCopiedAll] = useState(false)

    useEffect(() => {
        const sync = () => setItems(getStoredShortlist())
        sync()
        window.addEventListener("shortlist-updated", sync)
        window.addEventListener("storage", sync)
        return () => {
            window.removeEventListener("shortlist-updated", sync)
            window.removeEventListener("storage", sync)
        }
    }, [])

    const removeBuilder = (handle: string) => {
        const updated = items.filter(
            (b) => b.handle.toLowerCase() !== handle.toLowerCase()
        )
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setItems(updated)
        window.dispatchEvent(new Event("shortlist-updated"))
    }

    const clearAll = () => {
        window.localStorage.removeItem(STORAGE_KEY)
        setItems([])
        window.dispatchEvent(new Event("shortlist-updated"))
        toast.success("Cleared shortlist")
    }

    const copyAllEmails = () => {
        const emails = items.map((b) => b.email).filter(Boolean)
        if (emails.length === 0) {
            toast.error("No email addresses found in your shortlist")
            return
        }
        navigator.clipboard.writeText(emails.join(", "))
        setCopiedAll(true)
        toast.success(`Copied ${emails.length} builder email(s) to clipboard!`)
        setTimeout(() => setCopiedAll(false), 2000)
    }

    const exportCsv = () => {
        const headers = ["Name", "Handle", "Domain", "Status", "Skills", "Email"]
        const rows = items.map((b) => [
            `"${b.name.replace(/"/g, '""')}"`,
            `"${b.handle}"`,
            `"${b.domain}"`,
            `"${b.position}"`,
            `"${b.branch.replace(/"/g, '""')}"`,
            `"${b.email || ""}"`,
        ])
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csvContent))
        link.setAttribute("download", "craftroster-shortlist.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Downloaded craftroster-shortlist.csv")
    }

    return (
        <>
            {/* Floating Shortlist Pill Trigger */}
            <AnimatePresence>
                {items.length > 0 && !open && (
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-violet-500/40 bg-zinc-950/90 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_35px_rgba(139,92,246,0.35)] backdrop-blur-xl transition-transform hover:scale-105"
                    >
                        <Bookmark className="size-3.5 fill-violet-400 text-violet-400" />
                        <span>Shortlist</span>
                        <span className="grid size-5 place-items-center rounded-full bg-violet-500 text-[11px] font-bold text-white">
                            {items.length}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Slide-out Recruiter Drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm"
                    >
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3, ease: EASE_OUT }}
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/12 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="size-4 fill-violet-400 text-violet-400" />
                                    <h2 className="text-base font-semibold text-white">
                                        Builder Shortlist ({items.length})
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {/* Shortlisted Builders List */}
                            <div
                                onWheel={(e) => e.stopPropagation()}
                                className="my-4 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1"
                            >
                                {items.length === 0 ? (
                                    <p className="py-12 text-center text-sm text-zinc-500">
                                        No builders shortlisted yet. Click the bookmark icon on any
                                        card to save builders for outreach.
                                    </p>
                                ) : (
                                    items.map((b) => (
                                        <div
                                            key={b.handle}
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                {b.photoUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={b.photoUrl}
                                                        alt={b.name}
                                                        className="size-11 shrink-0 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/20 font-semibold text-violet-300">
                                                        {b.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/u/${encodeURIComponent(b.handle.replace(/^@/, ""))}`}
                                                        onClick={() => setOpen(false)}
                                                        className="inline-flex items-center gap-1 truncate text-sm font-semibold text-white hover:text-violet-300"
                                                    >
                                                        {b.name}
                                                        <ArrowUpRight className="size-3.5" />
                                                    </Link>
                                                    <p className="truncate text-xs text-zinc-400">
                                                        {b.domain} · {b.position}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeBuilder(b.handle)}
                                                aria-label={`Remove ${b.name}`}
                                                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Recruiter Bulk Actions */}
                            {items.length > 0 && (
                                <div className="space-y-2.5 border-t border-white/10 pt-4">
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={copyAllEmails}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-transform hover:scale-[1.02]"
                                        >
                                            {copiedAll ? (
                                                <>
                                                    <Check className="size-3.5 text-emerald-600" /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" /> Copy All Emails
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={exportCsv}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
                                        >
                                            <Download className="size-3.5 text-violet-400" /> Export CSV
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="w-full py-1.5 text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                                    >
                                        Clear shortlist
                                    </button>
                                </div>
                            )}
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}