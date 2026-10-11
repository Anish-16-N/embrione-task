"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

type Props = {
    name: string
    domain: string
    position: string
    branch: string
    semester: number | string
    bio: string
    photoUrl: string | null
    linkedin?: string | null
    github?: string | null
    email?: string
    // In the live preview the links are not clickable.
    preview?: boolean
}

function ExtLink({ href, label, preview }: { href: string; label: string; preview?: boolean }) {
    const cls = "group/link inline-flex items-center gap-0.5 text-sm text-foreground/70 transition-colors duration-150 hover:text-foreground"
    const inner = (
        <>
            {label}
            <ArrowUpRight size={14} className="transition-[translate,color] duration-150 ease-out group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-[oklch(0.78_0.16_55)]" />
        </>
    )
    if (preview) return <span className={cls}>{inner}</span>
    return (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
            {inner}
        </a>
    )
}

export default function MemberCard({ name, domain, position, branch, semester, bio, photoUrl, linkedin, github, email, preview }: Props) {
    // Fade the photo in only once it has actually loaded.
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
    const loaded = loadedUrl === photoUrl

    const isLead = position === "Head" || position === "Vice-Head"
    const meta = [isLead ? null : position, domain].filter(Boolean).join(" · ")

    return (
        <article className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
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
                            className="absolute inset-0 h-full w-full object-cover grayscale-[0.7] motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-out group-hover:grayscale-0 motion-safe:group-hover:scale-[1.03]"
                            onError={(e) => {
                                const t = e.currentTarget
                                t.onerror = null
                                t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=random&size=600`
                            }}
                        />
                    ) : (
                        <motion.div key="placeholder" exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center">
                            <span className="text-8xl font-semibold text-foreground/15">{name ? name.charAt(0).toUpperCase() : "?"}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLead && (
                    <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                        {position}
                    </span>
                )}
            </div>

            <div className="mt-4 px-1">
                <h3 className="line-clamp-1 text-xl font-semibold tracking-tight">{name || "Your name"}</h3>
                <p className="mt-0.5 text-sm text-foreground/80">{meta || "Position · Domain"}</p>
                <p className="text-sm text-muted-foreground">{branch ? `${branch} · Sem ${semester || "?"}` : "Branch · Semester"}</p>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {bio || "Your short description will appear here..."}
                </p>

                {(github || linkedin || email) && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {github && <ExtLink href={github} label="GitHub" preview={preview} />}
                        {linkedin && <ExtLink href={linkedin} label="LinkedIn" preview={preview} />}
                        {email && !preview && <ExtLink href={`mailto:${email}`} label="Email" />}
                    </div>
                )}
            </div>
        </article>
    )
}