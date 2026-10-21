// src/app/team/page.tsx
"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Search, X, Share2, ArrowUpRight, Copy } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"
import type { Member } from "@/lib/types"
import MemberCard from "@/components/MemberCard"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("All")
  const [positionFilter, setPositionFilter] = useState("All")
  const [sortBy, setSortBy] = useState<"newest" | "alpha">("newest")
  const [selectedBuilder, setSelectedBuilder] = useState<Member | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const domainParam = params.get("domain")
    if (domainParam && siteConfig.domains.includes(domainParam)) {
      setDomainFilter(domainParam)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
        if (error) throw error
        const loaded = (data || []) as Member[]
        setMembers(loaded)

        // Open modal automatically if ?builder=@handle is in URL
        const params = new URLSearchParams(window.location.search)
        const builderHandle = params.get("builder")
        if (builderHandle) {
          const found = loaded.find(
            (m) => m.srn?.toLowerCase() === builderHandle.toLowerCase()
          )
          if (found) setSelectedBuilder(found)
        }
      } catch (error: any) {
        console.error("Error fetching members:", error?.message || error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = members
    .filter((m) => {
      if (domainFilter !== "All" && m.domain !== domainFilter) return false
      if (positionFilter !== "All" && m.position !== positionFilter) return false
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase()
        const matchName = m.name?.toLowerCase().includes(q)
        const matchBio = m.bio?.toLowerCase().includes(q)
        const matchStack = m.branch?.toLowerCase().includes(q)
        const matchHandle = m.srn?.toLowerCase().includes(q)
        if (!matchName && !matchBio && !matchStack && !matchHandle) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "alpha") return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const shareBuilderLink = (member: Member) => {
    const url = `${window.location.origin}/team?builder=${encodeURIComponent(member.srn)}`
    navigator.clipboard.writeText(url)
    toast.success(`Shareable profile link copied for ${member.name}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <h1 className="text-5xl font-semibold leading-none tracking-tight sm:text-7xl">
            The roster.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Discover verified engineers, designers, and builders across{" "}
            {siteConfig.name}.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, stack, @handle..."
              className="pl-9 pr-8"
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

          <Select
            value={positionFilter}
            onValueChange={(v) => v && setPositionFilter(v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {siteConfig.roles.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) => v && setSortBy(v as "newest" | "alpha")}
          >
            <SelectTrigger className="w-[155px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest Builders</SelectItem>
              <SelectItem value="alpha">Alphabetical (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Domain Filter Pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        {["All", ...siteConfig.domains].map((d) => {
          const active = domainFilter === d
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDomainFilter(d)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${active
                  ? "bg-foreground text-background"
                  : "border border-white/10 bg-card text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
            >
              {d}
            </button>
          )
        })}
      </div>

      <div className="mt-14">
        {loading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-3xl bg-muted motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-20">
            <p className="text-muted-foreground">No builders match these filters.</p>
            <button
              type="button"
              onClick={() => {
                setDomainFilter("All")
                setPositionFilter("All")
                setSearchQuery("")
              }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium hover:bg-white/5"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-14 pb-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              <div key={m.id} className="lg:[&:nth-child(3n+2)]:translate-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.3,
                    delay: (i % 3) * 0.05,
                    ease: EASE_OUT,
                  }}
                >
                  <MemberCard
                    name={m.name}
                    handle={m.srn}
                    domain={m.domain}
                    position={m.position}
                    branch={m.branch}
                    semester={m.semester}
                    bio={m.bio}
                    photoUrl={m.photo_url}
                    linkedin={m.linkedin_url}
                    github={m.github_url}
                    portfolio={m.portfolio_url}
                    email={m.email}
                    onClick={() => setSelectedBuilder(m)}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shareable Profile Modal */}
      <AnimatePresence>
        {selectedBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBuilder(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-card p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setSelectedBuilder(null)}
                className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedBuilder.photo_url}
                  alt={selectedBuilder.name}
                  className="size-20 rounded-2xl object-cover"
                />
                <div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    {selectedBuilder.position}
                  </span>
                  <h2 className="mt-1.5 text-2xl font-semibold">
                    {selectedBuilder.name}
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedBuilder.srn} · {selectedBuilder.domain}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-background/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Stack & Experience
                </p>
                <p className="mt-1 text-sm font-medium">
                  {selectedBuilder.branch} ({selectedBuilder.semester} yrs exp)
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  About
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                  {selectedBuilder.bio}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  {selectedBuilder.github_url && (
                    <a
                      href={selectedBuilder.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      GitHub <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                  {selectedBuilder.linkedin_url && (
                    <a
                      href={selectedBuilder.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      LinkedIn <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                  {selectedBuilder.portfolio_url && (
                    <a
                      href={selectedBuilder.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      Portfolio <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedBuilder.email)
                      toast.success("Email copied!")
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium hover:bg-white/5"
                  >
                    <Copy className="size-3.5" /> Copy Email
                  </button>
                  <button
                    type="button"
                    onClick={() => shareBuilderLink(selectedBuilder)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background"
                  >
                    <Share2 className="size-3.5" /> Share Card
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}