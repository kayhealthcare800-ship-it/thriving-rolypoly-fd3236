import { getStore } from '@netlify/blobs'

/**
 * Selfies are binary image blobs, not relational data, so they live in
 * Netlify Blobs (store name below) keyed by ticket ref. Only the blob key
 * is stored on the registration row in Postgres.
 */
export function getSelfieStore() {
  return getStore('faithfulgod-selfies')
}
