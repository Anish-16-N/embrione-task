"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ImagePlus, Loader2 } from "lucide-react"
import { EASE_OUT } from "@/lib/motion"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabaseClient"
import { BIO_MAX, BIO_MIN, BRANCHES, DOMAINS, POSITIONS, SEMESTERS } from "@/lib/types"
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

const EMPTY = {
  name: "",
  domain: "",
  position: "",
  srn: "",
  email: "",
  linkedin_url: "",
  github_url: "",
  branch: "",
  semester: "",
  bio: "",
}

// Makes "github.com/me" into "https://github.com/me" so the link works when clicked.
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

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={item}
      className="space-y-4 rounded-3xl bg-card p-6"
    >
      <h2 className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target
    const field = e.target.dataset.field as keyof typeof EMPTY | undefined

    if (!field) return

    setFormData((prev) => ({
      ...prev,
      [field]: field === "srn" ? value.toUpperCase() : value,
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

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0]

    if (!selected) return

    // Local preview straight away. Nothing is uploaded until the form is submitted.
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)

    const url = URL.createObjectURL(selected)

    previewRef.current = url
    setPreviewUrl(url)
    setFile(null)
    setPhotoInfo("")
    setProcessing(true)

    try {
      // Convert to WebP in the browser (max 800px, quality 0.8).
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
        `Converted to WebP (${Math.max(
          1,
          Math.round(webpFile.size / 1024)
        )} KB)`
      )
    } catch (error) {
      console.error("Error compressing image:", error)
      toast.error("Failed to process image")
      clearPhoto()
    } finally {
      setProcessing(false)
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

    const bioLength = formData.bio.trim().length

    if (bioLength < BIO_MIN || bioLength > BIO_MAX) {
      toast.error(
        `Your bio must be ${BIO_MIN} to ${BIO_MAX} characters (now ${bioLength}).`
      )
      return
    }

    setIsSubmitting(true)

    try {
      const srn = formData.srn.trim().toUpperCase()

      // 1. Check if SRN already submitted.
      const { data: existing } = await supabase
        .from("members")
        .select("id")
        .eq("srn", srn)
        .maybeSingle()

      if (existing) {
        toast.error(
          "An application with this SRN has already been submitted."
        )
        return
      }

      // 2. Upload the WebP photo to Supabase Storage.
      const fileName = `${srn.replace(/[^A-Z0-9]/g, "")}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(fileName, file, {
          contentType: "image/webp",
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from("member-photos")
        .getPublicUrl(fileName)

      // 3. Save the profile with status 'pending'.
      const { error: insertError } = await supabase.from("members").insert({
        name: formData.name.trim(),
        domain: formData.domain,
        position: formData.position,
        srn,
        email: formData.email.trim(),
        linkedin_url: normalizeUrl(formData.linkedin_url),
        github_url: normalizeUrl(formData.github_url),
        branch: formData.branch,
        semester: parseInt(formData.semester),
        bio: formData.bio.trim(),
        photo_url: publicUrlData.publicUrl,
        status: "pending",
      })

      if (insertError) throw insertError

      toast.success(
        "Profile submitted successfully! Pending admin approval."
      )

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

  // How much of the card is filled in.
  const done = [
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="mb-10 max-w-2xl"
      >
        <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          Make your Card
        </h1>

        <p className="mt-3 text-muted-foreground">
          Fill in your details and watch your card come to life. An admin
          reviews every profile before it goes public.
        </p>
      </motion.header>

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
                className="flex flex-col items-center rounded-2xl border border-primary/30 bg-card px-6 py-16 text-center"
              >
                <motion.svg
                  viewBox="0 0 52 52"
                  className="size-20"
                  fill="none"
                >
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

                <h2 className="mt-6 text-2xl font-bold">
                  You&apos;re in the queue
                </h2>

                <p className="mt-2 max-w-sm text-muted-foreground">
                  Your profile was submitted and is waiting for admin approval.
                  Once approved it will appear on the team page.
                </p>

                <Button
                  className="mt-8 h-10 px-5"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another profile
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
                <Section title="Who you are">
                  <Field
                    label="Full Name *"
                    htmlFor="reg-full-name"
                  >
                    <Input
                      id="reg-full-name"
                      name="reg_full_name_x1"
                      data-field="name"
                      autoComplete="off"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={fieldClass}
                      required
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Domain *">
                      <Select
                        value={formData.domain}
                        onValueChange={(v) =>
                          handleSelectChange("domain", v)
                        }
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
                          <SelectValue placeholder="Select Domain" />
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

                    <Field label="Position *">
                      <Select
                        value={formData.position}
                        onValueChange={(v) =>
                          handleSelectChange("position", v)
                        }
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
                          <SelectValue placeholder="Select Position" />
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

                <Section title="Student details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="SRN *"
                      htmlFor="reg-srn"
                    >
                      <Input
                        id="reg-srn"
                        name="reg_srn_x1"
                        data-field="srn"
                        autoComplete="off"
                        value={formData.srn}
                        onChange={handleInputChange}
                        placeholder="PES1UG23CS001"
                        className={fieldClass}
                        required
                      />
                    </Field>

                    <Field
                      label="Email *"
                      htmlFor="reg-email"
                    >
                      <Input
                        id="reg-email"
                        name="reg_email_x1"
                        data-field="email"
                        type="email"
                        autoComplete="off"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@pes.edu"
                        className={fieldClass}
                        required
                      />
                    </Field>

                    <Field label="Branch *">
                      <Select
                        value={formData.branch}
                        onValueChange={(v) =>
                          handleSelectChange("branch", v)
                        }
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>

                        <SelectContent>
                          {BRANCHES.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Semester *">
                      <Select
                        value={formData.semester}
                        onValueChange={(v) =>
                          handleSelectChange("semester", v)
                        }
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>

                        <SelectContent>
                          {SEMESTERS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </Section>

                <Section title="Links (optional)">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="LinkedIn URL"
                      htmlFor="reg-linkedin"
                    >
                      <Input
                        id="reg-linkedin"
                        name="reg_linkedin_x1"
                        data-field="linkedin_url"
                        autoComplete="off"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/your-name"
                        className={fieldClass}
                      />
                    </Field>

                    <Field
                      label="GitHub URL"
                      htmlFor="reg-github"
                    >
                      <Input
                        id="reg-github"
                        name="reg_github_x1"
                        data-field="github_url"
                        autoComplete="off"
                        value={formData.github_url}
                        onChange={handleInputChange}
                        placeholder="github.com/your-username"
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="About you">
                  <Field
                    label="Short Description / Bio *"
                    htmlFor="reg-bio"
                  >
                    <Textarea
                      id="reg-bio"
                      name="reg_bio_x1"
                      data-field="bio"
                      autoComplete="off"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
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

                  <Field
                    label="Profile Picture *"
                    htmlFor="photo"
                  >
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
                          {photoInfo ||
                            "It is converted to WebP in your browser before upload."}
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
                    className="h-11 w-full text-base"
                    disabled={isSubmitting || processing}
                  >
                    {isSubmitting && (
                      <Loader2 className="size-4 animate-spin" />
                    )}

                    {isSubmitting ? "Submitting..." : "Submit Profile"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        {/* Live preview */}
        <aside className="order-1 mx-auto w-full max-w-sm lg:sticky lg:top-24 lg:order-2 lg:max-w-none">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Live card preview
            </span>

            <span className="tabular-nums text-muted-foreground">
              {percent === 100 ? "Ready to submit" : `${percent}% complete`}
            </span>
          </div>

          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-primary"
              initial={false}
              animate={{ scaleX: percent / 100 }}
              transition={{ duration: 0.25, ease: EASE_OUT }
              }
            />
          </div>
          <motion.div
            animate={{ rotate: percent === 100 ? 0 : -3 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
          >
            <MemberCard
              preview
              name={formData.name}
              domain={formData.domain}
              position={formData.position}
              branch={formData.branch}
              semester={formData.semester}
              bio={formData.bio}
              photoUrl={previewUrl || null}
              github={normalizeUrl(formData.github_url)}
              linkedin={normalizeUrl(formData.linkedin_url)}
            />
          </motion.div>
        </aside>
      </div>
    </div>
  )
}