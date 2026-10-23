// src/lib/vouches.ts

const VOUCH_COUNTS_KEY = "craftroster_vouch_counts_v1"
const USER_VOUCHED_KEY = "craftroster_user_vouched_v1"

const DEFAULT_VOUCHES: Record<string, number> = {
    "@aaravbuilds": 42,
    "@mayalin": 38,
    "@rohank": 51,
    "@elena_dev": 29,
    "@karthikn": 24,
    "@zoyaproduct": 33,
}

function normalize(handle?: string, fallbackName?: string): string {
    if (handle && handle.trim()) {
        const clean = handle.trim().toLowerCase()
        return clean.startsWith("@") ? clean : `@${clean}`
    }
    return `@${(fallbackName || "builder").toLowerCase().replace(/\s+/g, "")}`
}

export function getBuilderVouchState(
    handle?: string,
    fallbackName?: string
): { count: number; vouched: boolean } {
    const key = normalize(handle, fallbackName)
    const base = DEFAULT_VOUCHES[key] ?? 12

    if (typeof window === "undefined") {
        return { count: base, vouched: false }
    }

    try {
        const countsRaw = window.localStorage.getItem(VOUCH_COUNTS_KEY)
        const vouchedRaw = window.localStorage.getItem(USER_VOUCHED_KEY)

        const counts: Record<string, number> = countsRaw
            ? JSON.parse(countsRaw)
            : {}
        const vouchedList: string[] = vouchedRaw ? JSON.parse(vouchedRaw) : []

        const count = typeof counts[key] === "number" ? counts[key] : base
        const vouched = vouchedList.includes(key)

        return { count, vouched }
    } catch {
        return { count: base, vouched: false }
    }
}

export function toggleBuilderVouch(
    handle?: string,
    fallbackName?: string
): { count: number; vouched: boolean } {
    const key = normalize(handle, fallbackName)
    const current = getBuilderVouchState(handle, fallbackName)

    const nextVouched = !current.vouched
    const nextCount = nextVouched
        ? current.count + 1
        : Math.max(0, current.count - 1)

    if (typeof window !== "undefined") {
        try {
            const countsRaw = window.localStorage.getItem(VOUCH_COUNTS_KEY)
            const vouchedRaw = window.localStorage.getItem(USER_VOUCHED_KEY)

            const counts: Record<string, number> = countsRaw
                ? JSON.parse(countsRaw)
                : {}
            const vouchedList: string[] = vouchedRaw ? JSON.parse(vouchedRaw) : []

            counts[key] = nextCount
            const updatedVouched = nextVouched
                ? [...new Set([...vouchedList, key])]
                : vouchedList.filter((k) => k !== key)

            window.localStorage.setItem(VOUCH_COUNTS_KEY, JSON.stringify(counts))
            window.localStorage.setItem(
                USER_VOUCHED_KEY,
                JSON.stringify(updatedVouched)
            )
            window.dispatchEvent(new Event("vouches-updated"))
        } catch {
            // Ignore storage errors
        }
    }

    return { count: nextCount, vouched: nextVouched }
}