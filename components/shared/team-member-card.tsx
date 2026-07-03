'use client'

import { Github, Linkedin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { team } from '@/data'

type Member = (typeof team)[0]

interface TeamMemberCardProps {
  member: Member
  /** 'full' shows bio and social links, 'compact' is a small horizontal card */
  variant?: 'full' | 'compact'
}

/**
 * Reusable team member card.
 * Falls back to a generated avatar via ui-avatars if the src errors.
 */
export function TeamMemberCard({
  member,
  variant = 'full',
}: TeamMemberCardProps) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    member.name
  )}&background=00E5FF&color=050c14&size=80`

  if (variant === 'compact') {
    return (
      <Card className="card-hover p-4 flex gap-3 items-start">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = fallback
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{member.name}</p>
          <p className="text-xs text-primary font-mono">{member.role}</p>
          <p className="text-xs text-muted-foreground">{member.domain}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="card-hover p-6 text-center group">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = fallback
          }}
        />
      </div>

      <h3 className="font-display font-bold text-lg">{member.name}</h3>
      <p className="text-primary text-sm font-mono mb-1">{member.role}</p>
      <p className="text-xs text-muted-foreground mb-3">{member.year}</p>

      <Badge variant="outline" className="mb-4 text-xs">
        {member.domain}
      </Badge>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {member.bio}
      </p>

      {/* Social links */}
      <div className="flex items-center justify-center gap-2">
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`${member.name} GitHub`}
        >
          <Github className="w-4 h-4" />
        </a>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`${member.name} LinkedIn`}
        >
          <Linkedin className="w-4 h-4" />
        </a>
      </div>
    </Card>
  )
}
