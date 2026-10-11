"use client"

import { MotionConfig } from "motion/react"

// "user" means animations switch off automatically for people who enabled
// "reduce motion" in their operating system.
export default function Providers({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}