import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const DEVICE_COOKIE = 'fg_device_id'

/**
 * Ensures a stable per-device identifier cookie exists, returning it.
 * Used to prevent a single device from creating multiple registrations.
 */
export const getOrCreateDeviceId = createServerFn({ method: 'GET' }).handler(async () => {
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
  return { deviceId }
})
