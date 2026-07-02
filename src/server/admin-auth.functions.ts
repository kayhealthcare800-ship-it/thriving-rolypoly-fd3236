import bcrypt from 'bcryptjs'
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { eq, gt, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { admins, adminSessions } from '../../db/schema.js'

const SESSION_COOKIE = 'fg_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

export const getAdminFromSession = createServerOnlyFn(async () => {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return null

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(and(eq(adminSessions.token, token), gt(adminSessions.expiresAt, new Date())))
    .limit(1)

  if (!session) return null

  const [admin] = await db.select().from(admins).where(eq(admins.id, session.adminId)).limit(1)
  return admin ?? null
})

export const getCurrentAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const admin = await getAdminFromSession()
  if (!admin) return null
  return { id: admin.id, email: admin.email }
})

export const adminLogin = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const [admin] = await db.select().from(admins).where(eq(admins.email, data.email.toLowerCase())).limit(1)
    if (!admin) {
      throw new Error('Invalid email or password')
    }

    const valid = await bcrypt.compare(data.password, admin.passwordHash)
    if (!valid) {
      throw new Error('Invalid email or password')
    }

    const token = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('')
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
    await db.insert(adminSessions).values({ token, adminId: admin.id, expiresAt })

    setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })

    return { ok: true }
  })

export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => {
  const token = getCookie(SESSION_COOKIE)
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token))
  }
  deleteCookie(SESSION_COOKIE, { path: '/' })
  return { ok: true }
})

/** Only allowed when the admins table is empty — one-time bootstrap. */
export const setupFirstAdmin = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const existing = await db.select().from(admins).limit(1)
    if (existing.length > 0) {
      throw new Error('An admin already exists. Setup is disabled.')
    }
    if (!data.email || !data.password || data.password.length < 8) {
      throw new Error('Email and a password of at least 8 characters are required.')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    await db.insert(admins).values({ email: data.email.toLowerCase(), passwordHash })
    return { ok: true }
  })

export const checkAdminSetupAvailable = createServerFn({ method: 'GET' }).handler(async () => {
  const existing = await db.select().from(admins).limit(1)
  return { available: existing.length === 0 }
})

export function newSessionId() {
  return globalThis.crypto.randomUUID()
}
