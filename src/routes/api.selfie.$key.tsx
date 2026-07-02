import { createFileRoute } from '@tanstack/react-router'
import { getSelfieStore } from '@/server/blobs'

export const Route = createFileRoute('/api/selfie/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const store = getSelfieStore()
        const blob = await store.get(params.key, { type: 'arrayBuffer' })
        if (!blob) {
          return new Response('Not found', { status: 404 })
        }
        return new Response(blob, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'private, max-age=3600',
          },
        })
      },
    },
  },
})
