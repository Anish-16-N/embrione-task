// src/app/u/[handle]/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Share2,
  ShieldCheck,
  Briefcase,
  Code2,
  Mail,
  Download,
  Flame,
  GitBranch,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import {
  SHOWCASE_PROFILES,
  filterValidCraftRosterMembers,
} from "@/lib/showcaseProfiles"
import { getBuilderVouchState, toggleBuilderVouch } from "@/lib/vouches"
import type { Member } from "@/lib/types"
import MemberCard from "@/components/MemberCard"

type GitHubStats = {
  username: string
  public_repos: number
  followers: number
}

function extractGitHubUsername(url?: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes("github.com")) return null
    const seg = parsed.pathname.split("/").filter(Boolean)[0]
    return seg || null
  } catch {
    return null
  }
}

function ProfileContent() {
  const params = useParams<{ handle: string }>()
  const rawHandle = decodeURIComponent(params?.handle || "")
  const normalizedHandle = rawHandle.startsWith("@")
    ? rawHandle.toLowerCase()
    : `@${rawHandle.toLowerCase()}`

  const [builder, setBuilder] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [vouchState, setVouchState] = useState({ count: 24, vouched: false })
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null)

  useEffect(() => {
    const loadBuilder = async () => {
      try {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("status", "approved")

        const dbMembers = !error && data ? (data as Member[]) : []
        const pool =
          dbMembers.length > 0
            ? filterValidCraftRosterMembers(dbMembers)
            : SHOWCASE_PROFILES

        const match =
          pool.find((m) => m.srn?.toLowerCase() === normalizedHandle) ||
          SHOWCASE_PROFILES.find(
            (m) => m.srn?.toLowerCase() === normalizedHandle
          ) ||
          null

        setBuilder(match)
        if (match) {
          setVouchState(getBuilderVouchState(match.srn, match.name))
          const ghUser = extractGitHubUsername(match.github_url)
          if (ghUser) {
            fetch(`https://api.github.com/users/${encodeURIComponent(ghUser)}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (d && typeof d.public_repos === "number") {
                  setGhStats({
                    username: ghUser,
                    public_repos: d.public_repos,
                    followers: d.followers ?? 0,
                  })
                }
              })
              .catch(() => { })
          }
        }
      } catch {
        const fallback =
          SHOWCASE_PROFILES.find(
            (m) => m.srn?.toLowerCase() === normalizedHandle
          ) || null
        setBuilder(fallback)
      } finally {
        setLoading(false)
      }
    }
    loadBuilder()
  }, [normalizedHandle])

  useEffect(() => {
    if (!builder) return
    const sync = () =>
      setVouchState(getBuilderVouchState(builder.srn, builder.name))
    window.addEventListener("vouches-updated", sync)
    return () => window.removeEventListener("vouches-updated", sync)
  }, [builder])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[360px_1fr]">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-white/5" />
          <div className="space-y-4 pt-6">
            <div className="h-10 w-64 animate-pulse rounded-xl bg-white/5" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!builder) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Builder not found</h1>
        <p className="mt-2 text-sm text-zinc-400">
          No verified profile matches{" "}
          <span className="font-mono">{normalizedHandle}</span>.
        </p>
        <Link
          href="/team"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950"
        >
          <ArrowLeft className="size-3.5" /> Back to Directory
        </Link>
      </div>
    )
  }

  const skills = builder.branch
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const ogBannerUrl = `/api/og?name=${encodeURIComponent(
    builder.name
  )}&handle=${encodeURIComponent(builder.srn)}&domain=${encodeURIComponent(
    builder.domain
  )}&status=${encodeURIComponent(builder.position)}&stack=${encodeURIComponent(
    builder.branch
  )}`

  const shareProfile = () => {
    const clean = builder.srn.replace(/^@/, "")
    const url = `${window.location.origin}/u/${encodeURIComponent(clean)}`
    navigator.clipboard.writeText(url)
    toast.success("Direct profile link copied to clipboard!")
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(builder.email)
    setCopiedEmail(true)
    toast.success(`Copied ${builder.email}`)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleVouch = () => {
    const next = toggleBuilderVouch(builder.srn, builder.name)
    setVouchState(next)
    if (next.vouched) {
      toast.success(`You vouched for ${builder.name}! 🔥`)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <Link
        href="/team"
        className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" /> Back to full roster
      </Link>

      <div className="grid items-start gap-12 lg:grid-cols-[360px_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="mx-auto w-full max-w-sm"
        >
          <MemberCard
            name={builder.name}
            handle={builder.srn}
            domain={builder.domain}
            position={builder.position}
            branch={builder.branch}
            semester={builder.semester}
            bio={builder.bio}
            photoUrl={builder.photo_url}
            linkedin={builder.linkedin_url}
            github={builder.github_url}
            portfolio={builder.portfolio_url}
            email={builder.email}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: EASE_OUT }}
          className="space-y-8 rounded-3xl border border-white/10 bg-zinc-900/45 p-7 backdrop-blur-xl sm:p-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                <ShieldCheck className="size-3.5" /> Verified CraftRoster Builder
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                {builder.name}
              </h1>
              <p className="mt-1 font-mono text-sm text-zinc-400">
                {builder.srn} · {builder.domain}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleVouch}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${vouchState.vouched
                  ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                  : "border-white/15 bg-white/5 text-white hover:border-amber-400/40"
                  }`}
              >
                <Flame
                  className={`size-3.5 ${vouchState.vouched
                    ? "fill-amber-400 text-amber-400"
                    : "text-amber-400"
                    }`}
                />
                <span>
                  {vouchState.vouched ? "Vouched" : "Vouch"} ({vouchState.count})
                </span>
              </button>

              <button
                type="button"
                onClick={shareProfile}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-violet-500/40 hover:bg-white/10"
              >
                <Share2 className="size-3.5 text-violet-400" /> Share Link
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Builder Statement
            </h2>
            <p className="mt-2.5 text-base leading-relaxed text-zinc-200">
              {builder.bio}
            </p>
          </div>

          <div>
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              <Code2 className="size-3.5 text-violet-400" /> Stack & Craft
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Metrics Row: Experience, Availability & Proof-of-Work */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Briefcase className="size-3.5 text-violet-400" /> Experience
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {builder.semester}{" "}
                {Number(builder.semester) === 1 ? "Year" : "Years"} Shipping
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-zinc-400">Availability</p>
              <p className="mt-1 text-lg font-semibold text-emerald-300">
                {builder.position}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                <GitBranch className="size-3.5 text-cyan-400" />{" "}
                {ghStats ? `@${ghStats.username}` : "Community Vouches"}
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {ghStats
                  ? `${ghStats.public_repos} Public Repos`
                  : `${vouchState.count} Endorsements`}
              </p>
            </div>
          </div>

          {/* Dynamic Social Banner Preview & Download */}
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                <Sparkles className="size-3.5 text-violet-400" /> Shareable
                Social Banner (LinkedIn / X)
              </span>
              <a
                href={ogBannerUrl}
                download={`${builder.srn.replace(/^@/, "")}-craftroster-card.png`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/25"
              >
                <Download className="size-3.5" /> Download Banner
              </a>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ogBannerUrl}
                alt={`${builder.name} CraftRoster social banner`}
                className="aspect-[1200/630] w-full object-cover"
              />
            </div>
          </div>

          {/* Contact & External Links */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
            >
              {copiedEmail ? (
                <>
                  <Check className="size-3.5 text-emerald-600" /> Email Copied
                </>
              ) : (
                <>
                  <Mail className="size-3.5" /> Contact ({builder.email})
                </>
              )}
            </button>

            {builder.github_url && (
              <a
                href={builder.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-200 hover:border-white/30"
              >
                GitHub <ArrowUpRight className="size-3.5" />
              </a>
            )}
            {builder.linkedin_url && (
              <a
                href={builder.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-200 hover:border-white/30"
              >
                LinkedIn <ArrowUpRight className="size-3.5" />
              </a>
            )}
            {builder.portfolio_url && (
              <a
                href={builder.portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-200 hover:border-white/30"
              >
                Live Portfolio <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function BuilderProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ProfileContent />
    </Suspense>
  )
}