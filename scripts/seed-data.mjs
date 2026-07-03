/**
 * Run ONCE after npm run dev to pre-populate all data/  JSON files from seed data.
 * Usage:  node scripts/seed-data.mjs
 */
const BASE = 'http://localhost:3000'

try { await fetch(`${BASE}/api/settings`) }
catch { console.error('Server not running. Start with: npm run dev'); process.exit(1) }

const routes = [
  '/api/events', '/api/projects', '/api/announcements',
  '/api/resources', '/api/faqs', '/api/gallery', '/api/stats', '/api/team'
]

for (const route of routes) {
  const res  = await fetch(`${BASE}${route}`, { cache: 'no-store' })
  const data = await res.json()
  const post = await fetch(`${BASE}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await post.json()
  console.log(`${route.padEnd(25)} ${result.ok ? '✓ seeded' : '✗ ' + result.error}`)
}
console.log('\nDone. All seed data written to data/*.json on disk.')
