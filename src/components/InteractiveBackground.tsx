"use client"

import { useEffect, useRef } from "react"

// Soft glow + dot grid that follow the mouse. Static on touch screens / reduced motion.
// Glow colour. 50 = ember orange. Try 150 (green), 300 (violet), 20 (red).
const HUE = 50
export default function InteractiveBackground() {
    const root = useRef<HTMLDivElement>(null)
    const glow = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = root.current
        const g = glow.current
        if (!el || !g) return

        const place = (x: number, y: number) => {
            el.style.setProperty("--mx", `${x}px`)
            el.style.setProperty("--my", `${y}px`)
            g.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`
            g.style.opacity = "1"
        }

        let tx = window.innerWidth * 0.5
        let ty = window.innerHeight * 0.3
        let x = tx
        let y = ty
        place(x, y)

        const canAnimate = window.matchMedia(
            "(pointer: fine) and (prefers-reduced-motion: no-preference)"
        ).matches
        if (!canAnimate) return

        let raf = 0
        let running = false

        // Move a fraction of the way to the mouse each frame = smooth "lag".
        const loop = () => {
            x += (tx - x) * 0.12
            y += (ty - y) * 0.12
            place(x, y)
            if (Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3) {
                running = false // close enough: stop the loop until the mouse moves again
                return
            }
            raf = requestAnimationFrame(loop)
        }

        const onMove = (e: PointerEvent) => {
            tx = e.clientX
            ty = e.clientY
            if (!running) {
                running = true
                raf = requestAnimationFrame(loop)
            }
        }

        window.addEventListener("pointermove", onMove, { passive: true })
        return () => {
            window.removeEventListener("pointermove", onMove)
            cancelAnimationFrame(raf)
        }
    }, [])

    return (
        <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(ellipse 80% 60% at 20% 0%, oklch(0.24 0.06 ${HUE}), transparent)` }}
            />
            <div className="dot-grid absolute inset-0" />
            <div
                ref={glow}
                className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
                style={{ background: `radial-gradient(closest-side, oklch(0.6 0.17 ${HUE} / 0.2), transparent)` }}
            />
        </div>
    )
}