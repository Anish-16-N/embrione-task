'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { EASE_OUT } from '@/lib/motion'
import { siteConfig } from '@/lib/siteConfig'
import MemberCard from '@/components/MemberCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [positionFilter, setPositionFilter] = useState('All')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const domainParam = params.get('domain')
    if (domainParam && siteConfig.domains.includes(domainParam)) {
      setDomainFilter(domainParam)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        if (error) throw error
        setMembers(data || [])
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = members.filter((m) => {
    if (domainFilter !== 'All' && m.domain !== domainFilter) return false
    if (positionFilter !== 'All' && m.position !== positionFilter) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = m.name?.toLowerCase().includes(q)
      const matchBio = m.bio?.toLowerCase().includes(q)
      const matchStack = m.branch?.toLowerCase().includes(q)
      if (!matchName && !matchBio && !matchStack) return false
    }
    return true
  })

  const hasActiveFilters = domainFilter !== 'All' || positionFilter !== 'All' || searchQuery.trim() !== ''

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <h1 className="text-5xl font-semibold leading-none tracking-tight sm:text-7xl">The roster.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Discover verified engineers, designers, and builders across {siteConfig.name}.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, skill, bio..."
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <Select value={domainFilter} onValueChange={(v) => v && setDomainFilter(v)}>
            <SelectTrigger className="w-[175px]"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All domains</SelectItem>
              {siteConfig.domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={positionFilter} onValueChange={(v) => v && setPositionFilter(v)}>
            <SelectTrigger className="w-[165px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {siteConfig.roles.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-16">
        {loading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-muted motion-safe:animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-20">
            <p className="text-muted-foreground">No builders match these filters.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setDomainFilter('All')
                  setPositionFilter('All')
                  setSearchQuery('')
                }}
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium hover:bg-white/5"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-14 pb-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              <div key={m.id} className="lg:[&:nth-child(3n+2)]:translate-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.3, delay: (i % 3) * 0.05, ease: EASE_OUT }}
                >
                  <MemberCard
                    name={m.name}
                    domain={m.domain}
                    position={m.position}
                    branch={m.branch}
                    semester={m.semester}
                    bio={m.bio}
                    photoUrl={m.photo_url}
                    linkedin={m.linkedin_url}
                    github={m.github_url}
                    email={m.email}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}