'use client'

import { useState } from 'react'
import { Mail, MailOpen, Trash2, Reply } from 'lucide-react'
import { Card } from '@/components/ui/card'

const messages = [
  { id: '1', name: 'Prof. R. Sharma', email: 'r.sharma@iet.edu', subject: 'Collaboration on IoT curriculum', message: 'Hi EtHOS team, I\'d love to collaborate on integrating IoT practical sessions into the 3rd year ECE curriculum. Could we set up a meeting?', category: 'General Inquiry', date: '2025-03-17', read: false },
  { id: '2', name: 'StartUp XYZ', email: 'contact@startupxyz.io', subject: 'Event Sponsorship Offer', message: 'We are a hardware startup looking to connect with talented engineering students. We\'d like to sponsor your next hackathon with ₹50,000 and mentorship.', category: 'Event Sponsorship', date: '2025-03-16', read: false },
  { id: '3', name: 'Riya Patel', email: 'riya.p@student.iet.edu', subject: 'Component Library Access', message: 'I\'m working on a personal project and wanted to know if non-members can borrow components from the EtHOS component lab.', category: 'Membership', date: '2025-03-14', read: true },
  { id: '4', name: 'IET National', email: 'chapters@iet.org', subject: 'Chapter Annual Report Submission', message: 'This is a reminder that the annual chapter activity report is due by April 15. Please submit via the IET chapters portal.', category: 'General Inquiry', date: '2025-03-12', read: true },
  { id: '5', name: 'Tech Daily Blog', email: 'editor@techdaily.in', subject: 'Feature Story Request', message: 'We are writing a piece on student technical societies in India and would love to feature EtHOS. Could we schedule a short interview?', category: 'Media & Press', date: '2025-03-08', read: true },
]

export default function ViewMessages() {
  const [items, setItems] = useState(messages)
  const [selected, setSelected] = useState<typeof messages[0] | null>(null)

  function markRead(id: string) {
    setItems(items.map((m) => m.id === id ? { ...m, read: true } : m))
  }

  function handleDelete(id: string) {
    setItems(items.filter((m) => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function openMessage(msg: typeof messages[0]) {
    markRead(msg.id)
    setSelected(msg)
  }

  const unreadCount = items.filter((m) => !m.read).length

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? <span className="text-primary font-mono">{unreadCount} unread</span> : 'All read'} · {items.length} total
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5 min-h-[60vh]">
        {/* Message list */}
        <div className="lg:col-span-2 space-y-2">
          {items.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === msg.id
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border hover:border-primary/20 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {!msg.read ? (
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <MailOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-sm font-medium truncate ${!msg.read ? '' : 'text-muted-foreground'}`}>
                    {msg.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{msg.date}</span>
              </div>
              <p className={`text-xs truncate ${!msg.read ? 'font-medium' : 'text-muted-foreground'}`}>
                {msg.subject}
              </p>
            </button>
          ))}
          {items.length === 0 && (
            <p className="text-center py-12 text-sm text-muted-foreground">No messages.</p>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <Card className="p-6 h-full">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-display font-semibold text-lg mb-1">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground">{selected.name} · <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{selected.date} · {selected.category}</p>
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 mb-6">
                <p className="text-sm leading-relaxed">{selected.message}</p>
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Reply className="w-4 h-4" /> Reply via Email
              </a>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a message to read</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
