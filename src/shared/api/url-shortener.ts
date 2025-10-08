import {
  createShortLinkId,
  createShortLinkSlug,
  type ShortLink,
  type ShortLinkId,
} from '@/entities/short-link'

const fallbackBase = typeof window === 'undefined' ? 'http://localhost' : window.location.origin

const normalizeBaseUrl = (value?: string): string | null => {
  if (!value?.trim()) {
    return null
  }

  try {
    const url = new URL(value, fallbackBase)
    url.hash = ''
    url.search = ''
    return url.toString().replace(/\/$/, '')
  } catch (error) {
    console.warn('Invalid base URL provided for the shortener API', value, error)
    return null
  }
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
const SHORT_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_SHORT_BASE_URL)

const buildUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path.startsWith('/') ? path : `/${path}`
  }

  return new URL(path, API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`).toString()
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
      ? new URL(alias.alias, SHORT_BASE_URL.endsWith('/') ? SHORT_BASE_URL : `${SHORT_BASE_URL}/`).toString()
      : alias.alias

  return {
    id: createShortLinkId(alias.id),
    slug: createShortLinkSlug(alias.alias),
    originalUrl: alias.url,
    shortUrl,
    createdAt: ensureIsoDate(alias.createdAt),
    expiresAt: ensureIsoDate(alias.expiresAt),
    clicks: alias.clicks,
  }
}

type ApiErrorPayload = {
  message?: string
  error?: string
  errors?: unknown
}

export class ShortenerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: ApiErrorPayload,
  ) {
    super(message)
    this.name = 'ShortenerApiError'
  }
}

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let payload: ApiErrorPayload | undefined
    let message = `Request failed with status ${response.status}`

    try {
      const text = await response.text()
      if (text) {
        payload = JSON.parse(text) as ApiErrorPayload
        message = payload.message || payload.error || message
      }
    } catch (error) {
      console.warn('Failed to parse API error payload', error)
    }

    throw new ShortenerApiError(message, response.status, payload)
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

export const updateShortLink = async (id: ShortLinkId, payload: UpdatePayload): Promise<ShortLink> => {
  const response = await fetch(buildUrl(`/alias/${encodeURIComponent(id)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await readJson<AliasResponse>(response)
  return mapShortLink(data)
}

export const deleteShortLink = async (id: ShortLinkId): Promise<void> => {
  const response = await fetch(buildUrl(`/alias/${encodeURIComponent(id)}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined
    let message = `Request failed with status ${response.status}`

    try {
      const text = await response.text()
      if (text) {
        payload = JSON.parse(text) as ApiErrorPayload
        message = payload.message || payload.error || message
      }
    } catch (error) {
      console.warn('Failed to parse API error payload', error)
    }

    throw new ShortenerApiError(message, response.status, payload)
  }
}
