// src/components/MemberCard.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import {
    AnimatePresence,
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react"
import { ArrowUpRight, Copy, Check, Bookmark } from "lucide-react"
import { toast } from "sonner"
import {
    getStoredShortlist,
    toggleShortlistBuilder,
} from "@/components/ShortlistDrawer"

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

function ExtLink({
    href,
    label,
    preview,
}: {
    href: string
    label: string
    preview?: boolean
}) {
    const cls =
        "group/link inline-flex items-center gap-0.5 text-sm text-foreground/70 transition-colors duration-150 hover:text-foreground"
    const inner = (
        <>
            {label}
            <ArrowUpRight
                size={14}
                className="transition-[translate,color] duration-150 ease-out group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-violet-400"
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
    const [shortlisted, setShortlisted] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const loaded = loadedUrl === photoUrl

    const formattedHandle = handle
        ? handle.startsWith("@")
            ? handle.toLowerCase()
            : `@${handle.toLowerCase()}`
        : null

    useEffect(() => {
        if (!formattedHandle || preview) return
        const check = () => {
            const list = getStoredShortlist()
            setShortlisted(list.some((b) => b.handle.toLowerCase() === formattedHandle))
        }
        check()
        window.addEventListener("shortlist-updated", check)
        return () => window.removeEventListener("shortlist-updated", check)
    }, [formattedHandle, preview])

    // 3D Tilt Motion Values
    const mouseX = useMotionValue(0.5)
    const mouseY = useMotionValue(0.5)

    const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), {
        stiffness: 260,
        damping: 22,
    })
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), {
        stiffness: 260,
        damping: 22,
    })

    const glareX = useTransform(mouseX, [0, 1], [0, 100])
    const glareY = useTransform(mouseY, [0, 1], [0, 100])
    const glareBackground = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.18), transparent 70%)`

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = cardRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        mouseX.set(Math.max(0, Math.min(1, x)))
        mouseY.set(Math.max(0, Math.min(1, y)))
    }

    const handlePointerLeave = () => {
        mouseX.set(0.5)
        mouseY.set(0.5)
    }

    const isAvailable = position === "Open to Work" || position === "Freelancing"

    const copyEmail = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!email || preview) return
        navigator.clipboard.writeText(email)
        setCopied(true)
        toast.success(`Copied ${email} to clipboard`)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleToggleShortlist = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (preview) return

        const activeHandle =
            formattedHandle || `@${name.toLowerCase().replace(/\s+/g, "")}`

        const added = toggleShortlistBuilder({
            handle: activeHandle,
            name: name || "Builder",
            domain: domain || "General",
            position: position || "Open to Work",
            branch: branch || "",
            photoUrl,
            email: email || "",
        })
        setShortlisted(added)
        toast.success(
            added ? `Added ${name} to shortlist` : `Removed ${name} from shortlist`
        )
    }

    return (
        <article
            onClick={onClick}
            className={`group [perspective:1100px] ${onClick ? "cursor-pointer" : ""}`}
        >
            <div className="relative">
                <motion.div
                    ref={cardRef}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative aspect-[4/5] rounded-3xl border border-white/12 bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow duration-300 group-hover:border-violet-500/40 group-hover:shadow-[0_25px_60px_rgba(139,92,246,0.22)]"
                >
                    {/* Clipped image container */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <AnimatePresence initial={false} mode="popLayout">
                            {photoUrl ? (
                                <motion.img
                                    key={photoUrl}
                                    src={photoUrl}
                                    alt={name ? `Photo of ${name}` : "Profile photo"}
                                    ref={(el) => {
                                        if (el?.complete && el.naturalWidth > 0)
                                            setLoadedUrl(photoUrl)
                                    }}
                                    onLoad={() => setLoadedUrl(photoUrl)}
                                    initial={false}
                                    animate={{ opacity: loaded ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 h-full w-full object-cover grayscale-[0.2] motion-safe:transition-[transform,filter] motion-safe:duration-500 motion-safe:ease-out group-hover:grayscale-0 motion-safe:group-hover:scale-[1.06]"
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
                                    className="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-violet-950/30"
                                >
                                    <span className="text-8xl font-semibold text-foreground/15">
                                        {name ? name.charAt(0).toUpperCase() : "?"}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3D Holographic Glare Overlay */}
                        <motion.div
                            style={{ background: glareBackground }}
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                    </div>

                    {/* Floating 3D Top Badges */}
                    <div
                        style={{ transform: "translateZ(32px)" }}
                        className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2"
                    >
                        {position && (
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-lg backdrop-blur-md ${isAvailable
                                        ? "border border-emerald-500/30 bg-emerald-950/85 text-emerald-200"
                                        : "border border-white/10 bg-background/80 text-foreground"
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
                            <span className="rounded-full border border-white/15 bg-background/80 px-3 py-1 text-xs font-medium text-foreground/90 shadow-lg backdrop-blur-md">
                                {domain}
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Clickable Bookmark Button Positioned Outside 3D Tilt Container */}
                {!preview && (
                    <button
                        type="button"
                        onClick={handleToggleShortlist}
                        aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
                        className={`absolute bottom-4 right-4 z-20 grid size-10 place-items-center rounded-full border shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 ${shortlisted
                                ? "border-violet-400/60 bg-violet-600 text-white"
                                : "border-white/20 bg-zinc-950/85 text-zinc-300 hover:border-white/40 hover:text-white"
                            }`}
                    >
                        <Bookmark className={`size-4 ${shortlisted ? "fill-white" : ""}`} />
                    </button>
                )}
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
                    {semester
                        ? `${semester} ${Number(semester) === 1 ? "yr" : "yrs"} experience`
                        : "Experience level"}
                </p>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {bio || "Your short builder bio will appear here..."}
                </p>

                {(github || linkedin || portfolio || email) && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {github && (
                            <ExtLink href={github} label="GitHub" preview={preview} />
                        )}
                        {linkedin && (
                            <ExtLink href={linkedin} label="LinkedIn" preview={preview} />
                        )}
                        {portfolio && (
                            <ExtLink href={portfolio} label="Portfolio" preview={preview} />
                        )}
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