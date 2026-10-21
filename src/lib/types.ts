// src/lib/types.ts
import { siteConfig } from "./siteConfig"

export const BIO_MIN = 20
export const BIO_MAX = 240

export const DOMAINS = siteConfig.domains
export const POSITIONS = siteConfig.roles

export type Member = {
    id: string
    name: string
    domain: string
    position: string
    srn: string // Stores @handle
    email: string
    linkedin_url?: string | null
    github_url?: string | null
    portfolio_url?: string | null
    branch: string // Stores Primary Skills / Headline
    semester: number // Stores Years of Experience
    bio: string
    photo_url: string
    status: "pending" | "approved" | "rejected"
    created_at: string
}