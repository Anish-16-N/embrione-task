// src/app/admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import {
  Check,
  Clock,
  Trash2,
  Users,
  X,
  CircleCheck,
  ExternalLink,
  Ban,
  LayoutGrid,
  List,
  Search,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { Member } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"

const fieldClass =
  "h-10 border-white/10 bg-white/[0.04] focus-visible:border-primary/60 focus-visible:ring-primary/20"

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
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("All")
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

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

  // 100% Secure Login using Supabase Auth + Database Role Checking (is_admin RPC)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error || !data.session) {
        toast.error("Invalid email or password")
        return
      }

      // Verify administrative privileges against the secure database function
      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin")

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut()
        toast.error("Access denied. Unauthorized admin account.")
        return
      }

      sessionStorage.setItem("adminAuth", "true")
      setIsAuthenticated(true)
      await fetchData()
      toast.success("Admin authentication successful")
    } catch (error) {
      console.error(error)
      toast.error("Authentication failed. Please check your connection.")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
    setAllMembers([])
    setPassword("")
  }

  // Secure session restoration on page reload
  useEffect(() => {
    let cancelled = false

    const restoreAdminSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (sessionError || !session) {
        sessionStorage.removeItem("adminAuth")
        setIsAuthenticated(false)
        return
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin")

      if (cancelled) return

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut()
        sessionStorage.removeItem("adminAuth")
        setIsAuthenticated(false)
        return
      }

      sessionStorage.setItem("adminAuth", "true")
      setIsAuthenticated(true)
      await fetchData()
    }

    void restoreAdminSession()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = {
    total: allMembers.length,
    pending: allMembers.filter((m) => m.status === "pending").length,
    approved: allMembers.filter((m) => m.status === "approved").length,
    rejected: allMembers.filter((m) => m.status === "rejected").length,
  }

  const filteredMembers = allMembers.filter((m) => {
    if (domainFilter !== "All" && m.domain !== domainFilter) return false
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      const matchName = m.name?.toLowerCase().includes(q)
      const matchEmail = m.email?.toLowerCase().includes(q)
      const matchHandle = m.srn?.toLowerCase().includes(q)
      const matchStack = m.branch?.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchHandle && !matchStack) return false
    }
    return true
  })

  const displayedMembers = filteredMembers.filter(
    (m) => m.status === activeTab
  )

  const updateStatus = async (
    member: Member,
    status: "approved" | "rejected"
  ) => {
    setBusyId(member.id)
    const { data, error } = await supabase
      .from("members")
      .update({ status })
      .eq("id", member.id)
      .select("id")
    setBusyId(null)

    if (error || !data?.length) {
      toast.error("Failed to update status (Check database RLS permissions)")
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
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Curator Login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in using your authorized Supabase administrator account for{" "}
            {siteConfig.name}.
          </p>

          <form
            onSubmit={handleLogin}
            autoComplete="off"
            className="mt-8 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="admin@yourdomain.com"
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
              Authenticate
            </Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const counters = [
    {
      label: "Total Profiles",
      value: stats.total,
      icon: Users,
      tone: "text-sky-300 bg-sky-400/10",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      tone: "text-amber-300 bg-amber-400/10",
    },
    {
      label: "Verified & Live",
      value: stats.approved,
      icon: CircleCheck,
      tone: "text-emerald-300 bg-emerald-400/10",
    },
  ]

  const tabs: {
    id: FilterTab
    label: string
    count: number
    badgeClass: string
  }[] = [
      {
        id: "pending",
        label: "Pending",
        count: stats.pending,
        badgeClass: "bg-amber-400/15 text-amber-300",
      },
      {
        id: "approved",
        label: "Verified",
        count: stats.approved,
        badgeClass: "bg-emerald-400/15 text-emerald-300",
      },
      {
        id: "rejected",
        label: "Rejected",
        count: stats.rejected,
        badgeClass: "bg-red-400/15 text-red-300",
      },
    ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Curator Portal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Directory Moderation
          </h1>
        </motion.div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setViewMode(viewMode === "list" ? "kanban" : "list")
            }
            className="h-9 gap-1.5 px-3"
          >
            {viewMode === "list" ? (
              <>
                <LayoutGrid className="size-4" /> Kanban View
              </>
            ) : (
              <>
                <List className="size-4" /> List View
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleLogout} className="h-9 px-4">
            Logout
          </Button>
        </div>
      </div>

      {/* Counters */}
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {counters.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: EASE_OUT }}
            className="rounded-3xl border border-white/5 bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {c.label}
              </p>
              <span
                className={`grid size-9 place-items-center rounded-lg ${c.tone}`}
              >
                <c.icon className="size-4" />
              </span>
            </div>
            <p className="mt-4 text-5xl font-bold tabular-nums">
              <AnimatedNumber value={c.value} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search & Domain Filter Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, @handle, stack..."
            className="h-9 pl-9 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["All", ...siteConfig.domains].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDomainFilter(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${domainFilter === d
                  ? "bg-foreground text-background"
                  : "border border-white/10 bg-card text-muted-foreground hover:text-foreground"
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Status Tabs (Shown in List View) */}
      {viewMode === "list" && (
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
                className={`rounded-full px-2 py-0.5 text-xs ${activeTab === t.id
                    ? "bg-background/20 text-background"
                    : "bg-white/10 text-muted-foreground"
                  }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-28 motion-safe:animate-pulse rounded-2xl border border-white/10 bg-card/50"
            />
          ))}
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        displayedMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-muted-foreground"
          >
            <p>No {activeTab} profiles matching your filters.</p>
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
                  exit={{
                    opacity: 0,
                    x: 60,
                    transition: { duration: 0.2, ease: EASE_OUT },
                  }}
                  className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card p-5 sm:flex-row sm:items-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />

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
                      Handle/ID:{" "}
                      <span className="font-mono text-foreground/80">
                        {m.srn}
                      </span>{" "}
                      · Stack:{" "}
                      <span className="text-foreground/80">{m.branch}</span> ·
                      Exp: {m.semester} yrs
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{m.email}</span>
                      {m.github_url && (
                        <a
                          href={m.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                        >
                          GitHub <ExternalLink className="size-3" />
                        </a>
                      )}
                      {m.linkedin_url && (
                        <a
                          href={m.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                        >
                          LinkedIn <ExternalLink className="size-3" />
                        </a>
                      )}
                      {m.portfolio_url && (
                        <a
                          href={m.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                        >
                          Portfolio <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                      {m.bio}
                    </p>
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
                        {activeTab === "approved" ? (
                          <Ban className="size-4" />
                        ) : (
                          <X className="size-4" />
                        )}
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
        )
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid gap-6 lg:grid-cols-3">
          {tabs.map((col) => {
            const colMembers = filteredMembers.filter(
              (m) => m.status === col.id
            )
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-3xl border border-white/10 bg-card/40 p-4"
              >
                <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="text-sm font-semibold">{col.label}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${col.badgeClass}`}
                  >
                    {colMembers.length}
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {colMembers.map((m) => (
                      <motion.div
                        key={m.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl border border-white/5 bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.photo_url}
                            alt={m.name}
                            className="size-12 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold">{m.name}</h3>
                            <p className="font-mono text-xs text-muted-foreground">
                              {m.srn} · {m.domain}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-foreground/80">
                              {m.branch} ({m.semester}y)
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                          {m.bio}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          {m.github_url && (
                            <a
                              href={m.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-sky-400 hover:underline"
                            >
                              GitHub <ExternalLink className="size-3" />
                            </a>
                          )}
                          {m.linkedin_url && (
                            <a
                              href={m.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-sky-400 hover:underline"
                            >
                              LinkedIn <ExternalLink className="size-3" />
                            </a>
                          )}
                          <a
                            href={`mailto:${m.email}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="size-3" /> Email
                          </a>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex gap-1.5">
                            {col.id !== "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === m.id}
                                onClick={() => updateStatus(m, "approved")}
                                className="h-7 border-emerald-500/30 px-2.5 text-xs text-emerald-300 hover:bg-emerald-500/10"
                              >
                                <Check className="mr-1 size-3" /> Verify
                              </Button>
                            )}
                            {col.id !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === m.id}
                                onClick={() => updateStatus(m, "rejected")}
                                className="h-7 border-amber-500/30 px-2.5 text-xs text-amber-300 hover:bg-amber-500/10"
                              >
                                <X className="mr-1 size-3" />{" "}
                                {col.id === "approved" ? "Unpublish" : "Reject"}
                              </Button>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={busyId === m.id}
                            onClick={() => deleteProfile(m)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}