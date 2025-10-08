import type { FC } from 'react'

import type { ShortLink, ShortLinkId } from '@/entities/short-link'

import { ShortLinkRow } from './short-link-row'
import { ShortLinksSkeleton } from './short-links-skeleton'

type ShortLinksListProps = {
  links: ShortLink[]
  loading: boolean
  skeletonCount: number
  deleting: ReadonlySet<ShortLinkId>
  copiedId: ShortLinkId | null
  onCopy: (link: ShortLink) => Promise<void>
  onDelete: (link: ShortLink) => Promise<void>
}

export const ShortLinksList: FC<ShortLinksListProps> = ({
  links,
  loading,
  skeletonCount,
  deleting,
  copiedId,
  onCopy,
  onDelete,
}) => {
  if (loading && links.length === 0) {
    return <ShortLinksSkeleton count={skeletonCount} />
  }

  if (links.length === 0) {
    return (
      <p className="empty-state">
        Пока нет созданных ссылок. Используйте форму выше, чтобы сократить первую ссылку.
      </p>
    )
  }

  return (
    <ul className="links-list">
      {links.map((link) => (
        <ShortLinkRow
          key={link.id}
          link={link}
          deleting={deleting}
          copiedId={copiedId}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
