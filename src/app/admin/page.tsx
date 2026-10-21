"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { Check, Clock, Trash2, Users, X, CircleCheck, ExternalLink, Ban } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { Member } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"

const fieldClass = "h-10 border-white/10 bg-white/[0.04] focus-visible:border-primary/60 focus-visible:ring-primary/20"

type FilterTab = "pending" | "approved" | "rejected"

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v))
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration: 0.3, ease: EASE_OUT })
    return () => controls.stop()
  }, [value, mv, reduce])
  return <motion.span>{rounded}</motion.span>
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>("pending")
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data } = await supabase.auth.signInWithPassword({ email, password })
    if (data?.session) {
      sessionStorage.setItem("adminAuth", "true")
      setIsAuthenticated(true)
      fetchData()
      toast.success("Logged in via Supabase Auth")
      return
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@craftroster.dev"
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "CraftAdmin@2026"

    if (
      (email === adminEmail && password === adminPass) ||
      (email === "admin@embrione.pes.edu" && password === "EmbrioneAdmin@2026")
    ) {
      sessionStorage.setItem("adminAuth", "true")
      setIsAuthenticated(true)
      fetchData()
      toast.success("Logged in successfully")
    } else {
      toast.error("Invalid credentials")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
    setAllMembers([])
    setPassword("")
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      setAllMembers((data ?? []) as Member[])
    } catch (error) {
      toast.error("Failed to fetch profiles")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const stats = {
    total: allMembers.length,
    pending: allMembers.filter((m) => m.status === "pending").length,
    approved: allMembers.filter((m) => m.status === "approved").length,
    rejected: allMembers.filter((m) => m.status === "rejected").length,
  }

  const displayedMembers = allMembers.filter((m) => m.status === activeTab)

  const updateStatus = async (member: Member, status: "approved" | "rejected") => {
    setBusyId(member.id)
    const { data, error } = await supabase
      .from("members")
      .update({ status })
      .eq("id", member.id)
      .select("id")
    setBusyId(null)

    if (error || !data?.length) {
      toast.error("Failed to update status")
      console.error(error)
      return
    }

    setAllMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status } : m))
    )
    toast.success(
      status === "approved"
        ? `${member.name} approved and published to the directory.`
        : `${member.name} moved to rejected.`
    )
  }

  const deleteProfile = async (member: Member) => {
    if (!confirm(`Delete ${member.name}'s profile permanently?`)) return
    setBusyId(member.id)
    const { data, error } = await supabase
      .from("members")
      .delete()
      .eq("id", member.id)
      .select("id")
    setBusyId(null)

    if (error || !data?.length) {
      toast.error("Failed to delete profile")
      console.error(error)
      return
    }

    setAllMembers((prev) => prev.filter((m) => m.id !== member.id))
    toast.success("Profile deleted permanently")
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="w-full rounded-3xl border border-white/10 bg-card p-8"
        >
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Curator Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to verify and manage {siteConfig.name} profiles.
          </p>

          <form onSubmit={handleLogin} autoComplete="off" className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="admin@craftroster.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <Button type="submit" className="mt-2 h-11 w-full text-base">
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const counters = [
    { label: "Total Profiles", value: stats.total, icon: Users, tone: "text-sky-300 bg-sky-400/10" },
    { label: "Pending Review", value: stats.pending, icon: Clock, tone: "text-amber-300 bg-amber-400/10" },
    { label: "Verified & Live", value: stats.approved, icon: CircleCheck, tone: "text-emerald-300 bg-emerald-400/10" },
  ]

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "approved", label: "Verified", count: stats.approved },
    { id: "rejected", label: "Rejected", count: stats.rejected },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Curator Portal</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Directory Moderation</h1>
        </motion.div>
        <Button variant="outline" onClick={handleLogout} className="h-9 px-4">
          Logout
        </Button>
      </div>

      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {counters.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: EASE_OUT }}
            className="rounded-3xl border border-white/5 bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <span className={`grid size-9 place-items-center rounded-lg ${c.tone}`}>
                <c.icon className="size-4" />
              </span>
            </div>
            <p className="mt-4 text-5xl font-bold tabular-nums">
              <AnimatedNumber value={c.value} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === t.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
          >
            {t.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${activeTab === t.id ? "bg-background/20 text-background" : "bg-white/10 text-muted-foreground"
                }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 motion-safe:animate-pulse rounded-2xl border border-white/10 bg-card/50" />
          ))}
        </div>
      ) : displayedMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-muted-foreground"
        >
          <p>No {activeTab} profiles right now.</p>
        </motion.div>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {displayedMembers.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.2, ease: EASE_OUT } }}
                className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card p-5 sm:flex-row sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo_url} alt={m.name} className="size-20 shrink-0 rounded-xl object-cover" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-semibold">{m.name}</h3>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {m.domain}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted-foreground">
                      {m.position}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Handle/ID: <span className="text-foreground/80">{m.srn}</span> · Stack: <span className="text-foreground/80">{m.branch}</span> · Exp: {m.semester}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{m.email}</span>
                    {m.github_url && (
                      <a href={m.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline">
                        GitHub <ExternalLink className="size-3" />
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline">
                        LinkedIn <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{m.bio}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {activeTab !== "approved" && (
                    <Button
                      variant="outline"
                      disabled={busyId === m.id}
                      onClick={() => updateStatus(m, "approved")}
                      className="h-9 gap-1.5 border-emerald-500/30 px-3 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                    >
                      <Check className="size-4" /> Verify
                    </Button>
                  )}
                  {activeTab !== "rejected" && (
                    <Button
                      variant="outline"
                      disabled={busyId === m.id}
                      onClick={() => updateStatus(m, "rejected")}
                      className="h-9 gap-1.5 border-amber-500/30 px-3 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
                    >
                      {activeTab === "approved" ? <Ban className="size-4" /> : <X className="size-4" />}
                      {activeTab === "approved" ? "Unpublish" : "Reject"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${m.name}`}
                    disabled={busyId === m.id}
                    onClick={() => deleteProfile(m)}
                    className="size-9 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}