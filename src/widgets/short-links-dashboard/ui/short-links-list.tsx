import type { FC } from 'react' // Импортируем тип для определения функционального компонента.

import type { ShortLink, ShortLinkId } from '@/entities/short-link' // Забираем типы короткой ссылки и её идентификатора.

import { ShortLinkRow } from './short-link-row' // Подключаем компонент строки списка ссылок.
import { ShortLinksSkeleton } from './short-links-skeleton' // Импортируем скелетон для отображения загрузки.

type ShortLinksListProps = {
  links: ShortLink[] // Коллекция коротких ссылок для рендера.
  loading: boolean // Флаг загрузочного состояния списка.
  skeletonCount: number // Количество элементов-заглушек, которые нужно показать.
  deleting: ReadonlySet<ShortLinkId> // Множество идентификаторов ссылок, удаляемых прямо сейчас.
  copiedId: ShortLinkId | null // Идентификатор недавно скопированной ссылки.
  onCopy: (link: ShortLink) => Promise<void> // Коллбэк копирования ссылки в буфер обмена.
  onDelete: (link: ShortLink) => Promise<void> // Обработчик удаления конкретной короткой ссылки.
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
    return <ShortLinksSkeleton count={skeletonCount} /> // Если идёт загрузка без данных, показываем скелетон.
  }

  if (links.length === 0) {
    return (
      <p className="empty-state">
        Пока нет созданных ссылок. Используйте форму выше, чтобы сократить первую ссылку.
      </p>
    ) // При отсутствии ссылок выводим подсказку о следующем шаге.
  }

  return (
    <ul className="links-list">{/* Контейнер списка коротких ссылок. */}
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
