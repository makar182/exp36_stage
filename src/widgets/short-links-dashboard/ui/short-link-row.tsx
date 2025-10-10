import type { FC } from 'react' // Импортируем тип функционального компонента для типизации.

import type { ShortLink, ShortLinkId } from '@/entities/short-link' // Подключаем типы сущности короткой ссылки.
import { formatShortLinkDate } from '@/entities/short-link' // Берём утилиту форматирования дат ссылки.

type ShortLinkRowProps = {
  link: ShortLink // Экземпляр короткой ссылки для отображения.
  copiedId: ShortLinkId | null // Идентификатор скопированной ссылки либо null.
  deleting: ReadonlySet<ShortLinkId> // Набор идентификаторов ссылок, находящихся в удалении.
  onCopy: (link: ShortLink) => Promise<void> // Коллбэк для копирования ссылки.
  onDelete: (link: ShortLink) => Promise<void> // Обработчик удаления текущей строки.
}

export const ShortLinkRow: FC<ShortLinkRowProps> = ({
  link,
  copiedId,
  deleting,
  onCopy,
  onDelete,
}) => {
  const createdAt = formatShortLinkDate(link.createdAt) // Форматируем дату создания ссылки.
  const expiresAt = formatShortLinkDate(link.expiresAt) // Подготавливаем дату истечения срока действия.
  const isDeleting = deleting.has(link.id) // Проверяем, удаляется ли сейчас эта ссылка.
  const isCopied = copiedId === link.id // Определяем, совпадает ли ссылка с последней скопированной.

  return (
    <li className="link-item">{/* Обёртка одной строки списка коротких ссылок. */}
      <div className="link-top-row">{/* Верхняя строка с коротким URL и действиями. */}
        <a href={link.shortUrl} target="_blank" rel="noreferrer" className="link-short">
          {link.shortUrl}
        </a>
        <div className="link-actions">{/* Контейнер кнопок действий. */}
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
      <div className="link-meta">{/* Дополнительные характеристики короткой ссылки. */}
        {createdAt && <span>Создано: {createdAt}</span>}
        {expiresAt && <span>Истекает: {expiresAt}</span>}
        {typeof link.clicks === 'number' && <span>Переходы: {link.clicks}</span>}
        <span>Slug: {link.slug}</span>
      </div>
    </li>
  )
}
