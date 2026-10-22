// src/components/InteractiveBackground.tsx
"use client"

import { useEffect, useRef } from "react"
import { motion } from "motion/react"

export default function InteractiveBackground() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
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
            ref={containerRef}
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060b]"
            style={
                {
                    "--mx": "50vw",
                    "--my": "35vh",
                } as React.CSSProperties
            }
        >
            {/* Dynamic Drifting Aurora Orb 1 - Electric Violet */}
            <motion.div
                animate={{
                    x: ["-10%", "15%", "-5%", "-10%"],
                    y: ["-5%", "12%", "-8%", "-5%"],
                    scale: [1, 1.18, 0.94, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-36 left-[15%] h-[520px] w-[520px] rounded-full bg-violet-600/25 blur-[135px]"
            />

            {/* Dynamic Drifting Aurora Orb 2 - Cyber Cyan */}
            <motion.div
                animate={{
                    x: ["10%", "-18%", "8%", "10%"],
                    y: ["5%", "-14%", "10%", "5%"],
                    scale: [1, 0.9, 1.15, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[18%] right-[10%] h-[460px] w-[460px] rounded-full bg-cyan-500/20 blur-[135px]"
            />

            {/* Dynamic Drifting Aurora Orb 3 - Deep Indigo */}
            <motion.div
                animate={{
                    x: ["-8%", "12%", "-12%", "-8%"],
                    y: ["10%", "-10%", "6%", "10%"],
                    scale: [1.05, 0.92, 1.12, 1.05],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-10%] left-[30%] h-[500px] w-[640px] rounded-full bg-indigo-600/20 blur-[140px]"
            />

            {/* Base architectural perspective grid */}
            <div
                className="absolute inset-0 opacity-[0.16]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
                    backgroundSize: "56px 56px",
                    maskImage:
                        "radial-gradient(ellipse 85% 65% at 50% 30%, black 30%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 85% 65% at 50% 30%, black 30%, transparent 100%)",
                }}
            />

            {/* Cursor-reactive bright dot matrix reveal */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(167, 139, 250, 0.75) 1.25px, transparent 1.25px)",
                    backgroundSize: "28px 28px",
                    maskImage:
                        "radial-gradient(380px circle at var(--mx) var(--my), black 0%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(380px circle at var(--mx) var(--my), black 0%, transparent 100%)",
                }}
            />

            {/* Cursor-following ambient glow */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(650px circle at var(--mx) var(--my), rgba(139, 92, 246, 0.16), rgba(34, 211, 238, 0.05) 40%, transparent 70%)",
                }}
            />

            {/* Animated light beams / meteors */}
            <motion.div
                animate={{
                    x: ["-20vw", "120vw"],
                    y: ["-10vh", "60vh"],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "linear",
                }}
                className="absolute top-12 left-0 h-[1px] w-48 rotate-[28deg] bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-60"
            />
            <motion.div
                animate={{
                    x: ["-10vw", "110vw"],
                    y: ["20vh", "85vh"],
                    opacity: [0, 0.8, 0],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    repeatDelay: 6,
                    delay: 3,
                    ease: "linear",
                }}
                className="absolute top-1/3 left-0 h-[1px] w-64 rotate-[28deg] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-50"
            />
        </div>
    )
}