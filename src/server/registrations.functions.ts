import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { eq, or, desc, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { registrations, eventSettings } from '../../db/schema.js'
import { getSelfieStore } from './blobs.js'
import { getAdminFromSession } from './admin-auth.functions.js'

const DEVICE_COOKIE = 'fg_device_id'

function ensureDeviceId(): string {
  let deviceId = getCookie(DEVICE_COOKIE)
  if (!deviceId) {
    deviceId = globalThis.crypto.randomUUID()
    setCookie(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return deviceId
}

export async function getMainHallCapacity() {
  const [row] = await db.select().from(eventSettings).limit(1)
  if (row) return row.mainHallCapacity
  const [created] = await db.insert(eventSettings).values({ mainHallCapacity: 2000 }).returning()
  return created.mainHallCapacity
}

/** Checks the device-lock cookie / matching email for an existing registration. */
export const getExistingRegistrationForDevice = createServerFn({ method: 'GET' })
  .inputValidator((data: { email?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const deviceId = ensureDeviceId()
    const email = data?.email?.trim().toLowerCase()

    const conditions = email
      ? or(eq(registrations.deviceId, deviceId), eq(registrations.email, email))
      : eq(registrations.deviceId, deviceId)

    const [existing] = await db
      .select()
      .from(registrations)
      .where(conditions)
      .orderBy(desc(registrations.createdAt))
      .limit(1)

    return existing ? { ticketRef: existing.ticketRef } : null
  })

const registerInputSchema = (data: {
  fullName: string
  email: string
  phone: string
  institution: string
  selfieDataUrl: string
}) => data

export const submitRegistration = createServerFn({ method: 'POST' })
  .inputValidator(registerInputSchema)
  .handler(async ({ data }) => {
    const fullName = data.fullName.trim()
    const email = data.email.trim().toLowerCase()
    const phone = data.phone.trim()
    const institution = data.institution.trim()

    if (!fullName || !email || !phone || !institution) {
      throw new Error('All fields are required.')
    }
    if (!data.selfieDataUrl || !data.selfieDataUrl.startsWith('data:image/')) {
      throw new Error('A live face scan photo is required.')
    }

    const deviceId = ensureDeviceId()

    // Device / email lock — never create a duplicate registration.
    const [existing] = await db
      .select()
      .from(registrations)
      .where(or(eq(registrations.deviceId, deviceId), eq(registrations.email, email)))
      .limit(1)

    if (existing) {
      return { ticketRef: existing.ticketRef, alreadyRegistered: true }
    }

    const capacity = await getMainHallCapacity()
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations)

    const seating = count < capacity ? 'hall_pass' : 'overflow'
    const ticketRef = `FG-${String(count + 1).padStart(4, '0')}`

    // Store the selfie as a blob keyed by ticket ref — binary data does not
    // belong in Postgres rows.
    const base64 = data.selfieDataUrl.split(',')[1] ?? ''
    const bytes = Buffer.from(base64, 'base64')
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    const store = getSelfieStore()
    await store.set(ticketRef, arrayBuffer, { metadata: { contentType: 'image/jpeg' } })

    await db.insert(registrations).values({
      ticketRef,
      fullName,
      email,
      phone,
      institution,
      seating,
      selfieKey: ticketRef,
      deviceId,
    })

    return { ticketRef, alreadyRegistered: false }
  })

export const getRegistrationByRef = createServerFn({ method: 'GET' })
  .inputValidator((data: { ref: string }) => data)
  .handler(async ({ data }) => {
    const [reg] = await db.select().from(registrations).where(eq(registrations.ticketRef, data.ref)).limit(1)
    if (!reg) return null
    return {
      ticketRef: reg.ticketRef,
      fullName: reg.fullName,
      seating: reg.seating,
      createdAt: reg.createdAt,
      checkedIn: reg.checkedIn,
    }
  })

export const retrieveByEmail = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase()
    const [reg] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.email, email))
      .orderBy(desc(registrations.createdAt))
      .limit(1)
    return reg ? { ticketRef: reg.ticketRef } : null
  })

// ---- Admin-only functions below ----

async function requireAdmin() {
  const admin = await getAdminFromSession()
  if (!admin) throw new Error('Unauthorized')
  return admin
}

export const getAdminDashboardData = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()

  const all = await db.select().from(registrations).orderBy(desc(registrations.createdAt))
  const capacity = await getMainHallCapacity()

  const total = all.length
  const hallPassCount = all.filter((r) => r.seating === 'hall_pass').length
  const overflowCount = all.filter((r) => r.seating === 'overflow').length
  const checkedInCount = all.filter((r) => r.checkedIn).length

  return {
    capacity,
    stats: {
      total,
      hallPassCount,
      overflowCount,
      checkedInCount,
      hallFillPct: capacity > 0 ? Math.round((hallPassCount / capacity) * 100) : 0,
      checkinRatePct: total > 0 ? Math.round((checkedInCount / total) * 100) : 0,
    },
    registrations: all.map((r) => ({
      id: r.id,
      ticketRef: r.ticketRef,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
      institution: r.institution,
      seating: r.seating,
      selfieKey: r.selfieKey,
      checkedIn: r.checkedIn,
      checkedInAt: r.checkedInAt,
      createdAt: r.createdAt,
    })),
  }
})

export const toggleCheckedIn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; checkedIn: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db
      .update(registrations)
      .set({ checkedIn: data.checkedIn, checkedInAt: data.checkedIn ? new Date() : null })
      .where(eq(registrations.id, data.id))
    return { ok: true }
  })

export const deleteRegistrations = createServerFn({ method: 'POST' })
  .inputValidator((data: { ids: number[] }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    if (data.ids.length === 0) return { ok: true }

    const rows = await db
      .select({ id: registrations.id, selfieKey: registrations.selfieKey })
      .from(registrations)
      .where(sql`${registrations.id} = ANY(${data.ids})`)

    const store = getSelfieStore()
    await Promise.all(rows.map((r) => store.delete(r.selfieKey)))
    await db.delete(registrations).where(sql`${registrations.id} = ANY(${data.ids})`)

    return { ok: true }
  })

export const updateMainHallCapacity = createServerFn({ method: 'POST' })
  .inputValidator((data: { capacity: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    if (!Number.isFinite(data.capacity) || data.capacity < 0) {
      throw new Error('Capacity must be a non-negative number.')
    }

    const [row] = await db.select().from(eventSettings).limit(1)
    if (row) {
      await db.update(eventSettings).set({ mainHallCapacity: data.capacity }).where(eq(eventSettings.id, row.id))
    } else {
      await db.insert(eventSettings).values({ mainHallCapacity: data.capacity })
    }
    return { ok: true }
  })
