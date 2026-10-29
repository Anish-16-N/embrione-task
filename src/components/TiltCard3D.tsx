// src/components/TiltCard3D.tsx
"use client"

import React, { useRef } from "react"
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react"

export default function TiltCard3D({
    children,
    className = "",
}: {
    children: React.ReactNode
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const glareX = useMotionValue(50)
    const glareY = useMotionValue(50)
    const glareOpacity = useMotionValue(0)

    const springConfig = { stiffness: 400, damping: 32, mass: 0.5 }
    const mouseXSpring = useSpring(x, springConfig)
    const mouseYSpring = useSpring(y, springConfig)
    const smoothGlareOpacity = useSpring(glareOpacity, {
        stiffness: 300,
        damping: 30,
    })

    // Restrained 4-degree tilt so typography stays razor-sharp
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"])

    const glareBackground = useMotionTemplate`radial-gradient(360px circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.08), rgba(167, 139, 250, 0.05) 40%, transparent 75%)`

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        x.set(mouseX / rect.width - 0.5)
        y.set(mouseY / rect.height - 0.5)
        glareX.set((mouseX / rect.width) * 100)
        glareY.set((mouseY / rect.height) * 100)
        glareOpacity.set(1)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
        glareOpacity.set(0)
    }

    return (
        <div style={{ perspective: "1200px" }} className="h-full w-full">
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={`relative h-full w-full ${className}`}
            >
                <motion.div
                    aria-hidden="true"
                    style={{
                        background: glareBackground,
                        opacity: smoothGlareOpacity,
                    }}
                    className="pointer-events-none absolute inset-0 z-20 rounded-3xl"
                />
                <div className="relative z-10 h-full w-full">{children}</div>
            </motion.div>
        </div>
    )
}