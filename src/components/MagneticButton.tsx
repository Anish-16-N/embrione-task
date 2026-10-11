"use client"

import { useRef } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

// Leans its child toward the mouse while the cursor is near it.
export default function MagneticButton({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const reduce = useReducedMotion()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
    const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

    if (reduce) return <>{children}</>

    function onMove(e: React.PointerEvent) {
        if (e.pointerType !== "mouse" || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
    }

    function onLeave() {
        x.set(0)
        y.set(0)
    }

    return (
        <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="-m-8 inline-block p-8">
            <motion.div style={{ x: sx, y: sy }}>{children}</motion.div>
        </div>
    )
}