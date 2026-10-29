// src/components/VerificationWorkflow.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
    Sparkles,
    ShieldCheck,
    Globe,
    CheckCircle2,
    ArrowUpRight,
    Copy,
    Check,
    Flame,
    Bookmark,
    Zap,
    Terminal,
} from "lucide-react"
import { toast } from "sonner"
import { EASE_OUT, SNAPPY_SPRING } from "@/lib/motion"

type StepId = 0 | 1 | 2

const STEPS = [
    {
        id: 0 as StepId,
        number: "01",
        title: "Auto-fill from GitHub in 10 seconds",
        subtitle: "Frictionless onboarding",
        description:
            "Pull your bio, avatar, and repositories in one click. Portraits are automatically compressed to ultra-light WebP directly in your browser.",
        icon: Sparkles,
        accent: "text-violet-400",
    },
    {
        id: 1 as StepId,
        number: "02",
        title: "Curated proof-of-work verification",
        subtitle: "High signal, zero noise",
        description:
            "Every submission is reviewed against real GitHub commit history, shipped deployments, and domain expertise before going live.",
        icon: ShieldCheck,
        accent: "text-cyan-400",
    },
    {
        id: 2 as StepId,
        number: "03",
        title: "Go live with a shareable builder URL",
        subtitle: "Direct founder & recruiter access",
        description:
            "Get a dedicated /u/handle portfolio, dynamic OpenGraph social banners, community vouches, and 1-click recruiter shortlisting.",
        icon: Globe,
        accent: "text-emerald-400",
    },
]

export default function VerificationWorkflow() {
    const [active, setActive] = useState<StepId>(0)
    const [paused, setPaused] = useState(false)
    const [copied, setCopied] = useState(false)
    const [vouched, setVouched] = useState(false)
    const [shortlisted, setShortlisted] = useState(true)

    useEffect(() => {
        if (paused) return
        const timer = setInterval(() => {
            setActive((prev) => ((prev + 1) % 3) as StepId)
        }, 5500)
        return () => clearInterval(timer)
    }, [paused])

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("aarav@craftroster.dev")
        setCopied(true)
        toast.success("Copied aarav@craftroster.dev to clipboard")
        setTimeout(() => setCopied(false), 1800)
    }

    return (
        <section
            className="mx-auto max-w-6xl px-6 py-24"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Header Row */}
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                        <Terminal className="size-3.5" /> Verification Pipeline
                    </div>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Built for signal, not noise<span className="text-violet-400">.</span>
                    </h2>
                    <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                        Three steps from raw GitHub handle to a verified, recruiter-ready
                        builder card.
                    </p>
                </div>

                <Link
                    href="/register"
                    className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 text-xs font-semibold text-zinc-950 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.97] md:self-auto"
                >
                    Claim Your Card <ArrowUpRight className="size-3.5" />
                </Link>
            </div>

            {/* Main Split Bento Container */}
            <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-stretch">
                {/* Left Column: 3 Interactive Step Selectors (5 cols) */}
                <div className="flex flex-col justify-between gap-3 lg:col-span-5">
                    {STEPS.map((step) => {
                        const Icon = step.icon
                        const isActive = active === step.id
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setActive(step.id)}
                                className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 ${isActive
                                        ? "border-white/20 bg-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]"
                                        : "border-white/8 bg-zinc-950/50 opacity-65 hover:border-white/15 hover:opacity-100"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-workflow-accent"
                                        transition={SNAPPY_SPRING}
                                        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-400 via-cyan-400 to-emerald-400"
                                    />
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 ${isActive ? step.accent : "text-zinc-400"
                                                }`}
                                        >
                                            <Icon className="size-4" />
                                        </span>
                                        <span className="text-xs font-medium text-zinc-400">
                                            {step.subtitle}
                                        </span>
                                    </div>
                                    <span
                                        className={`font-mono text-xs font-semibold tabular-nums ${isActive ? "text-white" : "text-zinc-600"
                                            }`}
                                    >
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-base font-semibold tracking-tight text-white sm:text-lg">
                                    {step.title}
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                                    {step.description}
                                </p>
                            </button>
                        )
                    })}
                </div>

                {/* Right Column: Unified Interactive Stage (7 cols) */}
                <div className="surface-glass relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-zinc-950/90 p-6 sm:p-8 lg:col-span-7">
                    {/* Subtle Ambient Radial Glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-violet-500/15 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-emerald-500/10 blur-3xl"
                    />

                    {/* Top Window Chrome Bar */}
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full bg-zinc-700" />
                            <span className="size-2.5 rounded-full bg-zinc-700" />
                            <span className="size-2.5 rounded-full bg-zinc-700" />
                            <span className="ml-2 font-mono text-xs text-zinc-400">
                                {active === 0 && "craftroster.app/register"}
                                {active === 1 && "craftroster.app/admin/audit"}
                                {active === 2 && "craftroster.app/u/aarav"}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {([0, 1, 2] as const).map((idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    aria-label={`Go to step ${idx + 1}`}
                                    onClick={() => setActive(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${active === idx
                                            ? "w-6 bg-white"
                                            : "w-1.5 bg-white/20 hover:bg-white/40"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Animated Stage Body */}
                    <div className="relative z-10 my-auto py-6">
                        <AnimatePresence mode="wait" initial={false}>
                            {/* ==================== STAGE 01: GITHUB AUTO-FILL & WEBP ==================== */}
                            {active === 0 && (
                                <motion.div
                                    key="stage-0"
                                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                                    transition={{ duration: 0.24, ease: EASE_OUT }}
                                    className="space-y-4"
                                >
                                    {/* Simulated GitHub Importer Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-white">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="size-4"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-white">
                                                    github.com/aaravkulkarni
                                                </p>
                                                <p className="text-[11px] text-violet-200/80">
                                                    Synced bio, avatar, 42 public repos & primary language
                                                </p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-300">
                                            <Check className="size-3" /> Auto-filled in 140ms
                                        </span>
                                    </div>

                                    {/* Live Generated Profile Preview */}
                                    <div className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="relative">
                                                    <div className="grid size-14 place-items-center rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-base font-bold text-white">
                                                        AK
                                                    </div>
                                                    <span className="absolute -bottom-1 -right-1 rounded-md bg-emerald-400 px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-950">
                                                        WebP
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-white">
                                                            Aarav Kulkarni
                                                        </h4>
                                                        <span className="font-mono text-xs text-violet-300">
                                                            @aarav
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400">
                                                        AI & Distributed Systems · Open to Founding Eng
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {["Next.js", "Rust", "PyTorch", "Supabase"].map(
                                                            (chip) => (
                                                                <span
                                                                    key={chip}
                                                                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
                                                                >
                                                                    {chip}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client-Side WebP Compression Pill */}
                                        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/8 bg-zinc-950/80 px-3.5 py-2.5 font-mono text-[11px]">
                                            <span className="text-zinc-400">
                                                Portrait optimized in browser:{" "}
                                                <strong className="text-zinc-200">
                                                    2.4 MB → 58 KB
                                                </strong>
                                            </span>
                                            <span className="font-semibold text-emerald-400">
                                                -97% size ⚡
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ==================== STAGE 02: CURATOR PROOF-OF-WORK AUDIT ==================== */}
                            {active === 1 && (
                                <motion.div
                                    key="stage-1"
                                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                                    transition={{ duration: 0.24, ease: EASE_OUT }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <ShieldCheck className="size-4 text-cyan-300" />
                                            <span className="text-xs font-semibold text-white">
                                                Proof-of-Work Signal Audit
                                            </span>
                                        </div>
                                        <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">
                                            4 / 4 Checks Passed
                                        </span>
                                    </div>

                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                        {[
                                            {
                                                label: "GitHub Commit Graph",
                                                detail: "412 contributions · Active last 7d",
                                                badge: "Verified",
                                            },
                                            {
                                                label: "Production Deployments",
                                                detail: "2 live URLs returning HTTP 200",
                                                badge: "Live",
                                            },
                                            {
                                                label: "Domain & Stack Tagging",
                                                detail: "AI & Systems · 4 core skills indexed",
                                                badge: "Indexed",
                                            },
                                            {
                                                label: "Curator Manual Review",
                                                detail: "Approved via Supabase Auth portal",
                                                badge: "Approved",
                                            },
                                        ].map((check) => (
                                            <div
                                                key={check.label}
                                                className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                                                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                                                        {check.label}
                                                    </span>
                                                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                                                        {check.badge}
                                                    </span>
                                                </div>
                                                <p className="mt-1.5 text-xs text-zinc-400">
                                                    {check.detail}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ==================== STAGE 03: LIVE RECRUITER DISCOVERY ==================== */}
                            {active === 2 && (
                                <motion.div
                                    key="stage-2"
                                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                                    transition={{ duration: 0.24, ease: EASE_OUT }}
                                    className="space-y-4"
                                >
                                    <div className="rounded-2xl border border-white/12 bg-zinc-900/80 p-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="grid size-12 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 font-bold text-emerald-200">
                                                    AK
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-white">
                                                            Aarav Kulkarni
                                                        </h4>
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                                            <CheckCircle2 className="size-3" /> Verified
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400">
                                                        Staff Systems & AI Builder · Bengaluru
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Interactive Vouch & Shortlist Toggles */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setVouched((v) => !v)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold tabular-nums transition-colors ${vouched
                                                            ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                                                            : "border-white/12 bg-white/5 text-zinc-300 hover:text-white"
                                                        }`}
                                                >
                                                    <Flame className="size-3.5 text-amber-400" />
                                                    {vouched ? 29 : 28}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setShortlisted((s) => !s)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${shortlisted
                                                            ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                                                            : "border-white/12 bg-white/5 text-zinc-300 hover:text-white"
                                                        }`}
                                                >
                                                    <Bookmark className="size-3.5" />
                                                    {shortlisted ? "Shortlisted" : "Shortlist"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Interactive Recruiter Action Row */}
                                        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={handleCopyEmail}
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="size-3.5 text-emerald-600" />{" "}
                                                        Email Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="size-3.5" /> Copy Founder Intro
                                                        Email
                                                    </>
                                                )}
                                            </button>

                                            <Link
                                                href="/team"
                                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 text-xs font-medium text-zinc-200 hover:bg-white/10"
                                            >
                                                <Zap className="size-3.5 text-violet-400" /> Explore
                                                Live Roster
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Stage Footer */}
                    <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500">
                        <span>
                            {paused ? "⏸ Paused on hover" : "▶ Auto-cycling workflow"}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400">
                            Click any step on the left to inspect
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}