import type { ShortLink } from '@/entities/short-link'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const SHORT_BASE_URL = (import.meta.env.VITE_SHORT_BASE_URL ?? '').replace(/\/$/, '')

const buildUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path
  }

  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`
  }

  return `${API_BASE_URL}${path}`
}

type AliasResponse = {
  id: string
  alias: string
  url: string
  shortUrl?: string
  createdAt?: string
  expiresAt?: string
  clicks?: number
}

type AliasListResponse = {
  items: AliasResponse[]
}

const ensureIsoDate = (value?: string) => {
  if (!value) {
    return undefined
  }

  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    return undefined
  }

  return new Date(timestamp).toISOString()
}

const mapShortLink = (alias: AliasResponse): ShortLink => {
  const shortUrl = alias.shortUrl
    ? alias.shortUrl
    : SHORT_BASE_URL
      ? `${SHORT_BASE_URL}/${alias.alias}`
      : alias.alias

  return {
    id: alias.id,
    slug: alias.alias,
    originalUrl: alias.url,
    shortUrl,
    createdAt: ensureIsoDate(alias.createdAt),
    expiresAt: ensureIsoDate(alias.expiresAt),
    clicks: alias.clicks,
  }
}

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text().catch(() => null)
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export const fetchShortLinks = async (): Promise<ShortLink[]> => {
  const response = await fetch(buildUrl('/alias'))
  const payload = await readJson<AliasResponse[] | AliasListResponse>(response)

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : []

  return list.map(mapShortLink)
}

type CreatePayload = {
  url: string
  alias?: string
}

export const createShortLink = async (payload: CreatePayload): Promise<ShortLink> => {
  const response = await fetch(buildUrl('/alias'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await readJson<AliasResponse>(response)
  return mapShortLink(data)
}

type UpdatePayload = {
  url: string
  alias?: string
}

export const updateShortLink = async (id: string, payload: UpdatePayload): Promise<ShortLink> => {
  const response = await fetch(buildUrl(`/alias/${encodeURIComponent(id)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await readJson<AliasResponse>(response)
  return mapShortLink(data)
}

export const deleteShortLink = async (id: string): Promise<void> => {
  const response = await fetch(buildUrl(`/alias/${encodeURIComponent(id)}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    const message = await response.text().catch(() => null)
    throw new Error(message || `Request failed with status ${response.status}`)
  }
}
