import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  createShortLink,
  deleteShortLink,
  fetchShortLinks,
  ShortenerApiError,
} from '@/shared/api/url-shortener'
import { copyToClipboard } from '@/shared/lib/clipboard'
import type { ShortLink, ShortLinkId } from '@/entities/short-link'
import { useNotifications } from '@/shared/notifications'

import type { CreateShortLinkInput } from './create-short-link-schema'

type UseShortLinksResult = {
  links: ShortLink[]
  loading: boolean
  refreshing: boolean
  creating: boolean
  deleting: ReadonlySet<ShortLinkId>
  copiedId: ShortLinkId | null
  refresh: () => Promise<void>
  createLink: (payload: CreateShortLinkInput) => Promise<void>
  copyLink: (link: ShortLink) => Promise<void>
  deleteLink: (link: ShortLink) => Promise<void>
}

const SHORT_LINKS_QUERY_KEY = ['short-links']

const mapErrorToMessage = (error: unknown, fallback: string) => {
  if (error instanceof ShortenerApiError) {
    return error.message || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export const useShortLinks = (): UseShortLinksResult => {
  const queryClient = useQueryClient()
  const { notify } = useNotifications()
  const [copiedId, setCopiedId] = useState<ShortLinkId | null>(null)
  const [deletingIds, setDeletingIds] = useState<ReadonlySet<ShortLinkId>>(() => new Set())

  const { data, isLoading, isFetching, refetch, error } = useQuery<
    ShortLink[],
    ShortenerApiError
  >({
    queryKey: SHORT_LINKS_QUERY_KEY,
    queryFn: fetchShortLinks,
    staleTime: 60_000,
    retry: 1,
  })

  useEffect(() => {
    if (!error) {
      return
    }

    notify({
      kind: 'error',
      title: 'Не удалось загрузить ссылки',
      message: mapErrorToMessage(error, 'Попробуйте обновить страницу позднее.'),
    })
  }, [error, notify])

  const links: ShortLink[] = data ?? []

  useEffect(() => {
    if (!copiedId || typeof window === 'undefined') {
      return
    }

    const timeout = window.setTimeout(() => setCopiedId(null), 2500)

    return () => window.clearTimeout(timeout)
  }, [copiedId])

  const creatingMutation = useMutation({
    mutationFn: (payload: CreateShortLinkInput) => createShortLink(payload),
    onSuccess: async (newLink) => {
      queryClient.setQueryData<ShortLink[]>(SHORT_LINKS_QUERY_KEY, (current = []) => {
        const filtered = current.filter((item) => item.id !== newLink.id)
        return [newLink, ...filtered]
      })

      setCopiedId(newLink.id)

      try {
        await copyToClipboard(newLink.shortUrl)
        notify({
          kind: 'success',
          title: 'Ссылка создана',
          message: 'Короткая ссылка скопирована в буфер обмена.',
        })
      } catch (clipboardError) {
        notify({
          kind: 'info',
          title: 'Ссылка создана',
          message: mapErrorToMessage(
            clipboardError,
            'Скопируйте ссылку вручную — буфер обмена недоступен.',
          ),
        })
      }
    },
    onError: (error) => {
      notify({
        kind: 'error',
        title: 'Не удалось создать ссылку',
        message: mapErrorToMessage(error, 'Проверьте введённые данные и попробуйте снова.'),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (link: ShortLink) => deleteShortLink(link.id),
    onMutate: async (link) => {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.add(link.id)
        return next
      })

      await queryClient.cancelQueries({ queryKey: SHORT_LINKS_QUERY_KEY })

      const previousLinks = queryClient.getQueryData<ShortLink[]>(SHORT_LINKS_QUERY_KEY)
      queryClient.setQueryData<ShortLink[]>(SHORT_LINKS_QUERY_KEY, (current = []) =>
        current.filter((item) => item.id !== link.id),
      )

      return { previousLinks }
    },
    onError: (error, _link, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(SHORT_LINKS_QUERY_KEY, context.previousLinks)
      }

      notify({
        kind: 'error',
        title: 'Не удалось удалить ссылку',
        message: mapErrorToMessage(error, 'Попробуйте удалить ссылку чуть позже.'),
      })
    },
    onSuccess: () => {
      notify({
        kind: 'success',
        title: 'Ссылка удалена',
        message: 'Запись успешно удалена из списка.',
      })
    },
    onSettled: (_, __, link) => {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(link.id)
        return next
      })
    },
  })

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const createLink = useCallback(
    async (payload: CreateShortLinkInput) => {
      await creatingMutation.mutateAsync(payload)
    },
    [creatingMutation],
  )

  const copyLink = useCallback(
    async (link: ShortLink) => {
      try {
        await copyToClipboard(link.shortUrl)
        setCopiedId(link.id)
        notify({
          kind: 'success',
          title: 'Ссылка скопирована',
          message: 'Короткая ссылка сохранена в буфер обмена.',
        })
      } catch (error) {
        notify({
          kind: 'error',
          title: 'Не удалось скопировать ссылку',
          message: mapErrorToMessage(error, 'Скопируйте ссылку вручную.'),
        })
      }
    },
    [notify],
  )

  const deleteLink = useCallback(
    async (link: ShortLink) => {
      await deleteMutation.mutateAsync(link)
    },
    [deleteMutation],
  )

  const deleting = useMemo(() => deletingIds, [deletingIds])

  return {
    links,
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    creating: creatingMutation.isPending,
    deleting,
    copiedId,
    refresh,
    createLink,
    copyLink,
    deleteLink,
  }
}
