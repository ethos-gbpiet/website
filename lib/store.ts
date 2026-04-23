// ─── EtHOS Persistent Store ──────────────────────────────────────────────────
// All data is saved to localStorage so admin changes persist across sessions.
// In production, replace localStorage calls with API/database calls.

export interface TeamMember {
  id: string
  name: string
  role: string
  year: string          // e.g. "4th Year, ECE"
  yearNum: 1 | 2 | 3 | 4 | 5  // numeric for sorting (5 = faculty/mentor)
  bio: string
  domain: string
  photo?: string        // base64 data URL
  resume?: string       // base64 PDF data URL
  github?: string
  linkedin?: string
  email?: string
  section: 'faculty' | 'leadership' | 'core' | 'technical' | 'events' | 'member'
  featured?: boolean
}

export interface SiteSettings {
  siteName: string
  siteTagline: string
  heroHeading: string[]        // array of lines e.g. ["Design.", "Build.", "Power."]
  heroSubtext: string
  aboutTitle: string
  aboutBody: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  contactHours: string
  github: string
  twitter: string
  linkedin: string
  collegeFullName: string
  foundedYear: string
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultSettings: SiteSettings = {
  siteName: 'EtHOS',
  siteTagline: 'Electronics and Hardware Oriented Society',
  heroHeading: ['Design.', 'Build.', 'Power.'],
  heroSubtext:
    'EtHOS is the Electronics and Hardware Oriented Society of IET College. We design PCBs, build embedded systems, and push the boundaries of hardware engineering — from schematics to silicon.',
  aboutTitle: 'Where the schematic becomes real',
  aboutBody:
    'EtHOS is the dedicated electronics and hardware society of IET College, Dehradun. Founded to bridge the gap between classroom theory and real-world circuit design, we give students access to professional PCB tools, a fully-stocked component lab, and a community of engineers obsessed with making things work.',
  contactEmail: 'ethos@iet.edu',
  contactPhone: '+91 98765 43210',
  contactAddress: 'PCB Lab, Block D, IET College, Dehradun — 248001',
  contactHours: 'Mon – Sat, 10 AM – 8 PM',
  github: 'https://github.com/ethos-iet',
  twitter: 'https://twitter.com',
  linkedin: 'https://linkedin.com',
  collegeFullName: 'IET College, Dehradun',
  foundedYear: '2014',
}

export const defaultTeam: TeamMember[] = [
  // Faculty / Mentors
  { id: 'f1', name: 'Dr. Suresh Rao',   role: 'Faculty Coordinator', year: 'Associate Professor, ECE', yearNum: 5, bio: 'PhD in VLSI Design from IIT Delhi. Guides EtHOS on research, industry partnerships, and academic publishing. 20+ years in embedded systems research.', domain: 'VLSI & Embedded', section: 'faculty', linkedin: 'https://linkedin.com', email: 'suresh.rao@iet.edu', featured: true },
  { id: 'f2', name: 'Prof. Anita Sharma', role: 'Faculty Mentor',    year: 'Assistant Professor, EEE', yearNum: 5, bio: 'Specialises in power electronics and renewable energy. Mentors the Power Track team and oversees lab safety protocols.', domain: 'Power Electronics', section: 'faculty', linkedin: 'https://linkedin.com', email: 'anita.sharma@iet.edu', featured: true },
  // Leadership
  { id: 'l1', name: 'Arjun Mehta',  role: 'President',       year: '4th Year, ECE', yearNum: 4, bio: 'Hardware architect behind the 32-bit RISC-V core project. IEEE student branch chair. SIH 2023 winner. Passionate about open-source silicon.', domain: 'FPGA & Digital',    section: 'leadership', github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'arjun@iet.edu', featured: true },
  { id: 'l2', name: 'Priya Sharma', role: 'Vice President',   year: '3rd Year, EEE', yearNum: 3, bio: 'Power electronics specialist. Designed the 100W Class-D amplifier from schematic to working prototype. Led 3 national competition teams.', domain: 'Power Electronics', section: 'leadership', github: 'https://github.com', linkedin: 'https://linkedin.com', featured: true },
  // Core
  { id: 'c1', name: 'Rohan Verma',  role: 'Technical Secretary', year: '3rd Year, ECE', yearNum: 3, bio: 'Manages project timelines and cross-team coordination. Expert in embedded C and bare-metal STM32 development.', domain: 'Embedded Systems', section: 'core', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'c2', name: 'Aisha Khan',   role: 'Finance Head',         year: '3rd Year, CS',  yearNum: 3, bio: 'Handles sponsorships, budgeting, and lab procurement. Negotiated the TI University Program partnership.', domain: 'Management', section: 'core', linkedin: 'https://linkedin.com', email: 'aisha@iet.edu' },
  { id: 'c3', name: 'Vikram Nair',  role: 'Design Head',          year: '2nd Year, IT',  yearNum: 2, bio: 'Creates all PCB aesthetics, branding assets, and workshop materials. KiCad power user with 40+ PCB layouts.', domain: 'PCB Design', section: 'core', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'c4', name: 'Sneha Patel',  role: 'Research Lead',        year: '4th Year, ECE', yearNum: 4, bio: 'Published paper on LoRa mesh networks at IEEE ISED 2024. Leads the RF & Wireless domain and external research collaborations.', domain: 'RF & Wireless', section: 'core', github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'sneha@iet.edu' },
  // Technical
  { id: 't1', name: 'Dev Choudhary', role: 'Embedded Systems Lead', year: '3rd Year, ECE', yearNum: 3, bio: 'FreeRTOS and bare-metal firmware for every major EtHOS project. Loves oscilloscopes more than people.', domain: 'Embedded Systems', section: 'technical', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 't2', name: 'Meera Iyer',    role: 'PCB Design Lead',       year: '3rd Year, EEE', yearNum: 3, bio: 'High-density PCB routing specialist. Managed the 4-layer biosignal acquisition board that won Best Hardware at SIH 2024.', domain: 'PCB Design', section: 'technical', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 't3', name: 'Karan Joshi',   role: 'FPGA Lead',             year: '4th Year, ECE', yearNum: 4, bio: 'Verilog and VHDL architect. Designed and verified the 5-stage pipeline for the RISC-V core. Xilinx Vivado expert.', domain: 'FPGA & Digital', section: 'technical', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 't4', name: 'Riya Singh',    role: 'Power Electronics Lead', year: '3rd Year, EEE', yearNum: 3, bio: 'Analog and switching power design. Simulates circuits in LTSpice before touching a soldering iron.', domain: 'Power Electronics', section: 'technical', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  // Events
  { id: 'e1', name: 'Aditya Kumar',  role: 'Events Head',          year: '2nd Year, CS',  yearNum: 2, bio: 'Organised Hardware Hackathon 2024 with 300+ participants across 28 colleges. Runs every event on-time.', domain: 'Events', section: 'events', linkedin: 'https://linkedin.com', email: 'aditya@iet.edu' },
  { id: 'e2', name: 'Tanvi Mehta',   role: 'Workshop Coordinator', year: '2nd Year, ECE', yearNum: 2, bio: 'Designs hands-on workshop curricula. Ensures every participant leaves with a working prototype.', domain: 'Events', section: 'events', linkedin: 'https://linkedin.com' },
  { id: 'e3', name: 'Siddharth Rao', role: 'Outreach Coordinator', year: '2nd Year, IT',  yearNum: 2, bio: 'Manages social media and inter-college partnerships. Grew the EtHOS newsletter to 500+ subscribers.', domain: 'Events', section: 'events', linkedin: 'https://linkedin.com', email: 'sidd@iet.edu' },
  // Members
  { id: 'm1', name: 'Ananya Roy',    role: 'Member', year: '3rd Year, ECE', yearNum: 3, bio: 'Working on RF front-end design for the LoRa mesh project.', domain: 'RF & Wireless',     section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm2', name: 'Nikhil Gupta', role: 'Member', year: '2nd Year, EEE', yearNum: 2, bio: 'Learning power supply design and analog circuit simulation.', domain: 'Power Electronics', section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm3', name: 'Pooja Reddy',  role: 'Member', year: '2nd Year, ECE', yearNum: 2, bio: 'Embedded firmware development on ESP32 for IoT projects.', domain: 'Embedded Systems', section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm4', name: 'Rahul Sharma', role: 'Member', year: '1st Year, CS',  yearNum: 1, bio: 'Learning FPGA development and hardware description languages.', domain: 'FPGA & Digital',   section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm5', name: 'Divya Nair',   role: 'Member', year: '1st Year, ECE', yearNum: 1, bio: 'PCB design trainee. Completed KiCad bootcamp, routing 2nd board.', domain: 'PCB Design',     section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm6', name: 'Amit Pandey',  role: 'Member', year: '1st Year, EEE', yearNum: 1, bio: 'Signal processing enthusiast working on audio DSP projects.', domain: 'Signal Processing', section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm7', name: 'Shreya Mishra',role: 'Member', year: '2nd Year, IT',  yearNum: 2, bio: 'Combines firmware and web dev to build IoT dashboards.', domain: 'Embedded Systems',    section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
  { id: 'm8', name: 'Varun Tiwari', role: 'Member', year: '1st Year, ECE', yearNum: 1, bio: 'Working on motor driver circuitry for the robotics sub-team.', domain: 'Power Electronics', section: 'member', github: 'https://github.com', linkedin: 'https://linkedin.com' },
]

// ─── Storage keys ─────────────────────────────────────────────────────────────
const SETTINGS_KEY = 'ethos_site_settings'
const TEAM_KEY     = 'ethos_team_members'

// ─── Settings helpers ─────────────────────────────────────────────────────────

export function getSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  // Dispatch event so open tabs can react
  window.dispatchEvent(new Event('ethos-settings-updated'))
}

// ─── Team helpers ─────────────────────────────────────────────────────────────

export function getTeam(): TeamMember[] {
  if (typeof window === 'undefined') return defaultTeam
  try {
    const raw = localStorage.getItem(TEAM_KEY)
    if (!raw) return defaultTeam
    return JSON.parse(raw) as TeamMember[]
  } catch {
    return defaultTeam
  }
}

export function saveTeam(members: TeamMember[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TEAM_KEY, JSON.stringify(members))
  window.dispatchEvent(new Event('ethos-team-updated'))
}

export function addTeamMember(member: Omit<TeamMember, 'id'>): TeamMember {
  const team = getTeam()
  const newMember: TeamMember = { ...member, id: `m_${Date.now()}` }
  saveTeam([...team, newMember])
  return newMember
}

export function updateTeamMember(id: string, updates: Partial<TeamMember>): void {
  const team = getTeam()
  saveTeam(team.map(m => m.id === id ? { ...m, ...updates } : m))
}

export function deleteTeamMember(id: string): void {
  const team = getTeam()
  saveTeam(team.filter(m => m.id !== id))
}

// ─── Hook: live settings (re-renders on change) ───────────────────────────────
// Usage in client components: const settings = useSettings()
export function useSettings(): SiteSettings {
  // This is used by client components — they import it and call it
  // SSR-safe: returns defaultSettings on server
  if (typeof window === 'undefined') return defaultSettings
  return getSettings()
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
// Simple credential-based auth stored in sessionStorage (cleared on tab close).
// In production: replace with NextAuth / Clerk / JWT.

const AUTH_KEY = 'ethos_admin_authed'

// Default credentials — admin should change these in Settings
export const DEFAULT_ADMIN = { username: 'ethos_admin', password: 'EtHOS@2025' }

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(AUTH_KEY) === 'true'
}

export function login(username: string, password: string): boolean {
  // Read from settings or fall back to default
  const s = getSettings() as any
  const u = s.adminUsername || DEFAULT_ADMIN.username
  const p = s.adminPassword || DEFAULT_ADMIN.password
  if (username === u && password === p) {
    sessionStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(AUTH_KEY)
}
