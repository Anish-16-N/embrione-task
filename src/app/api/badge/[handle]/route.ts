// src/app/api/badge/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase()
  const displayHandle = handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`

  const style = request.nextUrl.searchParams.get("style") || "flat"

  // Look up the member in Supabase (case-insensitive search on srn)
  const { data: member, error } = await supabase
    .from("members")
    .select("name, domain, position, status")
    .ilike("srn", cleanHandle)
    .single()

  if (error || !member) {
    return new NextResponse(renderNotFoundBadge(displayHandle), {
      status: 200,
      headers: svgHeaders(60),
    })
  }

  if (member.status !== "approved") {
    return new NextResponse(renderPendingBadge(displayHandle), {
      status: 200,
      headers: svgHeaders(120),
    })
  }

  const svg =
    style === "minimal"
      ? renderMinimalBadge(member)
      : renderFlatBadge(member)

  return new NextResponse(svg, {
    status: 200,
    headers: svgHeaders(300),
  })
}

// ---------------------------------------------------------------------------
// SVG rendering helpers
// ---------------------------------------------------------------------------

function svgHeaders(maxAge: number): HeadersInit {
  return {
    "Content-Type": "image/svg+xml",
    "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=60`,
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function textWidth(text: string, fontSize = 11): number {
  return text.length * fontSize * 0.62 + 10
}

function renderFlatBadge(member: {
  name: string
  domain: string
  position: string
}): string {
  const label = "CraftRoster"
  const value = `${escapeXml(member.name)} · ${escapeXml(member.domain)}`
  const labelW = textWidth(label)
  const valueW = textWidth(value)
  const totalW = labelW + valueW

  const isAvailable =
    member.position === "Open to Work" || member.position === "Freelancing"
  const valueBg = isAvailable ? "#059669" : "#7c3aed"

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${escapeXml(label)}: ${value}">
  <title>${escapeXml(label)}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalW}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#18181b"/>
    <rect x="${labelW}" width="${valueW}" height="20" fill="${valueBg}"/>
    <rect width="${totalW}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${labelW / 2}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
    <text x="${labelW / 2}" y="14">${escapeXml(label)}</text>
    <text aria-hidden="true" x="${labelW + valueW / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelW + valueW / 2}" y="14">${value}</text>
  </g>
</svg>`
}

function renderMinimalBadge(member: {
  name: string
  domain: string
}): string {
  const text = `✓ ${escapeXml(member.name)} — ${escapeXml(member.domain)}`
  const w = textWidth(text, 12) + 8

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${text}">
  <title>${text}</title>
  <rect width="${w}" height="20" rx="3" fill="none"/>
  <text x="5" y="14" fill="#a78bfa" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" text-rendering="geometricPrecision">${text}</text>
</svg>`
}

function renderNotFoundBadge(handle: string): string {
  const label = "CraftRoster"
  const value = `${escapeXml(handle)} not found`
  const labelW = textWidth(label)
  const valueW = textWidth(value)
  const totalW = labelW + valueW

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${escapeXml(label)}: ${value}">
  <title>${escapeXml(label)}: ${value}</title>
  <clipPath id="r"><rect width="${totalW}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#18181b"/>
    <rect x="${labelW}" width="${valueW}" height="20" fill="#991b1b"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelW / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelW + valueW / 2}" y="14">${value}</text>
  </g>
</svg>`
}

function renderPendingBadge(handle: string): string {
  const label = "CraftRoster"
  const value = `${escapeXml(handle)} pending`
  const labelW = textWidth(label)
  const valueW = textWidth(value)
  const totalW = labelW + valueW

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${escapeXml(label)}: ${value}">
  <title>${escapeXml(label)}: ${value}</title>
  <clipPath id="r"><rect width="${totalW}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#18181b"/>
    <rect x="${labelW}" width="${valueW}" height="20" fill="#92400e"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelW / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelW + valueW / 2}" y="14">${value}</text>
  </g>
</svg>`
}