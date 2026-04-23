'use client'

import Link from 'next/link'
import { Cpu, Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { useSiteSettings } from '@/lib/use-site-settings'

const footerLinks = {
  Society: [
    { label: 'About Us',      href: '/about' },
    { label: 'Meet the Team', href: '/team' },
    { label: 'Gallery',       href: '/gallery' },
    { label: 'Resources',     href: '/resources' },
  ],
  Explore: [
    { label: 'Projects',  href: '/projects' },
    { label: 'Events',    href: '/events' },
    { label: 'Bulletin',  href: '/bulletin' },
    { label: 'FAQ',       href: '/faq' },
  ],
  Connect: [
    { label: 'Contact Us',   href: '/contact' },
    { label: 'Collaborate',  href: '/collaborate' },
    { label: 'Feedback',     href: '/feedback' },
    { label: 'Admin Portal', href: '/admin/dashboard' },
  ],
}

export default function Footer() {
  const s = useSiteSettings()   // reads from SiteProvider → API → disk

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-base">
                  {s.siteName.slice(0, 2)}<span className="text-primary">{s.siteName.slice(2)}</span>
                </span>
                <span className="text-[9px] font-mono text-muted-foreground leading-tight">{s.siteTagline}</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {s.collegeFullName}. Building the hardware engineers of tomorrow through
              PCB design, embedded systems, and hands-on innovation.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: s.github,                     icon: Github,   label: 'GitHub' },
                { href: s.twitter,                    icon: Twitter,  label: 'Twitter' },
                { href: s.linkedin,                   icon: Linkedin, label: 'LinkedIn' },
                { href: `mailto:${s.contactEmail}`,   icon: Mail,     label: 'Email' },
              ].map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-display font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors animated-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {s.siteName} — {s.siteTagline}, {s.collegeFullName}.
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            Est. {s.foundedYear} &nbsp;·&nbsp; Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
