// src/components/VerificationWorkflow.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
    Sparkles,
    ShieldCheck,
    Globe,
    ArrowDown,
    Zap,
    Check,
    ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { EASE_OUT, SNAPPY_SPRING } from "@/lib/motion"

type StepId = 1 | 2 | 3

const PRISM_THEMES = [
    {
        name: "Violet Prism",
        dot: "bg-violet-500",
        ring: "ring-violet-400",
        badge: "text-violet-300",
        avatarBg: "bg-violet-500/20 border-violet-500/40 text-violet-200",
        bar: "from-violet-500 via-cyan-400 to-emerald-400",
    },
    {
        name: "Cyan Aurora",
        dot: "bg-cyan-400",
        ring: "ring-cyan-300",
        badge: "text-cyan-300",
        avatarBg: "bg-cyan-500/20 border-cyan-500/40 text-cyan-200",
        bar: "from-cyan-400 via-teal-400 to-emerald-400",
    },
    {
        name: "Emerald Signal",
        dot: "bg-emerald-400",
        ring: "ring-emerald-300",
        badge: "text-emerald-300",
        avatarBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-200",
        bar: "from-emerald-400 via-cyan-400 to-violet-500",
    },
]

const COMMIT_BARS = [
    { h: "h-3.5", color: "bg-cyan-900/70" },
    { h: "h-6", color: "bg-cyan-600/80" },
    { h: "h-8", color: "bg-cyan-400" },
    { h: "h-4.5", color: "bg-violet-500/85" },
    { h: "h-7", color: "bg-cyan-400/90" },
    { h: "h-4", color: "bg-emerald-500/80" },
    { h: "h-4.5", color: "bg-cyan-500/75" },
    { h: "h-5", color: "bg-violet-500/80" },
    { h: "h-4.5", color: "bg-emerald-400/85" },
    { h: "h-7", color: "bg-cyan-400" },
]

const STEP_DESCRIPTIONS: Record<StepId, string> = {
    1: "Craft Your Card — Live interactive 3D builder card with client-side WebP portrait compression...",
    2: "Get Verified — Curators audit your GitHub, portfolio & proof-of-work to keep signal at 99.8%...",
    3: "Get Discovered — Public builder profile live with domain badges & 1-click founder contact...",
}

export default function VerificationWorkflow() {
    const [activeStep, setActiveStep] = useState<StepId>(3)
    const [autoOrbit, setAutoOrbit] = useState(true)
    const [prismIdx, setPrismIdx] = useState(0)
    const [liveViews, setLiveViews] = useState(419)

    useEffect(() => {
        if (!autoOrbit) return
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev === 3 ? 1 : ((prev + 1) as StepId)))
        }, 4200)
        return () => clearInterval(timer)
    }, [autoOrbit])

    useEffect(() => {
        const timer = setInterval(() => {
            setLiveViews((v) => (v >= 499 ? 419 : v + 1))
        }, 2800)
        return () => clearInterval(timer)
    }, [])

    const activePrism = PRISM_THEMES[prismIdx]

    return (
        <section className="relative mx-auto max-w-5xl px-5 py-20 sm:px-6 md:py-28">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-25"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                }}
            />

            <div className="max-w-3xl">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">
                    Workflow
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                    How verification works<span className="text-violet-500">.</span>
                </h2>
            </div>

            {/* Interactive Control Console Bar with Spring layoutId Indicator */}
            <div className="surface-glass mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/85 p-2.5 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/90 p-1">
                        <button
                            type="button"
                            onClick={() => setAutoOrbit((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white"
                        >
                            <span
                                className={`size-2 rounded-full transition-colors duration-200 ${autoOrbit
                                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                                    : "bg-zinc-600"
                                    }`}
                            />
                            Auto Orbit
                        </button>

                        {([1, 2, 3] as const).map((step) => {
                            const isActive = activeStep === step
                            return (
                                <button
                                    key={step}
                                    type="button"
                                    onClick={() => {
                                        setActiveStep(step)
                                        setAutoOrbit(false)
                                    }}
                                    className={`relative rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${isActive ? "text-white" : "text-zinc-400 hover:text-white"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="workflow-step-pill"
                                            transition={SNAPPY_SPRING}
                                            className="absolute inset-0 rounded-lg border border-white/20 bg-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                                        />
                                    )}
                                    <span className="relative z-10 tabular-nums">0{step}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-1.5 font-mono text-xs text-zinc-400 sm:inline-flex">
                        <span>NODE</span>
                        <span className="tabular-nums text-violet-300">
                            0{activeStep} / 03
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-emerald-300">ACTIVE</span>
                    </div>
                </div>

                <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-emerald-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_25px_rgba(52,211,153,0.28)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
                >
                    <Sparkles className="size-3.5" /> Claim Your Card
                    <ArrowRight className="size-3.5" />
                </Link>
            </div>

            {/* Telemetry Status Strip with Emil Kowalski Blur-Morph Text Transition */}
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider tabular-nums text-emerald-300">
                        PRISM NODE 0{activeStep} · ELEVATED
                    </span>

                    <div className="relative min-h-[20px] flex-1 overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={activeStep}
                                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                                transition={{ duration: 0.2, ease: EASE_OUT }}
                                className="block line-clamp-1 font-mono text-xs text-zinc-300"
                            >
                                {STEP_DESCRIPTIONS[activeStep]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
                    <span>
                        3D PERSPECTIVE:{" "}
                        <strong className="text-violet-300">1400PX ISOMETRIC</strong>
                    </span>
                    <span>·</span>
                    <span>Click or hover any monolith to focus</span>
                </div>
            </div>

            {/* Vertical Stack of 3 Monolith Cards */}
            <div className="mt-10 space-y-0">
                {/* ==================== MONOLITH 01 ==================== */}
                <motion.div
                    onMouseEnter={() => setActiveStep(1)}
                    onClick={() => setActiveStep(1)}
                    animate={{
                        scale: activeStep === 1 ? 1.008 : 1,
                        y: activeStep === 1 ? -2 : 0,
                    }}
                    transition={{ duration: 0.24, ease: EASE_OUT }}
                    className={`surface-glass relative cursor-pointer rounded-3xl border p-6 transition-colors duration-200 sm:p-9 ${activeStep === 1
                        ? "border-violet-500/45 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-violet-950/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_25px_70px_rgba(139,92,246,0.18)]"
                        : "border-white/10 bg-zinc-950/80 hover:border-white/20"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="grid size-12 place-items-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                            <Sparkles className="size-5" />
                        </div>
                        <span className="font-mono text-3xl font-bold tracking-tight tabular-nums text-zinc-700 sm:text-4xl">
                            01
                        </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/55 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                                <span className="size-2 rounded-full bg-violet-400" />
                                LIVE BUILDER PREVIEW
                            </span>

                            <div className="flex items-center gap-2">
                                {PRISM_THEMES.map((theme, idx) => (
                                    <button
                                        key={theme.name}
                                        type="button"
                                        aria-label={`Select ${theme.name}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setPrismIdx(idx)
                                        }}
                                        className={`size-4 rounded-full transition-transform duration-150 ${theme.dot
                                            } ${prismIdx === idx
                                                ? `scale-110 ring-2 ${theme.ring} ring-offset-2 ring-offset-black`
                                                : "opacity-60 hover:opacity-100"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/75 p-3.5">
                            <div className="flex items-center gap-3.5">
                                <div className="relative">
                                    <div
                                        className={`grid size-12 place-items-center rounded-xl border font-bold transition-colors duration-200 ${activePrism.avatarBg}`}
                                    >
                                        AK
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 rounded bg-emerald-400 px-1.5 py-0.2 font-mono text-[9px] font-bold text-zinc-950">
                                        WebP
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Aarav Kulkarni</p>
                                    <p className="text-xs text-zinc-400">
                                        Staff Systems & AI Builder
                                    </p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={activePrism.name}
                                    initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
                                    transition={{ duration: 0.16, ease: EASE_OUT }}
                                    className={`font-mono text-xs font-medium ${activePrism.badge}`}
                                >
                                    {activePrism.name}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <div className="mt-3 rounded-xl border border-white/10 bg-zinc-900/50 p-3">
                            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                                <span className="text-zinc-400">RAW 2.4MB → 58KB WEBP</span>
                                <span className="font-semibold text-emerald-400">● -97%</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                    className={`h-full w-[97%] rounded-full bg-gradient-to-r ${activePrism.bar}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-7">
                        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Craft Your Card
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                            Customize your builder card with a live interactive preview. Your
                            profile photo is automatically compressed to WebP right in your
                            browser.
                        </p>
                    </div>
                </motion.div>

                {/* Glowing Diamond Node Connector 1 -> 2 */}
                <div className="relative flex flex-col items-center py-3">
                    <div className="grid size-9 place-items-center rounded-full border border-white/15 bg-zinc-900 text-zinc-400 shadow-lg">
                        <ArrowDown className="size-4" />
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                        <div className="grid size-12 rotate-45 place-items-center rounded-lg border border-violet-500/40 bg-violet-950/40 shadow-[0_0_30px_rgba(139,92,246,0.45)]">
                            <div className="size-4 rounded-sm bg-violet-400 shadow-[0_0_12px_#a78bfa]" />
                        </div>
                    </div>
                </div>

                {/* ==================== MONOLITH 02 ==================== */}
                <motion.div
                    onMouseEnter={() => setActiveStep(2)}
                    onClick={() => setActiveStep(2)}
                    animate={{
                        scale: activeStep === 2 ? 1.008 : 1,
                        y: activeStep === 2 ? -2 : 0,
                    }}
                    transition={{ duration: 0.24, ease: EASE_OUT }}
                    className={`surface-glass relative cursor-pointer rounded-3xl border p-6 transition-colors duration-200 sm:p-9 ${activeStep === 2
                        ? "border-cyan-500/45 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-cyan-950/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_25px_70px_rgba(34,211,238,0.14)]"
                        : "border-white/10 bg-zinc-950/80 hover:border-white/20"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="grid size-12 place-items-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                            <ShieldCheck className="size-5" />
                        </div>
                        <span className="font-mono text-3xl font-bold tracking-tight tabular-nums text-zinc-700 sm:text-4xl">
                            02
                        </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/55 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-5">
                        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                            <span className="size-2 rounded-full bg-cyan-400" />
                            GITHUB · PORTFOLIO · 99.8% SIGNAL
                        </div>

                        <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900/75 p-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-zinc-400">
                                    Proof-of-Work Commit Graph
                                </span>
                                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-cyan-300">
                                    <Check className="size-3.5" /> Verified
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-10 items-end gap-1.5 sm:gap-2">
                                {COMMIT_BARS.map((bar, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scaleY: 0.4, opacity: 0.5 }}
                                        whileInView={{ scaleY: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.35,
                                            delay: i * 0.035,
                                            ease: EASE_OUT,
                                        }}
                                        style={{ originY: 1 }}
                                        className={`w-full rounded-sm ${bar.h} ${bar.color}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/25 bg-cyan-950/20 px-3.5 py-2.5 font-mono text-[11px] tabular-nums">
                            <span className="text-zinc-300">CURATOR AUDIT STATUS</span>
                            <span className="font-semibold text-emerald-300">
                                0.0% SPAM · APPROVED
                            </span>
                        </div>
                    </div>

                    <div className="mt-7">
                        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Get Verified
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                            Our curators review your GitHub, portfolio, or LinkedIn to keep
                            the directory signal-to-noise ratio high and spam-free.
                        </p>
                    </div>
                </motion.div>

                {/* Glowing Diamond Node Connector 2 -> 3 */}
                <div className="relative flex flex-col items-center py-3">
                    <div className="grid size-9 place-items-center rounded-full border border-white/15 bg-zinc-900 text-zinc-400 shadow-lg">
                        <ArrowDown className="size-4" />
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                        <div className="grid size-8 rotate-45 place-items-center rounded-md border border-white/20 bg-zinc-900">
                            <div className="size-2.5 rounded-xs bg-zinc-400" />
                        </div>
                    </div>
                </div>

                {/* ==================== MONOLITH 03 ==================== */}
                <motion.div
                    onMouseEnter={() => setActiveStep(3)}
                    onClick={() => setActiveStep(3)}
                    animate={{
                        scale: activeStep === 3 ? 1.008 : 1,
                        y: activeStep === 3 ? -2 : 0,
                    }}
                    transition={{ duration: 0.24, ease: EASE_OUT }}
                    className={`surface-glass relative cursor-pointer rounded-3xl border p-6 transition-colors duration-200 sm:p-9 ${activeStep === 3
                        ? "border-emerald-500/45 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-emerald-950/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_25px_70px_rgba(16,185,129,0.15)]"
                        : "border-white/10 bg-zinc-950/80 hover:border-white/20"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="grid size-12 place-items-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                            <Globe className="size-5" />
                        </div>
                        <span className="font-mono text-3xl font-bold tracking-tight tabular-nums text-zinc-700 sm:text-4xl">
                            03
                        </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/55 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 font-mono text-xs">
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                                <span className="text-zinc-300">
                                    craftroster.app/u/
                                    <span className="font-semibold text-emerald-400">
                                        verified
                                    </span>{" "}
                                    · LIVE
                                </span>
                            </div>
                            <span className="tabular-nums text-zinc-400">
                                <strong className="text-white">{liveViews}</strong> views
                            </span>
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
                                ★ Top 1% Roster
                            </span>
                            <span className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs font-semibold text-violet-300">
                                AI · Full-Stack
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                toast.success(
                                    "1-Click Founder Contact copies builder email or opens direct intro!"
                                )
                            }}
                            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-950/80 via-teal-900/60 to-emerald-950/80 font-mono text-xs font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:border-emerald-400/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] active:scale-[0.98]"
                        >
                            <Zap className="size-3.5 text-emerald-400" /> 1-Click Founder
                            Contact
                        </button>
                    </div>

                    <div className="mt-7">
                        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Get Discovered
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                            Go live on the public roster with a shareable profile link, domain
                            badges, and one-click contact for founders and recruiters.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}