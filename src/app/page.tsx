// src/app/page.tsx
"use client"

import MagneticButton from "@/components/MagneticButton"
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
import { ArrowRight, Sparkles, ShieldCheck, Globe2, ChevronDown } from "lucide-react"
import { Poppins } from "next/font/google"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { DomainsSection } from "@/components/DomainsSection"
import { siteConfig } from "@/lib/siteConfig"

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500"] })

const rise = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.05, ease: EASE_OUT },
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
  const opacity = useTransform(progress, range, [0.2, 1])
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
      className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl"
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
    a: "Your image is compressed client-side into an lightweight WebP file (under 800px) before it ever touches our storage bucket—ensuring lightning-fast directory loads.",
  },
  {
    q: "Can I update or unpublish my card later?",
    a: "Yes! Curators can update your availability status or unpublish your card at any time from the moderation portal.",
  },
]

export default function Home() {
  const [count, setCount] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .then(({ count, error }) => {
        if (error || count === null || count === 0) {
          setCount(45) // Fallback so it never renders "–"
        } else {
          setCount(count)
        }
      })
  }, [])

  return (
    <div className="overflow-x-clip">
      <section
        className={`${poppins.className} mx-auto flex min-h-[calc(100svh-3rem)] max-w-6xl flex-col justify-end px-6 pb-14 pt-24`}
      >
        <motion.p
          {...rise(0)}
          className="text-xl font-light text-muted-foreground sm:text-2xl"
        >
          Verified Directory of
        </motion.p>

        <h1
          aria-label={siteConfig.name}
          className="-mt-1 flex text-[clamp(2.5rem,9vw,7.5rem)] font-normal leading-[0.95] tracking-tight"
        >
          {siteConfig.name.split("").map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, y: "40%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.04,
                ease: EASE_OUT,
              }}
              className="inline-block transition-[translate,color] duration-200 ease-out hover:-translate-y-2 hover:text-[oklch(0.78_0.16_55)]"
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          {...rise(9)}
          className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-xl"
        >
          {siteConfig.tagline}
        </motion.p>

        <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <motion.div {...rise(11)} className="flex items-center gap-6">
            <MagneticButton>
              <Link
                href="/register"
                className="btn-sweep press inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-[1.04] active:scale-[0.95]"
              >
                Claim Your Card
              </Link>
            </MagneticButton>
            <Link
              href="/team"
              className="group inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-foreground"
            >
              Explore Roster
              <ArrowRight className="size-4 transition-[translate,color] duration-200 ease-out group-hover:translate-x-1.5 group-hover:text-[oklch(0.78_0.16_55)]" />
            </Link>
          </motion.div>

          <motion.div {...rise(12)} className="md:text-right">
            <p className="text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
              {count === null ? (
                <span className="inline-block h-14 w-24 animate-pulse rounded-2xl bg-white/10 align-middle" />
              ) : (
                <>
                  <CountUpTicker target={count} />+
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              verified builders & counting
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tilted domain strip */}
      <div className="-rotate-1 border-y border-white/10 py-5">
        <div className="marquee flex w-max gap-12 text-2xl font-medium tracking-tight text-foreground/70 sm:text-3xl">
          {[...siteConfig.domains, ...siteConfig.domains].map((d, i) => (
            <span key={i} className="whitespace-nowrap">
              {d} <span className="ml-12 text-[oklch(0.78_0.16_55)]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scroll-reveal statement */}
      <section className="mx-auto max-w-6xl px-6 py-32 md:py-44">
        <p className="mb-8 text-sm text-muted-foreground">About the platform</p>
        <Statement text="CraftRoster connects top-tier engineers, designers, and creators worldwide. Build your custom profile card, get verified by curators, and get discovered by teams looking for standout talent." />
      </section>

      {/* Interactive Bento Grid */}
      <DomainsSection />

      {/* 3-Step How It Works Section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.78_0.16_55)]">
            Workflow
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            How verification works<span className="text-[oklch(0.78_0.16_55)]">.</span>
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
              className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-card p-8"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-background text-[oklch(0.78_0.16_55)]">
                  <s.icon className="size-5" />
                </span>
                <span className="font-mono text-2xl font-semibold text-foreground/25">
                  {s.step}
                </span>
              </div>
              <div className="mt-10">
                <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Frequently asked questions<span className="text-[oklch(0.78_0.16_55)]">.</span>
        </h2>
        <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-card px-6">
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
                    className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180 text-foreground" : ""
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
                      <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
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