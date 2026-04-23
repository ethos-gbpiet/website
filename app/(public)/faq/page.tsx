'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { faqs as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

export default function FAQPage() {
  const s = useSiteSettings()
  const faqs = useApiData('/api/faqs', seed)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const categories = [...new Set(faqs.map((f: any) => f.category))]

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => setOpen(open === id ? null : id)

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative text-center">
          <p className="text-xs font-mono text-primary mb-3">// faq</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Got questions about {s.siteName}? We have answered the most common ones below.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-10">
          {categories.map((cat) => {
            const catFaqs = filtered.filter((f) => f.category === cat)
            if (catFaqs.length === 0) return null
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-display font-bold">{cat}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {catFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30"
                    >
                      <button
                        onClick={() => toggle(faq.id)}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left bg-card hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-sm">{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open === faq.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {open === faq.id && (
                        <div className="px-5 py-4 bg-muted/30 border-t border-border">
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No results for "{search}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try a different search term or browse all FAQs.</p>
            </div>
          )}

          {/* Still have questions */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h3 className="font-display font-bold text-lg mb-2">Still have questions?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Can't find the answer you're looking for? Reach out to the team directly.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
