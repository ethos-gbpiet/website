import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    Robotics: 'tag-cyan',
    IoT: 'tag-green',
    'AI/ML': 'tag-purple',
    'AR/VR': 'tag-orange',
    'Electric Vehicles': 'tag-orange',
    Planning: 'tag-orange',
    'In Progress': 'tag-cyan',
    Completed: 'tag-green',
    Upcoming: 'tag-cyan',
    Past: 'tag-orange',
    Festival: 'tag-purple',
    Workshop: 'tag-green',
    Seminar: 'tag-cyan',
    Hackathon: 'tag-orange',
    Event: 'tag-cyan',
    Project: 'tag-purple',
    Achievement: 'tag-green',
    General: 'tag-orange',
  }
  return map[cat] ?? 'tag-cyan'
}
