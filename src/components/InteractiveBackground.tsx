// src/components/InteractiveBackground.tsx
"use client"

import { useEffect, useRef } from "react"

export default function InteractiveBackground() {
    const glowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = glowRef.current
        if (!el) return

        const handleMove = (e: PointerEvent) => {
            el.style.setProperty("--mx", `${e.clientX}px`)
            el.style.setProperty("--my", `${e.clientY}px`)
        }

        window.addEventListener("pointermove", handleMove, { passive: true })
        return () => window.removeEventListener("pointermove", handleMove)
    }, [])

    return (
        <div
            ref={glowRef}
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06070b]"
            style={
                {
                    "--mx": "50vw",
                    "--my": "30vh",
                } as React.CSSProperties
            }
        >
            {/* Ambient top aurora beams */}
            <div className="absolute -top-48 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-cyan-500/15 blur-[130px]" />
            <div className="absolute top-[35%] -left-40 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
            <div className="absolute top-[65%] -right-40 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />

            {/* Interactive mouse-following spotlight */}
            <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    background:
                        "radial-gradient(600px circle at var(--mx) var(--my), rgba(139, 92, 246, 0.13), transparent 70%)",
                }}
            />

            {/* Crisp dot matrix with radial fade mask */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    maskImage:
                        "radial-gradient(ellipse 80% 70% at 50% 35%, black 40%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 70% at 50% 35%, black 40%, transparent 100%)",
                }}
            />
        </div>
    )
}