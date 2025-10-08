import type { FC } from 'react'

import type { ShortLink, ShortLinkId } from '@/entities/short-link'
import { formatShortLinkDate } from '@/entities/short-link'

type ShortLinkRowProps = {
  link: ShortLink
  copiedId: ShortLinkId | null
  deleting: ReadonlySet<ShortLinkId>
  onCopy: (link: ShortLink) => Promise<void>
  onDelete: (link: ShortLink) => Promise<void>
}

export const ShortLinkRow: FC<ShortLinkRowProps> = ({
  link,
  copiedId,
  deleting,
  onCopy,
  onDelete,
}) => {
  const createdAt = formatShortLinkDate(link.createdAt)
  const expiresAt = formatShortLinkDate(link.expiresAt)
  const isDeleting = deleting.has(link.id)
  const isCopied = copiedId === link.id

  return (
    <li className="link-item">
      <div className="link-top-row">
        <a href={link.shortUrl} target="_blank" rel="noreferrer" className="link-short">
          {link.shortUrl}
        </a>
        <div className="link-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => void onCopy(link)}
            disabled={isDeleting}
          >
            {isCopied ? 'Скопировано' : 'Копировать'}
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() => void onDelete(link)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
      <div className="link-original" title={link.originalUrl}>
        {link.originalUrl}
      </div>
      <div className="link-meta">
        {createdAt && <span>Создано: {createdAt}</span>}
        {expiresAt && <span>Истекает: {expiresAt}</span>}
        {typeof link.clicks === 'number' && <span>Переходы: {link.clicks}</span>}
        <span>Slug: {link.slug}</span>
      </div>
    </li>
  )
}
