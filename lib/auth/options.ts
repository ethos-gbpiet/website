// ─── NextAuth configuration ─────────────────────────────────────────────────
// Credentials provider (email + password) backed by the `users` table.
// JWT sessions are used so we don't need a session table on the DB.

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import type { Role } from '@/lib/permissions'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const email = String(credentials.email).trim().toLowerCase()
        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
        const u = found[0]
        if (!u || !u.active) return null
        const ok = await bcrypt.compare(String(credentials.password), u.passwordHash)
        if (!ok) return null
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role as Role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
}
