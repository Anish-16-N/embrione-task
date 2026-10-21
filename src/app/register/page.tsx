// src/app/register/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ImagePlus, Loader2, Search, Sparkles } from "lucide-react"
import { EASE_OUT } from "@/lib/motion"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabaseClient"
import { BIO_MAX, BIO_MIN, DOMAINS, POSITIONS } from "@/lib/types"
import MemberCard from "@/components/MemberCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const DRAFT_KEY = "craftroster_card_draft_v1"

const EMPTY = {
  name: "",
  domain: "",
  position: "",
  srn: "", // Used for @handle
  email: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  branch: "", // Used for Primary Tech Stack / Headline
  semester: "", // Used for Years of Experience
  bio: "",
}

const HANDLE_PATTERN = /^@?[a-zA-Z0-9_-]{3,24}$/

const normalizeUrl = (value: string) => {
  const t = value.trim()
  if (!t) return null
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

const fieldClass =
  "h-10 border-white/10 bg-white/[0.04] focus-visible:border-primary/60 focus-visible:ring-primary/20"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASE_OUT,
    },
  },
}

// Conditional prompt based on selected domain
function getDomainSpecificPrompt(domain: string) {
  switch (domain) {
    case "UI/UX Design":
      return {
        label: "Figma / Behance / Dribbble Showcase URL",
        placeholder: "dribbble.com/your-handle",
      }
    case "Web Development":
    case "Full-Stack":
    case "Mobile Dev":
      return {
        label: "Live Project / Featured Deployment URL",
        placeholder: "myproject.vercel.app",
      }
    case "AI & ML":
      return {
        label: "HuggingFace / Research / Demo URL",
        placeholder: "huggingface.co/your-handle",
      }
    default:
      return {
        label: "Personal Website / Portfolio URL",
        placeholder: "yourname.dev",
      }
  }
}

function Section({
  title,
  badge,
  children,
}: {
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <motion.div variants={item} className="space-y-4 rounded-3xl border border-white/5 bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {badge && (
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

export default function RegisterPage() {
  const [formData, setFormData] = useState(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [photoInfo, setPhotoInfo] = useState("")
  const [processing, setProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [lastSubmittedHandle, setLastSubmittedHandle] = useState("")

  // Application Status Tracker state
  const [trackHandle, setTrackHandle] = useState("")
  const [trackResult, setTrackResult] = useState<{
    name: string
    status: "pending" | "approved" | "rejected"
    domain: string
  } | null>(null)
  const [tracking, setTracking] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setFormData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // Ignore storage errors
    }
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  // Auto-save draft to localStorage whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
    } catch {
      // Ignore storage errors
    }
  }, [formData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target
    const field = e.target.dataset.field as keyof typeof EMPTY | undefined
    if (!field) return

    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "srn"
          ? value.startsWith("@")
            ? value.toLowerCase()
            : value
              ? `@${value.toLowerCase()}`
              : ""
          : value,
    }))
  }

  const handleSelectChange = (name: string, value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const clearPhoto = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
    setPreviewUrl("")
    setFile(null)
    setPhotoInfo("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = URL.createObjectURL(selected)
    previewRef.current = url
    setPreviewUrl(url)
    setFile(null)
    setPhotoInfo("")
    setProcessing(true)

    try {
      const blob = await imageCompression(selected, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      })

      const webpFile = new File([blob], "profile.webp", {
        type: "image/webp",
      })

      setFile(webpFile)
      setPhotoInfo(
        `Converted to WebP (${Math.max(1, Math.round(webpFile.size / 1024))} KB)`
      )
    } catch (error) {
      console.error("Error compressing image:", error)
      toast.error("Failed to process image")
      clearPhoto()
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackHandle.trim()) return
    setTracking(true)
    setTrackResult(null)
    const cleanHandle = trackHandle.trim().startsWith("@")
      ? trackHandle.trim().toLowerCase()
      : `@${trackHandle.trim().toLowerCase()}`

    try {
      const { data, error } = await supabase
        .from("members")
        .select("name, status, domain")
        .ilike("srn", cleanHandle)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        toast.error(`No application found for ${cleanHandle}`)
      } else {
        setTrackResult(data as any)
      }
    } catch {
      toast.error("Could not check status right now")
    } finally {
      setTracking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error("Please select a profile picture")
      return
    }

    if (
      !formData.name ||
      !formData.domain ||
      !formData.position ||
      !formData.srn ||
      !formData.email ||
      !formData.branch ||
      !formData.semester
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!HANDLE_PATTERN.test(formData.srn.trim())) {
      toast.error("Handle must be 3–24 characters (letters, numbers, _ or -)")
      return
    }

    const bioLength = formData.bio.trim().length
    if (bioLength < BIO_MIN || bioLength > BIO_MAX) {
      toast.error(
        `Your bio must be ${BIO_MIN} to ${BIO_MAX} characters (now ${bioLength}).`
      )
      return
    }

    setIsSubmitting(true)

    try {
      const handle = formData.srn.trim().startsWith("@")
        ? formData.srn.trim().toLowerCase()
        : `@${formData.srn.trim().toLowerCase()}`

      // 1. Check if @handle already exists
      const { data: existing } = await supabase
        .from("members")
        .select("id")
        .ilike("srn", handle)
        .maybeSingle()

      if (existing) {
        toast.error(`The handle ${handle} is already claimed.`)
        return
      }

      // 2. Upload the WebP photo to Supabase Storage
      const fileName = `${handle.replace(/[^a-z0-9]/gi, "")}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(fileName, file, {
          contentType: "image/webp",
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from("member-photos")
        .getPublicUrl(fileName)

      // 3. Save profile with status 'pending'
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        domain: formData.domain,
        position: formData.position,
        srn: handle,
        email: formData.email.trim(),
        linkedin_url: normalizeUrl(formData.linkedin_url),
        github_url: normalizeUrl(formData.github_url),
        branch: formData.branch.trim(),
        semester: Math.max(0, parseInt(formData.semester) || 1),
        bio: formData.bio.trim(),
        photo_url: publicUrlData.publicUrl,
        status: "pending",
      }

      if (formData.portfolio_url.trim()) {
        payload.portfolio_url = normalizeUrl(formData.portfolio_url)
      }

      const { error: insertError } = await supabase.from("members").insert(payload)
      if (insertError) throw insertError

      toast.success("Card claimed! Pending curator verification.")
      setLastSubmittedHandle(handle)
      localStorage.removeItem(DRAFT_KEY)
      setFormData(EMPTY)
      clearPhoto()
      setSubmitted(true)
    } catch (error) {
      console.error("Submit failed:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during submission"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const done =
    [
      formData.name,
      formData.domain,
      formData.position,
      formData.srn,
      formData.email,
      formData.branch,
      formData.semester,
    ].filter(Boolean).length +
    (formData.bio.trim().length >= BIO_MIN ? 1 : 0) +
    (file ? 1 : 0)

  const percent = Math.round((done / 9) * 100)
  const bioLength = formData.bio.length
  const bioOk = formData.bio.trim().length >= BIO_MIN
  const dynamicPrompt = getDomainSpecificPrompt(formData.domain)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            Claim your Card.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Craft your builder profile and watch your card come to life. Progress
            is auto-saved locally as you type.
          </p>
        </motion.header>

        {/* Live Application Status Tracker */}
        <form
          onSubmit={handleCheckStatus}
          className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-card p-3 sm:flex-row sm:items-center"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackHandle}
              onChange={(e) => setTrackHandle(e.target.value)}
              placeholder="Track status by @handle"
              className="h-9 w-full pl-8 text-xs sm:w-48"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={tracking} className="h-9 text-xs">
            {tracking ? "Checking..." : "Check Status"}
          </Button>
          {trackResult && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${trackResult.status === "approved"
                ? "bg-emerald-500/15 text-emerald-300"
                : trackResult.status === "rejected"
                  ? "bg-red-500/15 text-red-300"
                  : "bg-amber-500/15 text-amber-300"
                }`}
            >
              {trackResult.status === "approved"
                ? "✓ Verified & Live"
                : trackResult.status === "rejected"
                  ? "× Not Selected"
                  : "⏳ Under Review"}
            </span>
          )}
        </form>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Form */}
        <section className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center rounded-3xl border border-primary/30 bg-card px-6 py-16 text-center"
              >
                <motion.svg viewBox="0 0 52 52" className="size-20" fill="none">
                  <motion.circle
                    cx="26"
                    cy="26"
                    r="23"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.path
                    d="M15 27l8 8 14-16"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, delay: 0.5 }}
                  />
                </motion.svg>

                <h2 className="mt-6 text-2xl font-bold">You&apos;re in the verification queue</h2>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  Your card (<span className="font-mono text-foreground">{lastSubmittedHandle}</span>) has been submitted. Use your handle in the tracker above to check your live verification status.
                </p>

                <Button className="mt-8 h-10 px-5" onClick={() => setSubmitted(false)}>
                  Create another card
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                autoComplete="off"
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <Section title="Builder Identity" badge="Auto-saved">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name *" htmlFor="reg-full-name">
                      <Input
                        id="reg-full-name"
                        data-field="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Alex Rivera"
                        className={fieldClass}
                        required
                      />
                    </Field>

                    <Field label="Unique @Handle *" htmlFor="reg-srn">
                      <Input
                        id="reg-srn"
                        data-field="srn"
                        value={formData.srn}
                        onChange={handleInputChange}
                        placeholder="@alexrivera"
                        className={fieldClass}
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Primary Craft / Domain *">
                      <Select
                        value={formData.domain}
                        onValueChange={(v) => handleSelectChange("domain", v)}
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
                          <SelectValue placeholder="Select Craft" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOMAINS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Availability Status *">
                      <Select
                        value={formData.position}
                        onValueChange={(v) => handleSelectChange("position", v)}
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </Section>

                <Section title="Craft & Experience">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Primary Stack / Headline *" htmlFor="reg-branch">
                      <Input
                        id="reg-branch"
                        data-field="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        placeholder="Next.js, TypeScript, Figma"
                        className={fieldClass}
                        required
                      />
                    </Field>

                    <Field label="Years of Experience *" htmlFor="reg-semester">
                      <Input
                        id="reg-semester"
                        data-field="semester"
                        type="number"
                        min={0}
                        max={40}
                        value={formData.semester}
                        onChange={handleInputChange}
                        placeholder="3"
                        className={fieldClass}
                        required
                      />
                    </Field>

                    <Field label="Contact Email *" htmlFor="reg-email">
                      <Input
                        id="reg-email"
                        data-field="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="alex@domain.com"
                        className={fieldClass}
                        required
                      />
                    </Field>

                    {/* Domain-Specific Conditional Field */}
                    <Field label={dynamicPrompt.label} htmlFor="reg-portfolio">
                      <Input
                        id="reg-portfolio"
                        data-field="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        placeholder={dynamicPrompt.placeholder}
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="Social Proof (Optional)">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="GitHub URL" htmlFor="reg-github">
                      <Input
                        id="reg-github"
                        data-field="github_url"
                        value={formData.github_url}
                        onChange={handleInputChange}
                        placeholder="github.com/your-username"
                        className={fieldClass}
                      />
                    </Field>

                    <Field label="LinkedIn URL" htmlFor="reg-linkedin">
                      <Input
                        id="reg-linkedin"
                        data-field="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/your-name"
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="About You">
                  <Field label="Builder Bio *" htmlFor="reg-bio">
                    <Textarea
                      id="reg-bio"
                      data-field="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="What are you building, shipping, or exploring right now?"
                      className="min-h-28 border-white/10 bg-white/[0.04] focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      maxLength={BIO_MAX}
                      required
                    />
                    <p
                      className={`text-right text-xs transition-colors ${bioOk ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                      {bioLength}/{BIO_MAX} characters (minimum {BIO_MIN})
                    </p>
                  </Field>

                  <Field label="Profile Picture *" htmlFor="photo">
                    <label
                      htmlFor="photo"
                      className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 transition-colors hover:border-primary/60 hover:bg-primary/5 has-[:focus-visible]:border-primary"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                        {processing ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : file ? (
                          <Check className="size-5" />
                        ) : (
                          <ImagePlus className="size-5" />
                        )}
                      </span>

                      <span className="min-w-0 text-sm">
                        <span className="block font-medium">
                          {processing
                            ? "Converting to WebP..."
                            : file
                              ? "Photo ready"
                              : "Choose a PNG or JPG photo"}
                        </span>
                        <span className="block truncate text-muted-foreground">
                          {photoInfo || "Converted to WebP in your browser before upload."}
                        </span>
                      </span>

                      <input
                        id="photo"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="sr-only"
                      />
                    </label>
                  </Field>
                </Section>

                <motion.div variants={item}>
                  <Button
                    type="submit"
                    className="h-11 w-full gap-2 text-base"
                    disabled={isSubmitting || processing}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {isSubmitting ? "Submitting..." : "Claim Your Card"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        {/* Live preview */}
        <aside className="order-1 mx-auto w-full max-w-sm lg:sticky lg:top-24 lg:order-2 lg:max-w-none">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Live card preview</span>
            <span className="tabular-nums text-muted-foreground">
              {percent === 100 ? "Ready to submit" : `${percent}% complete`}
            </span>
          </div>

          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-primary"
              initial={false}
              animate={{ scaleX: percent / 100 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            />
          </div>

          <motion.div
            animate={{ rotate: percent === 100 ? 0 : -3 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
          >
            <MemberCard
              preview
              name={formData.name}
              handle={formData.srn}
              domain={formData.domain}
              position={formData.position}
              branch={formData.branch}
              semester={formData.semester}
              bio={formData.bio}
              photoUrl={previewUrl || null}
              github={normalizeUrl(formData.github_url)}
              linkedin={normalizeUrl(formData.linkedin_url)}
              portfolio={normalizeUrl(formData.portfolio_url)}
            />
          </motion.div>
        </aside>
      </div>
    </div>
  )
}