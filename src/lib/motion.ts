// src/lib/motion.ts

// Emil Kowalski's signature strong ease-out curves
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1]

// Snappy, zero-overshoot spring for shared layoutId pills & drawers
export const SNAPPY_SPRING = {
    type: "spring" as const,
    stiffness: 500,
    damping: 36,
    mass: 0.8,
}

// Subtle physical entrance (never start from scale 0)
export const POPOVER_VARIANTS = {
    initial: { opacity: 0, scale: 0.96, y: 6, filter: "blur(4px)" },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.22, ease: EASE_OUT },
    },
    exit: {
        opacity: 0,
        scale: 0.97,
        y: 4,
        filter: "blur(2px)",
        transition: { duration: 0.15, ease: EASE_OUT },
    },
}