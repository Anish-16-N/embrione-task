// src/app/page.tsx
"use client"

import MagneticButton from "@/components/MagneticButton"
import MemberCard from "@/components/MemberCard"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe2,
  ChevronDown,
  Terminal,
} from "lucide-react"
import { Space_Grotesk } from "next/font/google"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { DomainsSection } from "@/components/DomainsSection"
import { siteConfig } from "@/lib/siteConfig"
import {
  SHOWCASE_PROFILES,
  filterValidCraftRosterMembers,
} from "@/lib/showcaseProfiles"
import type { Member } from "@/lib/types"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

const rise = (i: number) => ({
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.45, delay: i * 0.06, ease: EASE_OUT },
})

function CountUpTicker({ target }: { target: number }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v))
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) {
      mv.set(target)
      return
    }
    const controls = animate(mv, target, { duration: 1.1, ease: EASE_OUT })
    return () => controls.stop()
  }, [target, mv, reduce])

  return <motion.span>{rounded}</motion.span>
}

function Word({
  children,
  range,
  progress,
}: {
  children: string
  range: [number, number]
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  )
}

function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  })
  const words = text.split(" ")
  return (
    <p
      ref={ref}
      className={`${spaceGrotesk.className} text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl`}
    >
      {words.map((w, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return (
          <Word key={i} range={[start, end]} progress={scrollYProgress}>
            {w}
          </Word>
        )
      })}
    </p>
  )
}

const STEPS = [
  {
    step: "01",
    title: "Craft Your Card",
    description:
      "Customize your builder card with a live interactive preview. Your profile photo is automatically compressed to WebP right in your browser.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Get Verified",
    description:
      "Our curators review your GitHub, portfolio, or LinkedIn to keep the directory signal-to-noise ratio high and spam-free.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Get Discovered",
    description:
      "Go live on the public roster with a shareable profile link, domain badges, and one-click contact for founders and recruiters.",
    icon: Globe2,
  },
]

const FAQS = [
  {
    q: "Who can claim a card on CraftRoster?",
    a: "Any developer, designer, product builder, or operator shipping real projects. Whether you are open to full-time roles, freelancing, or building your own startup, you can claim a card.",
  },
  {
    q: "How long does profile verification take?",
    a: "Curators review pending submissions daily. You can check your live verification status anytime on the Claim Your Card page using your unique @handle.",
  },
  {
    q: "How is my profile photo handled?",
    a: "Your image is compressed client-side into a lightweight WebP file (under 800px) before it ever touches our storage bucket—ensuring lightning-fast directory loads.",
  },
  {
    q: "Can I update or unpublish my card later?",
    a: "Yes! Curators can update your availability status or unpublish your card at any time from the moderation portal.",
  },
]

export default function Home() {
  const [builders, setBuilders] = useState<Member[]>(SHOWCASE_PROFILES)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    supabase
      .from("members")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setBuilders(filterValidCraftRosterMembers(data as Member[]))
        }
      })
  }, [])

  const featuredBuilders = builders.slice(0, 3)

  return (
    <div className="overflow-x-clip">
      {/* HERO SECTION */}
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl flex-col justify-center px-6 pb-16 pt-16">
        <motion.div {...rise(0)} className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-200 backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-violet-400" />
            </span>
            Verified Builder & Talent Directory
          </span>
        </motion.div>

        {/* Giant Interactive CraftRoster Title */}
        <h1
          aria-label={siteConfig.name}
          className={`${spaceGrotesk.className} flex flex-wrap text-[clamp(3.2rem,10vw,8.2rem)] font-bold leading-[0.92] tracking-tight`}
        >
          {siteConfig.name.split("").map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, y: "35%", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.45,
                delay: 0.05 + i * 0.035,
                ease: EASE_OUT,
              }}
              className={`inline-block cursor-default transition-transform duration-200 ease-out hover:-translate-y-2 ${i >= 5
                  ? "bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
                  : "text-white hover:text-violet-300"
                }`}
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          {...rise(2)}
          className={`${spaceGrotesk.className} mt-4 max-w-3xl text-2xl font-medium tracking-tight text-zinc-200 sm:text-4xl`}
        >
          Where standout builders craft their proof of work.
        </motion.p>

        <motion.p
          {...rise(3)}
          className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          {siteConfig.tagline} Claim your interactive profile card, get verified
          by curators, and stand out to founders and engineering teams.
        </motion.p>

        <div className="mt-12 flex flex-col gap-10 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <motion.div {...rise(4)} className="flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <Sparkles className="size-4 text-violet-600" />
                Claim Your Card
              </Link>
            </MagneticButton>
            <Link
              href="/team"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-zinc-200 backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/[0.07]"
            >
              Explore Roster
              <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Live Synced Counter + Avatar Stack */}
          <motion.div {...rise(5)} className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {builders.slice(0, 4).map((b) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={b.id}
                  src={b.photo_url}
                  alt={b.name}
                  className="size-10 rounded-full border-2 border-[#05060b] object-cover"
                />
              ))}
            </div>
            <div>
              <p
                className={`${spaceGrotesk.className} text-3xl font-bold tabular-nums tracking-tight text-white sm:text-4xl`}
              >
                <CountUpTicker target={builders.length} />+
              </p>
              <p className="text-xs text-zinc-400">
                verified builders live on roster
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tilted domain strip */}
      <div className="-rotate-1 border-y border-white/10 bg-white/[0.015] py-5 backdrop-blur-sm">
        <div
          className={`${spaceGrotesk.className} marquee flex w-max gap-12 text-2xl font-medium tracking-tight text-zinc-300 sm:text-3xl`}
        >
          {[...siteConfig.domains, ...siteConfig.domains].map((d, i) => (
            <span key={i} className="whitespace-nowrap">
              {d} <span className="ml-12 text-violet-400">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED BUILDERS SHOWCASE */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              <Terminal className="size-3.5" /> Live Directory Preview
            </p>
            <h2
              className={`${spaceGrotesk.className} mt-2 text-3xl font-bold tracking-tight sm:text-5xl`}
            >
              Featured builders on the roster.
            </h2>
          </div>
          <Link
            href="/team"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-violet-200"
          >
            View all {builders.length} verified profiles
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBuilders.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.35,
                delay: idx * 0.08,
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
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scroll-reveal statement */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-36">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Why CraftRoster
        </p>
        <Statement text="Traditional resumes are static and noisy. CraftRoster gives engineers, designers, and creators a living proof-of-work card verified by human curators." />
      </section>

      {/* Interactive Bento Grid */}
      <DomainsSection />

      {/* 3-Step How It Works Section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Workflow
          </p>
          <h2
            className={`${spaceGrotesk.className} mt-2 text-3xl font-bold tracking-tight sm:text-5xl`}
          >
            How verification works<span className="text-violet-400">.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: idx * 0.08, ease: EASE_OUT }}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-md transition-colors hover:border-violet-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                  <s.icon className="size-5" />
                </span>
                <span className="font-mono text-2xl font-semibold text-white/20">
                  {s.step}
                </span>
              </div>
              <div className="mt-10">
                <h3
                  className={`${spaceGrotesk.className} text-xl font-semibold tracking-tight`}
                >
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <h2
          className={`${spaceGrotesk.className} text-3xl font-bold tracking-tight sm:text-5xl`}
        >
          Frequently asked questions<span className="text-violet-400">.</span>
        </h2>
        <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-zinc-900/40 px-6 backdrop-blur-md">
          {FAQS.map((item, i) => {
            const isOpen = openFaq === i
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left text-base font-medium sm:text-lg"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-violet-400" : ""
                      }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-sm leading-relaxed text-zinc-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}