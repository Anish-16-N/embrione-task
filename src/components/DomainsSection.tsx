'use client'

import type { CSSProperties, PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion } from 'motion/react'
import {
    CalendarDays,
    Code2,
    Handshake,
    Megaphone,
    Palette,
    Settings2,
    Truck,
    UtensilsCrossed,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const EASE = [0.23, 1, 0.32, 1] as const
const SPOTLIGHT_SIZE = 320

type Domain = {
    name: string
    description: string
    icon: LucideIcon
    size: 'lg' | 'wide' | 'sm'
}

// Order matters: on a 4-column grid these spans tile perfectly into
// two 4x2 blocks (2x2 + 2x1 + 1x1 + 1x1, then mirrored) with no holes.
const DOMAINS: Domain[] = [
    { name: 'Web Development', description: 'Fast, accessible sites and tools that power every event.', icon: Code2, size: 'lg' },
    { name: 'Design', description: 'Identity, visuals and print that make us recognisable.', icon: Palette, size: 'wide' },
    { name: 'Logistics', description: 'Venues, transport and kit, exactly where it needs to be.', icon: Truck, size: 'sm' },
    { name: 'Operations', description: 'The systems that keep everything running on time.', icon: Settings2, size: 'sm' },
    { name: 'Event Management', description: 'From first idea to final applause, end to end.', icon: CalendarDays, size: 'lg' },
    { name: 'Sponsorship', description: 'Partnerships that fund bigger ambitions.', icon: Handshake, size: 'sm' },
    { name: 'Hospitality', description: 'Guests looked after from arrival to goodbye.', icon: UtensilsCrossed, size: 'sm' },
    { name: 'Social Media', description: 'Stories and reach across every channel we run.', icon: Megaphone, size: 'wide' },
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
            // Accent lives in one custom property so every usage stays in sync.
            style={{ '--ember': 'oklch(0.78 0.16 55)' } as CSSProperties}
            className="mx-auto max-w-6xl px-6 py-24 text-foreground lg:py-32"
        >
            <div>
                <motion.h2
                    id="domains-heading"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl"
                >
                    What we do<span className="text-(--ember)">.</span>
                </motion.h2>

                <ul
                    role="list"
                    className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[13rem]"
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
    const { name, description, icon: Icon, size } = domain
    const isLarge = size === 'lg'

    // Motion values update the DOM directly, so tracking the cursor never
    // triggers a React re-render.
    const spotX = useMotionValue(0)
    const spotY = useMotionValue(0)
    const spotOpacity = useMotionValue(0)

    // pointerType === 'mouse' is our "fine pointer" gate: touch and pen taps
    // also fire pointer events, and we don't want a spotlight stuck where a
    // finger landed.
    function handlePointerMove(event: PointerEvent<HTMLLIElement>) {
        if (event.pointerType !== 'mouse') return
        const rect = event.currentTarget.getBoundingClientRect()
        // Offset by half the size so the blob is centred on the cursor.
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
            // Short stagger capped so the last card still lands quickly.
            transition={{ duration: 0.3, ease: EASE, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.24) }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={cn(
                'group relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-card p-6 md:p-8',
                SIZE_CLASSES[size],
            )}
        >
            {/*
        Spotlight: a blurred solid disc moved with transform (not a gradient
        repainted on every mousemove). Only x/y/opacity change, so it stays
        on the compositor. Hidden entirely for coarse pointers. The fade is
        a Tailwind transition; position follows the cursor 1:1 so it never lags.
      */}
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

            <span
                className={cn(
                    'flex items-center justify-center rounded-2xl bg-background text-(--ember)',
                    'transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0',
                    isLarge ? 'size-14' : 'size-11',
                )}
            >
                <Icon aria-hidden="true" className={isLarge ? 'size-6' : 'size-5'} strokeWidth={1.75} />
            </span>

            <div className="mt-8">
                <h3 className={cn('font-semibold tracking-tight', isLarge ? 'text-2xl md:text-3xl' : 'text-lg')}>{name}</h3>
                <p className={cn('mt-2 text-pretty text-muted-foreground', isLarge ? 'text-base md:max-w-xs' : 'text-sm')}>
                    {description}
                </p>
            </div>
        </motion.li>
    )
}