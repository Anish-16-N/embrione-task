// src/app/api/og/route.tsx
import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name") || "Verified Builder"
    const handle = searchParams.get("handle") || "@builder"
    const domain = searchParams.get("domain") || "Full-Stack"
    const status = searchParams.get("status") || "Open to Work"
    const stack =
        searchParams.get("stack") || "Next.js, TypeScript, Tailwind CSS, Supabase"
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#05060b",
                    backgroundImage:
                        "radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.35), transparent 55%), radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.22), transparent 50%)",
                    padding: "64px",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Top Row: Brand & Status */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "9999px",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                fontWeight: 700,
                            }}
                        >
                            ✦
                        </div>
                        <span style={{ fontSize: "28px", fontWeight: 700 }}>
                            CraftRoster
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                padding: "10px 22px",
                                borderRadius: "9999px",
                                backgroundColor: "rgba(16, 185, 129, 0.16)",
                                border: "1px solid rgba(16, 185, 129, 0.4)",
                                color: "#6ee7b7",
                                fontSize: "20px",
                                fontWeight: 600,
                            }}
                        >
                            ● {status}
                        </span>
                        <span
                            style={{
                                padding: "10px 22px",
                                borderRadius: "9999px",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                color: "#e4e4e7",
                                fontSize: "20px",
                                fontWeight: 600,
                            }}
                        >
                            {domain}
                        </span>
                    </div>
                </div>

                {/* Center Builder Identity */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div
                        style={{
                            fontSize: "24px",
                            color: "#a78bfa",
                            fontWeight: 600,
                        }}
                    >
                        {handle} · Verified Proof of Work
                    </div>
                    <div
                        style={{
                            fontSize: "84px",
                            fontWeight: 800,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.05,
                        }}
                    >
                        {name}
                    </div>
                    <div
                        style={{
                            fontSize: "28px",
                            color: "#a1a1aa",
                            marginTop: "8px",
                        }}
                    >
                        Stack: {stack}
                    </div>
                </div>

                {/* Bottom Footer */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                        paddingTop: "24px",
                        fontSize: "20px",
                        color: "#71717a",
                    }}
                >
                    <span>craftroster.vercel.app/u/{handle.replace(/^@/, "")}</span>
                    <span style={{ color: "#c4b5fd" }}>Curated Builder Directory</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    )
}