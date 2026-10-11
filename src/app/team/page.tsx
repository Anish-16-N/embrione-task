'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { supabase } from '@/lib/supabaseClient'
import { EASE_OUT } from '@/lib/motion'
import MemberCard from '@/components/MemberCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const domains = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const positions = ['Head', 'Vice-Head', 'Core Member', 'Member']

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState('All')
  const [positionFilter, setPositionFilter] = useState('All')

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
    return true
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <h1 className="text-5xl font-semibold leading-none tracking-tight sm:text-7xl">The team.</h1>
          <p className="mt-4 max-w-sm text-muted-foreground">The people behind The Embrione.</p>
        </motion.div>

        <div className="flex gap-3">
          <Select value={domainFilter} onValueChange={(v) => v && setDomainFilter(v)}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All domains</SelectItem>
              {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={(v) => v && setPositionFilter(v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Position" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All positions</SelectItem>
              {positions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
          <p className="py-20 text-muted-foreground">No members match these filters.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-14 pb-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              // Outer div shifts the middle column down; inner div does the scroll-in animation.
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