// src/components/InteractiveBackground.tsx
"use client"

import { useEffect } from "react"
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
} from "motion/react"

export default function InteractiveBackground() {
    const mouseX = useMotionValue(-1000)
    const mouseY = useMotionValue(-1000)

    const smoothX = useSpring(mouseX, { stiffness: 65, damping: 25, mass: 0.5 })
    const smoothY = useSpring(mouseY, { stiffness: 65, damping: 25, mass: 0.5 })

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }
        window.addEventListener("pointermove", handlePointerMove, { passive: true })
        return () => window.removeEventListener("pointermove", handlePointerMove)
    }, [mouseX, mouseY])

    const cursorSpotlight = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(139, 92, 246, 0.13), rgba(34, 211, 238, 0.05) 45%, transparent 75%)`

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060b]"
        >
            {/* Drifting Top-Left Violet Aurora Orb */}
            <motion.div
                animate={{
                    x: [0, 45, -25, 0],
                    y: [0, -35, 25, 0],
                    scale: [1, 1.08, 0.95, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-600/18 blur-[130px]"
            />

            {/* Drifting Bottom-Right Cyan/Indigo Aurora Orb */}
            <motion.div
                animate={{
                    x: [0, -50, 30, 0],
                    y: [0, 40, -30, 0],
                    scale: [1, 0.94, 1.06, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-cyan-500/12 blur-[140px]"
            />

            {/* Interactive Cursor-Tracking Spotlight */}
            <motion.div
                style={{ background: cursorSpotlight }}
                className="absolute inset-0 hidden md:block"
            />

            {/* Architectural Dot Grid with Radial Vignette Mask */}
            <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(255, 255, 255, 0.55) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    maskImage:
                        "radial-gradient(ellipse 80% 70% at 50% 35%, #000 45%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 70% at 50% 35%, #000 45%, transparent 100%)",
                }}
            />

            {/* Top Subtle Horizon Light Beam */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />
        </div>
    )
}