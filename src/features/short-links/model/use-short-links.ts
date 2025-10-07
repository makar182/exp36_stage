import { useCallback, useEffect, useRef, useState } from 'react'

import { createShortLink, deleteShortLink, fetchShortLinks } from '@/shared/api/url-shortener'
import type { ShortLink } from '@/entities/short-link'

type CreatePayload = {
  url: string
  alias?: string
}

type UseShortLinksResult = {
  links: ShortLink[]
  loading: boolean
  creating: boolean
  deleting: ReadonlySet<string>
  error: string | null
  copiedId: string | null
  refresh: () => Promise<void>
  createLink: (payload: CreatePayload) => Promise<ShortLink | undefined>
  copyLink: (link: ShortLink) => Promise<void>
  deleteLink: (link: ShortLink) => Promise<void>
  resetError: () => void
  setErrorMessage: (message: string) => void
}

export const useShortLinks = (): UseShortLinksResult => {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingIds, setDeletingIds] = useState<ReadonlySet<string>>(() => new Set())
  const refreshRequestIdRef = useRef(0)

  const refresh = useCallback(async () => {
    const requestId = refreshRequestIdRef.current + 1
    refreshRequestIdRef.current = requestId

    setLoading(true)
    setError(null)

    try {
      const data = await fetchShortLinks()

      if (refreshRequestIdRef.current === requestId) {
        setLinks(data)
      }
    } catch (refreshError) {
      console.error(refreshError)

      if (refreshRequestIdRef.current === requestId) {
        setError(
          refreshError instanceof Error ? refreshError.message : 'Не удалось загрузить ссылки'
        )
      }
    } finally {
      if (refreshRequestIdRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!copiedId) {
      return
    }

    const timeout = setTimeout(() => setCopiedId(null), 2500)

    return () => clearTimeout(timeout)
  }, [copiedId])

  const createLink = useCallback(async (payload: CreatePayload) => {
    const trimmedUrl = payload.url.trim()
    const trimmedAlias = payload.alias?.trim()

    if (!trimmedUrl) {
      setError('Введите ссылку, которую необходимо сократить')
      return undefined
    }

    setCreating(true)
    setError(null)

    try {
      const newLink = await createShortLink({
        url: trimmedUrl,
        alias: trimmedAlias || undefined,
      })

      setLinks((prev) => [newLink, ...prev.filter((item) => item.id !== newLink.id)])
      setCopiedId(newLink.id)

      try {
        await navigator.clipboard?.writeText(newLink.shortUrl)
      } catch (clipboardError) {
        console.warn('Failed to copy newly created link', clipboardError)
      }

      return newLink
    } catch (createError) {
      console.error(createError)
      setError(createError instanceof Error ? createError.message : 'Не удалось создать короткую ссылку')
    } finally {
      setCreating(false)
    }
  }, [])

  const copyLink = useCallback(async (link: ShortLink) => {
    try {
      await navigator.clipboard?.writeText(link.shortUrl)
      setCopiedId(link.id)
    } catch (copyError) {
      console.error(copyError)
      setError('Не удалось скопировать ссылку в буфер обмена')
    }
  }, [])

  const deleteLink = useCallback(async (link: ShortLink) => {
    setDeletingIds((prev) => {
      const next = new Set(prev)
      next.add(link.id)
      return next
    })
    setError(null)

    try {
      await deleteShortLink(link.id)
      setLinks((prev) => prev.filter((item) => item.id !== link.id))
    } catch (deleteError) {
      console.error(deleteError)
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить ссылку')
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(link.id)
        return next
      })
    }
  }, [])

  const resetError = useCallback(() => setError(null), [])
  const setErrorMessage = useCallback((message: string) => setError(message), [])

  return {
    links,
    loading,
    creating,
    deleting: deletingIds,
    error,
    copiedId,
    refresh,
    createLink,
    copyLink,
    deleteLink,
    resetError,
    setErrorMessage,
  }
}
