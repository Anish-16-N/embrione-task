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
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import {
  SHOWCASE_PROFILES,
  filterValidCraftRosterMembers,
} from "@/lib/showcaseProfiles"
import type { Member } from "@/lib/types"
import MemberCard from "@/components/MemberCard"

const spaceGrotesk = { className: "" }

function ProfileContent() {
  const params = useParams<{ handle: string }>()
  const rawHandle = decodeURIComponent(params?.handle || "")
  const normalizedHandle = rawHandle.startsWith("@")
    ? rawHandle.toLowerCase()
    : `@${rawHandle.toLowerCase()}`

  const [builder, setBuilder] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState(false)

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
        <h1 className={`${spaceGrotesk.className} text-4xl font-bold`}>
          Builder not found
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          No verified profile matches <span className="font-mono">{normalizedHandle}</span>.
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
              <h1
                className={`${spaceGrotesk.className} mt-3 text-4xl font-bold tracking-tight sm:text-5xl`}
              >
                {builder.name}
              </h1>
              <p className="mt-1 font-mono text-sm text-zinc-400">
                {builder.srn} · {builder.domain}
              </p>
            </div>

            <button
              type="button"
              onClick={shareProfile}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-violet-500/40 hover:bg-white/10"
            >
              <Share2 className="size-3.5 text-violet-400" /> Share Profile
            </button>
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

          <div className="grid gap-4 sm:grid-cols-2">
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
              <p className="text-xs text-zinc-400">Current Availability</p>
              <p className="mt-1 text-lg font-semibold text-emerald-300">
                {builder.position}
              </p>
            </div>
          </div>

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