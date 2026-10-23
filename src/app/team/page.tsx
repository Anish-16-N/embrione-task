// src/app/team/page.tsx
"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  Search,
  Sparkles,
  X,
  Share2,
  ArrowUpRight,
  Copy,
  Check,
  Flame,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"
import {
  SHOWCASE_PROFILES,
  filterValidCraftRosterMembers,
} from "@/lib/showcaseProfiles"
import { getBuilderVouchState } from "@/lib/vouches"
import type { Member } from "@/lib/types"
import MemberCard from "@/components/MemberCard"

type SortOption = "vouched" | "newest" | "name"

const POPULAR_SKILLS = [
  "Next.js",
  "TypeScript",
  "React",
  "Figma",
  "PyTorch",
  "Rust",
  "Go",
  "Kubernetes",
]

function TeamDirectoryContent() {
  const searchParams = useSearchParams()
  const initialDomain = searchParams.get("domain") || "All"
  const initialQuery = searchParams.get("q") || ""

  const [members, setMembers] = useState<Member[]>(SHOWCASE_PROFILES)
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain)
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState<SortOption>("vouched")
  const [activeMember, setActiveMember] = useState<Member | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [vouchTick, setVouchTick] = useState(0)

  useEffect(() => {
    const d = searchParams.get("domain")
    if (d) setSelectedDomain(d)
  }, [searchParams])

  useEffect(() => {
    const onVouchUpdate = () => setVouchTick((t) => t + 1)
    window.addEventListener("vouches-updated", onVouchUpdate)
    return () => window.removeEventListener("vouches-updated", onVouchUpdate)
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })

        if (!error && data && data.length > 0) {
          const valid = filterValidCraftRosterMembers(data as Member[])
          setMembers(valid.length > 0 ? valid : SHOWCASE_PROFILES)
        } else {
          setMembers(SHOWCASE_PROFILES)
        }
      } catch {
        setMembers(SHOWCASE_PROFILES)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  const filteredMembers = useMemo(() => {
    // Reference vouchTick so sorting updates live when a user clicks Vouch
    void vouchTick

    return members
      .filter((m) => {
        const matchesDomain =
          selectedDomain === "All" || m.domain === selectedDomain
        const matchesStatus =
          selectedStatus === "All" || m.position === selectedStatus
        const q = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.srn.toLowerCase().includes(q) ||
          m.branch.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q) ||
          m.domain.toLowerCase().includes(q)
        return matchesDomain && matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === "vouched") {
          const vA = getBuilderVouchState(a.srn, a.name).count
          const vB = getBuilderVouchState(b.srn, b.name).count
          return vB - vA
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name)
        }
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        )
      })
  }, [members, selectedDomain, selectedStatus, searchQuery, sortBy, vouchTick])

  const shareBuilderLink = (member: Member) => {
    const cleanHandle = member.srn.replace(/^@/, "")
    const url = `${window.location.origin}/u/${encodeURIComponent(cleanHandle)}`
    navigator.clipboard.writeText(url)
    toast.success(`Copied ${url} to clipboard!`)
  }

  const copyBuilderEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(true)
    toast.success(`Copied ${email} to clipboard`)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const toggleSkillFilter = (skill: string) => {
    if (searchQuery.toLowerCase() === skill.toLowerCase()) {
      setSearchQuery("")
    } else {
      setSearchQuery(skill)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Sparkles className="size-3.5" /> Verified Talent Directory
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            The Roster.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
            Discover engineers, product designers, and AI builders verified for
            their proof of work. Vouch for peers or shortlist talent for your
            team.
          </p>
        </div>

        <Link
          href="/register"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-transform hover:scale-[1.03] md:self-auto"
        >
          <Sparkles className="size-3.5 text-violet-600" />
          Claim Your Card
        </Link>
      </div>

      {/* Search, Quick Skill Pills & Sort Controls */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, @handle, or tech stack (e.g. Next.js, Rust, Figma)..."
              className="h-11 w-full rounded-2xl border border-white/12 bg-zinc-900/70 pl-11 pr-10 text-sm text-white placeholder:text-zinc-500 backdrop-blur-xl focus:border-violet-500/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <SlidersHorizontal className="size-3.5 text-violet-400" /> Sort:
            </span>
            {(
              [
                { id: "vouched", label: "Most Vouched 🔥" },
                { id: "newest", label: "Newest" },
                { id: "name", label: "A–Z" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${sortBy === opt.id
                  ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* One-Click Popular Tech Stack Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Trending Stack:
          </span>
          {POPULAR_SKILLS.map((skill) => {
            const active = searchQuery.toLowerCase() === skill.toLowerCase()
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkillFilter(skill)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${active
                  ? "border-violet-400/60 bg-violet-500/20 text-violet-200"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                  }`}
              >
                {skill}
              </button>
            )
          })}
        </div>

        {/* Domain & Availability Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", ...siteConfig.domains].map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${selectedDomain === domain
                  ? "bg-white text-zinc-950"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                  }`}
              >
                {domain}
              </button>
            ))}
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-full border border-white/12 bg-zinc-900 px-3.5 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none"
          >
            <option value="All">All Availability</option>
            {siteConfig.roles.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-8 flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing <strong className="text-white">{filteredMembers.length}</strong>{" "}
          verified{" "}
          {filteredMembers.length === 1 ? "builder" : "builders"}
        </span>
        {(selectedDomain !== "All" ||
          selectedStatus !== "All" ||
          searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedDomain("All")
                setSelectedStatus("All")
                setSearchQuery("")
              }}
              className="text-violet-400 hover:underline"
            >
              Reset all filters
            </button>
          )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="aspect-[4/5] animate-pulse rounded-3xl bg-white/5"
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-white/10 bg-zinc-900/40 p-12 text-center">
          <p className="text-lg font-semibold text-white">
            No matching builders found
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Try clearing your search filter or exploring another craft domain.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: Math.min(idx * 0.05, 0.25),
                ease: EASE_OUT,
              }}
            >
              <MemberCard
                name={member.name}
                handle={member.srn}
                domain={member.domain}
                position={member.position}
                branch={member.branch}
                semester={member.semester}
                bio={member.bio}
                photoUrl={member.photo_url}
                linkedin={member.linkedin_url}
                github={member.github_url}
                portfolio={member.portfolio_url}
                email={member.email}
                onClick={() => setActiveMember(member)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Builder Detail Modal */}
      <AnimatePresence>
        {activeMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMember(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setActiveMember(null)}
                className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMember.photo_url || ""}
                  alt={activeMember.name}
                  className="size-24 shrink-0 rounded-2xl object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      {activeMember.position}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300">
                      {activeMember.domain}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                      <Flame className="size-3 fill-amber-400 text-amber-400" />
                      {
                        getBuilderVouchState(
                          activeMember.srn,
                          activeMember.name
                        ).count
                      }{" "}
                      Vouches
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    {activeMember.name}
                  </h2>
                  <p className="font-mono text-xs text-zinc-400">
                    {activeMember.srn} · {activeMember.semester}{" "}
                    {Number(activeMember.semester) === 1 ? "yr" : "yrs"}{" "}
                    experience
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-zinc-200 sm:text-base">
                {activeMember.bio}
              </p>

              {/* Clickable Skill Pills */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Stack & Skills (Click to filter roster)
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {activeMember.branch
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setSearchQuery(skill)
                          setActiveMember(null)
                        }}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-violet-500/50 hover:bg-violet-500/15 hover:text-white"
                      >
                        {skill}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/u/${encodeURIComponent(
                      activeMember.srn.replace(/^@/, "")
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
                  >
                    Open Full Profile <ExternalLink className="size-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => shareBuilderLink(activeMember)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
                  >
                    <Share2 className="size-3.5 text-violet-400" /> Copy Link
                  </button>

                  {activeMember.email && (
                    <button
                      type="button"
                      onClick={() => copyBuilderEmail(activeMember.email)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="size-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" /> Copy Email
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeMember.github_url && (
                    <a
                      href={activeMember.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                    >
                      GitHub <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                  {activeMember.linkedin_url && (
                    <a
                      href={activeMember.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                    >
                      LinkedIn <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                  {activeMember.portfolio_url && (
                    <a
                      href={activeMember.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                    >
                      Portfolio <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <TeamDirectoryContent />
    </Suspense>
  )
}