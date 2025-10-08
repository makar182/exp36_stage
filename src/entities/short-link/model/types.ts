type Brand<T, Name extends string> = T & { readonly __brand: Name }

export type ShortLinkId = Brand<string, 'ShortLinkId'>
export type ShortLinkSlug = Brand<string, 'ShortLinkSlug'>

export const createShortLinkId = (value: string): ShortLinkId => value as ShortLinkId
export const createShortLinkSlug = (value: string): ShortLinkSlug => value as ShortLinkSlug

export type ShortLink = {
  id: ShortLinkId
  slug: ShortLinkSlug
  originalUrl: string
  shortUrl: string
  createdAt?: string
  expiresAt?: string
  clicks?: number
}
