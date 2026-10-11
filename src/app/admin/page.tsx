"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { Check, Clock, Trash2, Users, X, CircleCheck } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { Member } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EASE_OUT } from "@/lib/motion"

const fieldClass = "h-10 border-white/10 bg-white/[0.04] focus-visible:border-primary/60 focus-visible:ring-primary/20"

// Counts up from 0 to the number whenever it changes.
function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v))
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    // Animate from the current number, not from 0, so approve/reject doesn't replay the whole count.
    const controls = animate(mv, value, { duration: 0.3, ease: EASE_OUT })
    return () => controls.stop()
  }, [value, mv, reduce])
  return <motion.span>{rounded}</motion.span>
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === "admin@embrione.pes.edu" && password === "EmbrioneAdmin@2026") {
      sessionStorage.setItem("adminAuth", "true")
      setIsAuthenticated(true)
      fetchData()
      toast.success("Logged in successfully")
    } else {
      toast.error("Invalid credentials")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
    setMembers([])
    setPassword("")
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: all, error: statsError } = await supabase.from("members").select("status")
      if (statsError) throw statsError
      setStats({
        total: all?.length ?? 0,
        pending: all?.filter((m) => m.status === "pending").length ?? 0,
        approved: all?.filter((m) => m.status === "approved").length ?? 0,
      })

      const { data, error } = await supabase.from("members").select("*").eq("status", "pending").order("created_at", { ascending: false })
      if (error) throw error
      setMembers((data ?? []) as Member[])
    } catch (error) {
      toast.error("Failed to fetch data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Remember the login for this browser tab
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const updateStatus = async (member: Member, status: "approved" | "rejected") => {
    setBusyId(member.id)
    const { data, error } = await supabase.from("members").update({ status }).eq("id", member.id).select("id")
    setBusyId(null)
    if (error || !data?.length) {
      toast.error("Failed to update status")
      console.error(error)
      return
    }
    // Update the screen right away so the card can animate out
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    setStats((s) => ({ ...s, pending: s.pending - 1, approved: s.approved + (status === "approved" ? 1 : 0) }))
    toast.success(status === "approved" ? `${member.name} approved. They now appear on the team page.` : `${member.name} rejected.`)
  }

  const deleteProfile = async (member: Member) => {
    if (!confirm(`Delete ${member.name}'s profile completely?`)) return
    setBusyId(member.id)
    const { data, error } = await supabase.from("members").delete().eq("id", member.id).select("id")
    setBusyId(null)
    if (error || !data?.length) {
      toast.error("Failed to delete profile")
      console.error(error)
      return
    }
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    setStats((s) => ({ ...s, total: s.total - 1, pending: s.pending - 1 }))
    toast.success("Profile deleted successfully")
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="w-full rounded-3xl bg-card p-8"
        >
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to review and approve member profiles.</p>

          <form onSubmit={handleLogin} autoComplete="off" className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="off" placeholder="admin@embrione.pes.edu" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} required />
            </div>
            <Button type="submit" className="mt-2 h-11 w-full text-base">Login</Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const counters = [
    { label: "Total Submissions", value: stats.total, icon: Users, tone: "text-sky-300 bg-sky-400/10" },
    { label: "Pending", value: stats.pending, icon: Clock, tone: "text-amber-300 bg-amber-400/10" },
    { label: "Approved", value: stats.approved, icon: CircleCheck, tone: "text-emerald-300 bg-emerald-400/10" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Moderation Dashboard</h1>
        </motion.div>
        <Button variant="outline" onClick={handleLogout} className="h-9 px-4">Logout</Button>
      </div>

      {/* Counters */}
      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {counters.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: EASE_OUT }}
            className="rounded-3xl bg-card p-6"
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

      {/* Pending list */}
      <h2 className="mb-5 flex items-center gap-3 text-xl font-semibold">
        Pending Approvals
        {members.length > 0 && <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-sm text-amber-300">{members.length}</span>}
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 motion-safe:animate-pulse rounded-2xl border border-white/10 bg-card/50" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-muted-foreground">
          <p>No pending profiles to review.</p>
          <p className="text-sm">You&apos;re all caught up!</p>
        </motion.div>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {members.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.2, ease: EASE_OUT } }}
                className="flex flex-col gap-4 rounded-3xl bg-card p-5 sm:flex-row sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo_url} alt={m.name} className="size-20 shrink-0 rounded-xl object-cover" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-semibold">{m.name}</h3>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{m.domain}</span>
                    <span className="text-xs text-muted-foreground">{m.position}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.srn}, Sem {m.semester}, {m.branch}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{m.bio}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    disabled={busyId === m.id}
                    onClick={() => updateStatus(m, "approved")}
                    className="h-9 gap-1.5 border-emerald-500/30 px-3 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                  >
                    <Check className="size-4" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busyId === m.id}
                    onClick={() => updateStatus(m, "rejected")}
                    className="h-9 gap-1.5 border-amber-500/30 px-3 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
                  >
                    <X className="size-4" /> Reject
                  </Button>
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