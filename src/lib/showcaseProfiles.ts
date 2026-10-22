// src/lib/showcaseProfiles.ts
import { siteConfig } from "./siteConfig"
import type { Member } from "./types"

export const SHOWCASE_PROFILES: Member[] = [
    {
        id: "showcase-1",
        name: "Aarav Mehta",
        srn: "@aaravbuilds",
        domain: "Full-Stack",
        position: "Open to Work",
        branch: "Next.js, TypeScript, Go, Postgres",
        semester: 3,
        bio: "Building distributed developer tools and high-craft web interfaces. Previously shipped open-source CLI tools with 2.4k+ GitHub stars.",
        photo_url:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        github_url: "https://github.com",
        linkedin_url: "https://linkedin.com",
        portfolio_url: "https://vercel.com",
        email: "aarav@craftroster.dev",
        status: "approved",
        created_at: "2026-10-15T10:00:00Z",
    },
    {
        id: "showcase-2",
        name: "Maya Lin",
        srn: "@mayalin",
        domain: "UI/UX Design",
        position: "Freelancing",
        branch: "Figma, Design Systems, Rive, Framer",
        semester: 4,
        bio: "Staff product designer obsessing over micro-interactions, shaders, and tactile interfaces for AI-native startups.",
        photo_url:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        github_url: null,
        linkedin_url: "https://linkedin.com",
        portfolio_url: "https://figma.com",
        email: "maya@craftroster.dev",
        status: "approved",
        created_at: "2026-10-14T10:00:00Z",
    },
    {
        id: "showcase-3",
        name: "Rohan Kapoor",
        srn: "@rohank",
        domain: "AI & ML",
        position: "Founder / Building",
        branch: "PyTorch, vLLM, Rust, LangGraph",
        semester: 5,
        bio: "Training low-latency voice and reasoning agents. Obsessed with inference optimization and local-first AI workflows.",
        photo_url:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        github_url: "https://github.com",
        linkedin_url: "https://linkedin.com",
        portfolio_url: "https://huggingface.co",
        email: "rohan@craftroster.dev",
        status: "approved",
        created_at: "2026-10-13T10:00:00Z",
    },
    {
        id: "showcase-4",
        name: "Elena Rostova",
        srn: "@elena_dev",
        domain: "Web Development",
        position: "Open to Work",
        branch: "React 19, Tailwind CSS, Three.js, WebGL",
        semester: 3,
        bio: "Creative frontend engineer bridging the gap between design engineering and 60fps browser graphics.",
        photo_url:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        github_url: "https://github.com",
        linkedin_url: "https://linkedin.com",
        portfolio_url: "https://nextjs.org",
        email: "elena@craftroster.dev",
        status: "approved",
        created_at: "2026-10-12T10:00:00Z",
    },
    {
        id: "showcase-5",
        name: "Karthik Nair",
        srn: "@karthikn",
        domain: "DevOps",
        position: "Core Member",
        branch: "Kubernetes, Terraform, AWS, eBPF",
        semester: 4,
        bio: "Platform engineer scaling multi-region cloud infrastructure and zero-downtime deployment pipelines.",
        photo_url:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        github_url: "https://github.com",
        linkedin_url: "https://linkedin.com",
        portfolio_url: null,
        email: "karthik@craftroster.dev",
        status: "approved",
        created_at: "2026-10-11T10:00:00Z",
    },
    {
        id: "showcase-6",
        name: "Zoya Khan",
        srn: "@zoyaproduct",
        domain: "Product",
        position: "Open to Work",
        branch: "Product Strategy, PLG, SQL, User Research",
        semester: 3,
        bio: "0-to-1 product builder who loves turning complex developer workflows into intuitive self-serve experiences.",
        photo_url:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        github_url: null,
        linkedin_url: "https://linkedin.com",
        portfolio_url: "https://linear.app",
        email: "zoya@craftroster.dev",
        status: "approved",
        created_at: "2026-10-10T10:00:00Z",
    },
]

const VALID_DOMAINS = new Set<string>(siteConfig.domains)
const VALID_ROLES = new Set<string>(siteConfig.roles)

/**
 * Filters out any legacy profiles whose domain or position (e.g. "Head", "Vice-Head", "Hospitality")
 * does not match CraftRoster's official categories and roles.
 */
export function filterValidCraftRosterMembers(rows: Member[]): Member[] {
    const valid = rows.filter(
        (m) => VALID_DOMAINS.has(m.domain) && VALID_ROLES.has(m.position)
    )
    return valid.length > 0 ? valid : SHOWCASE_PROFILES
}