"use client"

import MagneticButton from "@/components/MagneticButton"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { ArrowRight } from "lucide-react"
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

function Word({ children, range, progress }: { children: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.2, 1])
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  )
}

function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] })
  const words = text.split(" ")
  return (
    <p ref={ref} className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
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

export default function Home() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .then(({ count }) => setCount(count))
  }, [])

  return (
    <div className="overflow-x-clip">
      <section className={`${poppins.className} mx-auto flex min-h-[calc(100svh-3rem)] max-w-6xl flex-col justify-end px-6 pb-14 pt-24`}>
        <motion.p {...rise(0)} className="text-xl font-light text-muted-foreground sm:text-2xl">
          Verified Directory of
        </motion.p>

        <h1 aria-label={siteConfig.name} className="-mt-1 flex text-[clamp(2.5rem,9vw,7.5rem)] font-normal leading-[0.95] tracking-tight">
          {siteConfig.name.split("").map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, y: "40%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.04, ease: EASE_OUT }}
              className="inline-block transition-[translate,color] duration-200 ease-out hover:-translate-y-2 hover:text-[oklch(0.78_0.16_55)]"
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p {...rise(9)} className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-xl">
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
            <Link href="/team" className="group inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-foreground">
              Explore Roster
              <ArrowRight className="size-4 transition-[translate,color] duration-200 ease-out group-hover:translate-x-1.5 group-hover:text-[oklch(0.78_0.16_55)]" />
            </Link>
          </motion.div>

          <motion.div {...rise(12)} className="md:text-right">
            <p className="text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">{count ?? "–"}</p>
            <p className="mt-1 text-sm text-muted-foreground">verified builders & counting</p>
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
      <section className="mx-auto max-w-6xl px-6 py-32 md:py-48">
        <p className="mb-8 text-sm text-muted-foreground">About the platform</p>
        <Statement text="CraftRoster connects top-tier engineers, designers, and creators worldwide. Build your custom profile card, submit for verification, and get discovered by teams looking for world-class talent." />
      </section>
      <DomainsSection />
    </div>
  )
}