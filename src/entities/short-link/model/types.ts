export type ShortLink = {
  id: string
  slug: string
  originalUrl: string
  shortUrl: string
  createdAt?: string
  expiresAt?: string
  clicks?: number
}
