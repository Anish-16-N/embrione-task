// src/components/MemberCard.tsx
"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, Copy, Check } from "lucide-react"
import { toast } from "sonner"

type Props = {
    name: string
    handle?: string
    domain: string
    position: string
    branch: string
    semester: number | string
    bio: string
    photoUrl: string | null
    linkedin?: string | null
    github?: string | null
    portfolio?: string | null
    email?: string
    preview?: boolean
    onClick?: () => void
}

function ExtLink({ href, label, preview }: { href: string; label: string; preview?: boolean }) {
    const cls =
        "group/link inline-flex items-center gap-0.5 text-sm text-foreground/70 transition-colors duration-150 hover:text-foreground"
    const inner = (
        <>
            {label}
            <ArrowUpRight
                size={14}
                className="transition-[translate,color] duration-150 ease-out group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-[oklch(0.78_0.16_55)]"
            />
        </>
    )
    if (preview) return <span className={cls}>{inner}</span>
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cls}
        >
            {inner}
        </a>
    )
}

export default function MemberCard({
    name,
    handle,
    domain,
    position,
    branch,
    semester,
    bio,
    photoUrl,
    linkedin,
    github,
    portfolio,
    email,
    preview,
    onClick,
}: Props) {
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const loaded = loadedUrl === photoUrl

    const isAvailable = position === "Open to Work" || position === "Freelancing"
    const formattedHandle = handle
        ? handle.startsWith("@")
            ? handle.toLowerCase()
            : `@${handle.toLowerCase()}`
        : null

    const copyEmail = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!email || preview) return
        navigator.clipboard.writeText(email)
        setCopied(true)
        toast.success(`Copied ${email} to clipboard`)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <article
            onClick={onClick}
            className={`group ${onClick ? "cursor-pointer" : ""}`}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-muted">
                <AnimatePresence initial={false} mode="popLayout">
                    {photoUrl ? (
                        <motion.img
                            key={photoUrl}
                            src={photoUrl}
                            alt={name ? `Photo of ${name}` : "Profile photo"}
                            ref={(el) => {
                                if (el?.complete && el.naturalWidth > 0) setLoadedUrl(photoUrl)
                            }}
                            onLoad={() => setLoadedUrl(photoUrl)}
                            initial={false}
                            animate={{ opacity: loaded ? 1 : 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 h-full w-full object-cover grayscale-[0.25] motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-out group-hover:grayscale-0 motion-safe:group-hover:scale-[1.03]"
                            onError={(e) => {
                                const t = e.currentTarget
                                t.onerror = null
                                t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=random&size=600`
                            }}
                        />
                    ) : (
                        <motion.div
                            key="placeholder"
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 grid place-items-center"
                        >
                            <span className="text-8xl font-semibold text-foreground/15">
                                {name ? name.charAt(0).toUpperCase() : "?"}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Top badges: Domain + Pulsing Availability Pill */}
                <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
                    {position && (
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md ${isAvailable
                                    ? "bg-emerald-950/85 text-emerald-200 border border-emerald-500/30"
                                    : "bg-background/80 text-foreground border border-white/10"
                                }`}
                        >
                            {isAvailable && (
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                                </span>
                            )}
                            {position}
                        </span>
                    )}

                    {domain && (
                        <span className="rounded-full border border-white/10 bg-background/75 px-3 py-1 text-xs font-medium text-foreground/90 backdrop-blur-md">
                            {domain}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4 px-1">
                <div className="flex items-baseline justify-between gap-2">
                    <h3 className="line-clamp-1 text-xl font-semibold tracking-tight">
                        {name || "Your name"}
                    </h3>
                    {formattedHandle && (
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            {formattedHandle}
                        </span>
                    )}
                </div>

                <p className="mt-0.5 line-clamp-1 text-sm text-foreground/85">
                    {branch || "Primary skills & stack"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {semester ? `${semester} ${Number(semester) === 1 ? "yr" : "yrs"} experience` : "Experience level"}
                </p>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {bio || "Your short builder bio will appear here..."}
                </p>

                {(github || linkedin || portfolio || email) && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {github && <ExtLink href={github} label="GitHub" preview={preview} />}
                        {linkedin && <ExtLink href={linkedin} label="LinkedIn" preview={preview} />}
                        {portfolio && <ExtLink href={portfolio} label="Portfolio" preview={preview} />}
                        {email && !preview && (
                            <button
                                type="button"
                                onClick={copyEmail}
                                className="inline-flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                            >
                                {copied ? (
                                    <>
                                        Copied <Check size={13} className="text-emerald-400" />
                                    </>
                                ) : (
                                    <>
                                        Copy Email <Copy size={13} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    )
}