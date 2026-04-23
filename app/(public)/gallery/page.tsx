'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { gallery as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

const categories = ['All', 'Events', 'Projects', 'Workshops', 'Team']

export default function GalleryPage() {
  const s = useSiteSettings()
  const gallery = useApiData('/api/gallery', seed)
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<null | any>(null)

  const filtered = gallery.filter(
    (g) => activeCategory === 'All' || g.category === activeCategory
  )

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// media_gallery</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Gallery &amp; <span className="gradient-text">Memories</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            A visual record of our projects, events, workshops, and the people who make {s.siteName} special.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border py-3">
        <div className="container mx-auto px-4 max-w-7xl flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                activeCategory === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry grid */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid group relative overflow-hidden rounded-xl cursor-pointer border border-border card-hover"
                onClick={() => setLightbox(item)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <ZoomIn className="w-6 h-6 text-primary" />
                  <p className="text-sm font-medium text-center leading-tight">{item.title}</p>
                  <span className="tag tag-cyan">{item.category}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center py-24 text-muted-foreground">No images in this category.</p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.title}
              className="w-full rounded-xl shadow-2xl max-h-[75vh] object-contain"
            />
            <div className="mt-4 text-center">
              <p className="font-display font-semibold">{lightbox.title}</p>
              <span className="tag tag-cyan mt-2">{lightbox.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
