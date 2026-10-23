// src/app/register/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Sparkles,
  Upload,
  CheckCircle2,
  ArrowRight,
  Code2,
  Wand2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { EASE_OUT } from "@/lib/motion"
import { siteConfig } from "@/lib/siteConfig"
import MemberCard from "@/components/MemberCard"

const SUGGESTED_SKILLS = [
  "Next.js",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "PyTorch",
  "Rust",
  "Go",
  "Figma",
  "Tailwind CSS",
  "Postgres",
  "Kubernetes",
]

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [srn, setSrn] = useState("")
  const [email, setEmail] = useState("")
  const [domain, setDomain] = useState<string>("")
  const [position, setPosition] = useState<string>("")
  const [branch, setBranch] = useState("")
  const [semester, setSemester] = useState<string>("")
  const [bio, setBio] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [ghUsername, setGhUsername] = useState("")
  const [fetchingGh, setFetchingGh] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedHandle, setSubmittedHandle] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleGitHubAutofill = async () => {
    const cleanUser = ghUsername
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .split("/")[0]

    if (!cleanUser) {
      toast.error("Enter a GitHub username first")
      return
    }

    setFetchingGh(true)
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUser)}`
      )
      if (!res.ok) {
        toast.error(`GitHub user "${cleanUser}" not found`)
        return
      }
      const data = await res.json()

      if (data.name && !name) setName(data.name)
      if (!srn) setSrn(`@${cleanUser.toLowerCase()}`)
      if (data.bio && !bio) setBio(data.bio)
      if (data.html_url) setGithubUrl(data.html_url)
      if (data.blog && !portfolioUrl) {
        const blogUrl = data.blog.startsWith("http")
          ? data.blog
          : `https://${data.blog}`
        setPortfolioUrl(blogUrl)
      }
      if (data.avatar_url && !photoFile) {
        setPhotoPreview(data.avatar_url)
      }

      toast.success(`Imported profile details from @${cleanUser}! ✨`)
    } catch {
      toast.error("Could not reach GitHub API. Please fill details manually.")
    } finally {
      setFetchingGh(false)
    }
  }

  const toggleSkillChip = (skill: string) => {
    const current = branch
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const exists = current.some((s) => s.toLowerCase() === skill.toLowerCase())

    const next = exists
      ? current.filter((s) => s.toLowerCase() !== skill.toLowerCase())
      : [...current, skill]

    setBranch(next.join(", "))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !name.trim() ||
      !srn.trim() ||
      !email.trim() ||
      !domain ||
      !position ||
      !branch.trim() ||
      !semester
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      let finalPhotoUrl = photoPreview

      if (photoFile) {
        const ext = photoFile.name.split(".").pop() || "jpg"
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("member-photos")
          .upload(fileName, photoFile)

        if (uploadError) throw uploadError

        const { data: pubData } = supabase.storage
          .from("member-photos")
          .getPublicUrl(fileName)

        finalPhotoUrl = pubData.publicUrl
      }

      const normalizedHandle = srn.trim().startsWith("@")
        ? srn.trim().toLowerCase()
        : `@${srn.trim().toLowerCase()}`

      const { error: insertError } = await supabase.from("members").insert([
        {
          name: name.trim(),
          srn: normalizedHandle,
          email: email.trim(),
          domain,
          position,
          branch: branch.trim(),
          semester: Number(semester) || 1,
          bio: bio.trim(),
          photo_url:
            finalPhotoUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name.trim()
            )}&background=6d28d9&color=fff&size=600`,
          github_url: githubUrl.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
          status: "pending",
        },
      ])

      if (insertError) throw insertError

      setSubmittedHandle(normalizedHandle)
      toast.success("Builder card submitted for verification!")
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit builder card"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedHandle) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="grid size-16 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
        >
          <CheckCircle2 className="size-8" />
        </motion.div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Card Claimed ({submittedHandle})
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Your builder profile has been sent to the CraftRoster curator queue.
          Once verified, your interactive card and dedicated{" "}
          <span className="font-mono text-violet-300">
            /u/{submittedHandle.replace(/^@/, "")}
          </span>{" "}
          portfolio link will go live.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-zinc-950 transition-transform hover:scale-105"
          >
            Explore Directory <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-zinc-200 hover:bg-white/10"
          >
            Go to Curator Portal
          </Link>
        </div>
      </div>
    )
  }

  const activeSkills = branch
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-20">
      <div className="mb-10 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          <Sparkles className="size-3.5" /> Builder Onboarding
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Claim your builder card.
        </h1>
        <p className="mt-3 text-sm text-zinc-400 sm:text-base">
          Auto-fill from GitHub in one click or customize your proof-of-work
          card below. Watch your 3D holographic card update in real time.
        </p>
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Onboarding Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-zinc-900/45 p-6 backdrop-blur-xl sm:p-8"
        >
          {/* Fast GitHub Import Banner */}
          <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 p-4">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
              <Wand2 className="size-3.5" /> 1-Click GitHub Auto-Fill
            </label>
            <p className="mt-1 text-xs text-zinc-400">
              Enter your GitHub username to automatically pull your photo, name,
              bio, and links.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Code2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={ghUsername}
                  onChange={(e) => setGhUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  className="h-10 w-full rounded-xl border border-white/12 bg-zinc-950/80 pl-10 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleGitHubAutofill}
                disabled={fetchingGh}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
              >
                {fetchingGh ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" /> Auto-Fill Card
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Full Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-11 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Builder Handle (@handle) *
              </label>
              <input
                required
                value={srn}
                onChange={(e) => setSrn(e.target.value)}
                placeholder="@yourhandle"
                className="h-11 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3.5 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Years Shipping (Experience) *
              </label>
              <input
                required
                type="number"
                min={1}
                max={25}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. 2"
                className="h-11 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Primary Craft Domain *
              </label>
              <select
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className={`h-11 w-full rounded-xl border border-white/12 bg-zinc-950 px-3.5 text-sm focus:border-violet-500 focus:outline-none ${domain ? "text-white" : "text-zinc-500"
                  }`}
              >
                <option value="" disabled>
                  Select a craft domain...
                </option>
                {siteConfig.domains.map((d) => (
                  <option key={d} value={d} className="text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Current Availability *
              </label>
              <select
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={`h-11 w-full rounded-xl border border-white/12 bg-zinc-950 px-3.5 text-sm focus:border-violet-500 focus:outline-none ${position ? "text-white" : "text-zinc-500"
                  }`}
              >
                <option value="" disabled>
                  Select availability...
                </option>
                {siteConfig.roles.map((r) => (
                  <option key={r} value={r} className="text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Input + Clickable Quick-Add Chips */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Primary Stack & Skills (comma separated) *
            </label>
            <input
              required
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Select below or type your stack..."
              className="h-11 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] text-zinc-500">Quick add:</span>
              {SUGGESTED_SKILLS.map((skill) => {
                const selected = activeSkills.includes(skill.toLowerCase())
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkillChip(skill)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all ${selected
                        ? "border-violet-400/60 bg-violet-500/25 text-violet-200"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                      }`}
                  >
                    + {skill}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Builder Statement / Proof of Work *
            </label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What have you built, shipped, or obsessed over recently?"
              className="w-full rounded-xl border border-white/12 bg-zinc-950/70 p-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Profile Photo (or use GitHub avatar above)
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-4 text-xs text-zinc-400 transition-colors hover:border-violet-500/40 hover:bg-white/[0.04] hover:text-white">
              <Upload className="size-4 text-violet-400" />
              <span>
                {photoFile
                  ? photoFile.name
                  : "Upload high-contrast portrait (PNG/JPG, max 5MB)"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Social Links */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">GitHub</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="h-10 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                LinkedIn
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="h-10 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Portfolio / Site
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="h-10 w-full rounded-xl border border-white/12 bg-zinc-950/70 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-zinc-950 shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? "Submitting Card..." : "Submit Builder Card"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        {/* Right Column: Sticky Live 3D Card Preview (Starts completely blank until user inputs data) */}
        <div className="lg:sticky lg:top-24">
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-zinc-400 lg:text-left">
            Live Interactive 3D Preview
          </p>
          <div className="mx-auto max-w-sm">
            <MemberCard
              name={name}
              handle={srn || undefined}
              domain={domain}
              position={position}
              branch={branch}
              semester={semester}
              bio={bio}
              photoUrl={photoPreview}
              github={githubUrl || null}
              linkedin={linkedinUrl || null}
              portfolio={portfolioUrl || null}
              email={email || undefined}
              preview
            />
          </div>
        </div>
      </div>
    </div>
  )
}