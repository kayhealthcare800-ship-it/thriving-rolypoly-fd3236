import { createFileRoute, redirect } from '@tanstack/react-router'
import { adminLogout } from '@/server/admin-auth.functions'

export const Route = createFileRoute('/admin/logout')({
  loader: async () => {
    await adminLogout()
    throw redirect({ to: '/admin/login' })
  },
})
