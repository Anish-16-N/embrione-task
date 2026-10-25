// src/app/admin/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Database,
  RefreshCw,
  Lock,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { SHOWCASE_PROFILES } from "@/lib/showcaseProfiles"
import type { Member } from "@/lib/types"

type FilterTab = "all" | "pending" | "approved" | "rejected"

const ADMIN_PASSCODE = "craft2025"

export default function AdminCuratorPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("craftroster_admin_unlocked")
      if (saved === "true") setUnlocked(true)
    }
  }, [])

  const fetchAllMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMembers((data as Member[]) || [])
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not load database records"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (unlocked) {
      fetchAllMembers()
    }
  }, [unlocked])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      passcode.trim() === ADMIN_PASSCODE ||
      passcode.trim().toLowerCase() === "admin"
    ) {
      setUnlocked(true)
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("craftroster_admin_unlocked", "true")
      }
      toast.success("Curator portal unlocked")
    } else {
      toast.error("Invalid passcode (Hint: use 'craft2025' or 'admin')")
    }
  }

  const updateMemberStatus = async (
    id: string,
    newStatus: "approved" | "pending" | "rejected",
    name: string
  ) => {
    try {
      const { error } = await supabase
        .from("members")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) throw error

      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      )
      toast.success(`Marked ${name} as ${newStatus}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed"
      toast.error(msg)
    }
  }

  const deleteMember = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("members").delete().eq("id", id)
      if (error) throw error

      setMembers((prev) => prev.filter((m) => m.id !== id))
      toast.success(`Removed ${name} from database`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      toast.error(msg)
    }
  }

  const seedShowcaseBuilders = async () => {
    setSeeding(true)
    try {
      const existingHandles = new Set(
        members.map((m) => m.srn?.toLowerCase().trim())
      )
      const toInsert = SHOWCASE_PROFILES.filter(
        (p) => !existingHandles.has(p.srn.toLowerCase().trim())
      ).map(({ name, srn, email, domain, position, branch, semester, bio, photo_url, github_url, linkedin_url, portfolio_url }) => ({
        name,
        srn,
        email,
        domain,
        position,
        branch,
        semester,
        bio,
        photo_url,
        github_url,
        linkedin_url,
        portfolio_url,
        status: "approved",
      }))

      if (toInsert.length === 0) {
        toast.info("All 6 showcase builders are already in your database!")
        setSeeding(false)
        return
      }

      const { error } = await supabase.from("members").insert(toInsert)
      if (error) throw error

      toast.success(`Seeded ${toInsert.length} verified builders into Supabase!`)
      await fetchAllMembers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Seeding failed"
      toast.error(msg)
    } finally {
      setSeeding(false)
    }
  }

  const exportRosterCsv = () => {
    if (members.length === 0) {
      toast.error("No records to export")
      return
    }
    const headers = [
      "Name",
      "Handle",
      "Email",
      "Domain",
      "Availability",
      "Stack",
      "Experience (Yrs)",
      "Status",
      "GitHub",
      "Portfolio",
    ]
    const rows = members.map((m) =>
      [
        m.name,
        m.srn,
        m.email,
        m.domain,
        m.position,
        m.branch,
        String(m.semester),
        m.status,
        m.github_url || "",
        m.portfolio_url || "",
      ]
        .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
        .join(",")
    )
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "craftroster-database-export.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded craftroster-database-export.csv")
  }

  const counts = useMemo(() => {
    return {
      all: members.length,
      pending: members.filter((m) => m.status === "pending").length,
      approved: members.filter((m) => m.status === "approved").length,
      rejected: members.filter((m) => m.status === "rejected").length,
    }
  }, [members])

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesTab = activeTab === "all" || m.status === activeTab
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.srn?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.branch?.toLowerCase().includes(q) ||
        m.domain?.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [members, activeTab, search])

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="rounded-3xl border border-white/12 bg-zinc-900/60 p-8 backdrop-blur-xl"
        >
          <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
            <Lock className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Curator Access
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
            Enter the curator passcode to review pending builder cards, verify
            proof-of-work submissions, and manage the directory.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (craft2025)"
                className="h-11 w-full rounded-xl border border-white/12 bg-zinc-950 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <p className="mt-1.5 font-mono text-[11px] text-zinc-500">
                Demo passcode: <span className="text-zinc-300">craft2025</span>
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-950 transition-transform hover:scale-[1.01]"
            >
              Unlock Curator Portal
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <ShieldCheck className="size-3.5" /> Curator Command Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Roster Moderation.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Verify incoming builder cards, manage live directory profiles, or
            export your talent pool.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={seedShowcaseBuilders}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:opacity-50"
          >
            <Database className="size-3.5" />
            {seeding ? "Seeding..." : "Seed 6 Showcase Builders"}
          </button>

          <button
            type="button"
            onClick={exportRosterCsv}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
          >
            <Download className="size-3.5" /> Export CSV
          </button>

          <button
            type="button"
            onClick={fetchAllMembers}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
            aria-label="Refresh database"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            id: "all",
            label: "Total Submissions",
            value: counts.all,
            icon: Sparkles,
            color: "text-violet-400",
          },
          {
            id: "pending",
            label: "Pending Review",
            value: counts.pending,
            icon: Clock,
            color: "text-amber-400",
          },
          {
            id: "approved",
            label: "Verified Live",
            value: counts.approved,
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
          {
            id: "rejected",
            label: "Archived / Rejected",
            value: counts.rejected,
            icon: XCircle,
            color: "text-rose-400",
          },
        ].map((stat) => {
          const Icon = stat.icon
          const active = activeTab === stat.id
          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => setActiveTab(stat.id as FilterTab)}
              className={`rounded-2xl border p-4 text-left transition-all ${active
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/10 bg-zinc-900/45 hover:border-white/20"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{stat.label}</span>
                <Icon className={`size-4 ${stat.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                {stat.value}
              </p>
            </button>
          )
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions by name, @handle, email, or stack..."
            className="h-10 w-full rounded-xl border border-white/12 bg-zinc-900/70 pl-10 pr-4 text-xs text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${activeTab === tab
                  ? "bg-white text-zinc-950"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-12 text-center">
            <p className="text-base font-semibold text-white">
              No builder records in this view
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Click &ldquo;Seed 6 Showcase Builders&rdquo; above to populate your
              Supabase table, or submit a new card on /register.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const cleanHandle = (item.srn || "").replace(/^@/, "")
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        item.photo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.name || "?"
                        )}&background=6d28d9&color=fff`
                      }
                      alt={item.name}
                      className="size-14 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {item.name}
                        </h3>
                        <span className="font-mono text-xs text-violet-300">
                          {item.srn}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${item.status === "approved"
                              ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                              : item.status === "rejected"
                                ? "border border-rose-500/30 bg-rose-500/15 text-rose-300"
                                : "border border-amber-500/30 bg-amber-500/15 text-amber-300"
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        {item.domain} · {item.position} · {item.branch}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                        {item.bio}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                        <span>{item.email}</span>
                        {item.github_url && (
                          <a
                            href={item.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-zinc-300 hover:text-white"
                          >
                            GitHub <ArrowUpRight className="size-3" />
                          </a>
                        )}
                        {cleanHandle && (
                          <Link
                            href={`/u/${encodeURIComponent(cleanHandle)}`}
                            className="inline-flex items-center gap-1 text-violet-300 hover:underline"
                          >
                            View /u/{cleanHandle}{" "}
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {item.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateMemberStatus(item.id, "approved", item.name)
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-transform hover:scale-105"
                      >
                        <CheckCircle2 className="size-3.5" /> Approve
                      </button>
                    )}

                    {item.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateMemberStatus(item.id, "rejected", item.name)
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-rose-500/20 hover:text-rose-200"
                      >
                        <XCircle className="size-3.5" /> Reject
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteMember(item.id, item.name)}
                      aria-label={`Delete ${item.name}`}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-300"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}