'use client'

import type { CSSProperties, PointerEvent } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useReducedMotion } from 'motion/react'
import {
    Bot,
    Code2,
    Compass,
    Cpu,
    Layers,
    Megaphone,
    Palette,
    Smartphone,
    ArrowUpRight,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const EASE = [0.23, 1, 0.32, 1] as const
const SPOTLIGHT_SIZE = 320

type Domain = {
    name: string
    description: string
    stack: string
    icon: LucideIcon
    size: 'lg' | 'wide' | 'sm'
}

const DOMAINS: Domain[] = [
    {
        name: 'Web Development',
        description: 'Frontend engineers and creative developers crafting fast, accessible web experiences.',
        stack: 'Next.js · React · TypeScript · Tailwind',
        icon: Code2,
        size: 'lg',
    },
    {
        name: 'UI/UX Design',
        description: 'Product designers, design systems architects, and brand crafters.',
        stack: 'Figma · Framer · Prototyping · Motion',
        icon: Palette,
        size: 'wide',
    },
    {
        name: 'Full-Stack',
        description: 'End-to-end builders shipping scalable APIs and database architectures.',
        stack: 'Node · Postgres · Supabase · Go',
        icon: Layers,
        size: 'sm',
    },
    {
        name: 'DevOps',
        description: 'Cloud infrastructure, CI/CD pipelines, and site reliability.',
        stack: 'Docker · AWS · Kubernetes',
        icon: Cpu,
        size: 'sm',
    },
    {
        name: 'AI & ML',
        description: 'Engineers building applied AI agents, RAG pipelines, and custom models.',
        stack: 'PyTorch · LLMs · Python · Vector DBs',
        icon: Bot,
        size: 'lg',
    },
    {
        name: 'Mobile Dev',
        description: 'Native and cross-platform apps built for 60fps performance.',
        stack: 'React Native · Swift · Flutter',
        icon: Smartphone,
        size: 'sm',
    },
    {
        name: 'Product',
        description: 'Product managers and founders turning user insights into roadmaps.',
        stack: 'Strategy · Analytics · Specs',
        icon: Compass,
        size: 'sm',
    },
    {
        name: 'Growth & Marketing',
        description: 'Storytellers, developer advocates, and distribution specialists.',
        stack: 'SEO · Content · Community · GTM',
        icon: Megaphone,
        size: 'wide',
    },
]

const SIZE_CLASSES: Record<Domain['size'], string> = {
    lg: 'md:col-span-2 lg:row-span-2 min-h-56 lg:min-h-0',
    wide: 'md:col-span-2 min-h-44',
    sm: 'min-h-44',
}

export function DomainsSection() {
    const reduceMotion = useReducedMotion()

    return (
        <section
            aria-labelledby="domains-heading"
            style={{ '--ember': 'oklch(0.78 0.16 55)' } as CSSProperties}
            className="mx-auto max-w-6xl px-6 py-24 text-foreground lg:py-32"
        >
            <div>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <motion.h2
                        id="domains-heading"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl"
                    >
                        Explore by craft<span className="text-(--ember)">.</span>
                    </motion.h2>
                    <p className="text-sm text-muted-foreground">
                        Click any domain to filter verified builders
                    </p>
                </div>

                <ul
                    role="list"
                    className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[13.5rem]"
                >
                    {DOMAINS.map((domain, index) => (
                        <DomainCard key={domain.name} domain={domain} index={index} reduceMotion={!!reduceMotion} />
                    ))}
                </ul>
            </div>
        </section>
    )
}

function DomainCard({
    domain,
    index,
    reduceMotion,
}: {
    domain: Domain
    index: number
    reduceMotion: boolean
}) {
    const { name, description, stack, icon: Icon, size } = domain
    const isLarge = size === 'lg'

    const spotX = useMotionValue(0)
    const spotY = useMotionValue(0)
    const spotOpacity = useMotionValue(0)

    function handlePointerMove(event: PointerEvent<HTMLLIElement>) {
        if (event.pointerType !== 'mouse') return
        const rect = event.currentTarget.getBoundingClientRect()
        spotX.set(event.clientX - rect.left - SPOTLIGHT_SIZE / 2)
        spotY.set(event.clientY - rect.top - SPOTLIGHT_SIZE / 2)
        spotOpacity.set(1)
    }

    function handlePointerLeave(event: PointerEvent<HTMLLIElement>) {
        if (event.pointerType !== 'mouse') return
        spotOpacity.set(0)
    }

    return (
        <motion.li
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, ease: EASE, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.24) }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={cn(
                'group relative isolate overflow-hidden rounded-3xl border border-white/5 bg-card transition-colors hover:border-white/15',
                SIZE_CLASSES[size],
            )}
        >
            <Link
                href={`/team?domain=${encodeURIComponent(name)}`}
                className="flex h-full w-full flex-col justify-between p-6 md:p-8"
            >
                <motion.div
                    aria-hidden="true"
                    style={{
                        x: spotX,
                        y: spotY,
                        opacity: spotOpacity,
                        width: SPOTLIGHT_SIZE,
                        height: SPOTLIGHT_SIZE,
                    }}
                    className="pointer-events-none absolute left-0 top-0 -z-10 rounded-full bg-(--ember)/15 blur-3xl transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none [@media(pointer:coarse)]:hidden"
                />

                <div className="flex items-start justify-between">
                    <span
                        className={cn(
                            'flex items-center justify-center rounded-2xl bg-background text-(--ember)',
                            'transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0',
                            isLarge ? 'size-14' : 'size-11',
                        )}
                    >
                        <Icon aria-hidden="true" className={isLarge ? 'size-6' : 'size-5'} strokeWidth={1.75} />
                    </span>

                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--ember) group-hover:opacity-100" />
                </div>

                <div className="mt-6">
                    <h3 className={cn('font-semibold tracking-tight', isLarge ? 'text-2xl md:text-3xl' : 'text-lg')}>{name}</h3>
                    <p className={cn('mt-1.5 text-pretty text-muted-foreground line-clamp-2', isLarge ? 'text-base md:max-w-xs' : 'text-sm')}>
                        {description}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-foreground/50">{stack}</p>
                </div>
            </Link>
        </motion.li>
    )
}