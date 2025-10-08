import type { FC } from 'react'
import { useMemo } from 'react'

import type { ShortLink, ShortLinkId } from '@/entities/short-link'
import type { CreateShortLinkInput } from '@/features/short-links'

import { ShortLinkForm } from './short-link-form'
import { ShortLinksHeader } from './short-links-header'
import { ShortLinksList } from './short-links-list'

const calculateSkeletonCount = (links: ShortLink[]): number => {
  if (links.length === 0) {
    return 4
  }

  return Math.min(Math.max(links.length, 3), 8)
}

type ShortLinksDashboardProps = {
  links: ShortLink[]
  loading: boolean
  refreshing: boolean
  creating: boolean
  deleting: ReadonlySet<ShortLinkId>
  copiedId: ShortLinkId | null
  onRefresh: () => Promise<void>
  onCreate: (payload: CreateShortLinkInput) => Promise<void>
  onCopy: (link: ShortLink) => Promise<void>
  onDelete: (link: ShortLink) => Promise<void>
}

export const ShortLinksDashboard: FC<ShortLinksDashboardProps> = ({
  links,
  loading,
  refreshing,
  creating,
  deleting,
  copiedId,
  onRefresh,
  onCreate,
  onCopy,
  onDelete,
}) => {
  const skeletonCount = useMemo(() => calculateSkeletonCount(links), [links])

  return (
    <section className="dashboard">
      <ShortLinksHeader refreshing={refreshing || loading} onRefresh={onRefresh} />
      <ShortLinkForm creating={creating} onCreate={onCreate} />

      <section className="links-section">
        <header className="links-header">
          <h2>Ваши ссылки</h2>
          <span className="links-counter">{links.length}</span>
        </header>

        <ShortLinksList
          links={links}
          loading={loading || (refreshing && links.length === 0)}
          skeletonCount={skeletonCount}
          deleting={deleting}
          copiedId={copiedId}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      </section>
    </section>
  )
}
