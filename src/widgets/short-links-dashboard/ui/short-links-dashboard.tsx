import type { FC } from 'react' // Импортируем тип FC, чтобы типизировать функциональный компонент.
import { useMemo } from 'react' // Подключаем хук useMemo для мемоизации количества скелетонов.

import type { ShortLink, ShortLinkId } from '@/entities/short-link' // Забираем типы ссылки и её идентификатора из сущностей.
import type { CreateShortLinkInput } from '@/features/short-links' // Импортируем контракт данных для создания короткой ссылки.

import { ShortLinkForm } from '@/features/short-links' // Берём форму создания короткой ссылки из набора фич.

import { ShortLinksHeader } from './short-links-header' // Подключаем компонент заголовка дашборда.
import { ShortLinksList } from './short-links-list' // Импортируем список коротких ссылок из текущего модуля.

const calculateSkeletonCount = (links: ShortLink[]): number => {
  if (links.length === 0) {
    return 4 // Для пустого списка показываем четыре скелетона, чтобы заполнить пространство.
  }

  return Math.min(Math.max(links.length, 3), 8) // Ограничиваем число заглушек: минимум три, максимум восемь.
}

type ShortLinksDashboardProps = {
  links: ShortLink[] // Массив коротких ссылок, которые нужно отобразить.
  loading: boolean // Флаг первоначальной загрузки данных.
  refreshing: boolean // Признак обновления уже загруженного списка.
  creating: boolean // Состояние отправки формы на создание ссылки.
  deleting: ReadonlySet<ShortLinkId> // Набор идентификаторов ссылок, которые сейчас удаляются.
  copiedId: ShortLinkId | null // Идентификатор ссылки, скопированной в буфер, либо null.
  onRefresh: () => Promise<void> // Обработчик перезагрузки данных, возвращающий Promise.
  onCreate: (payload: CreateShortLinkInput) => Promise<void> // Коллбэк создания новой короткой ссылки.
  onCopy: (link: ShortLink) => Promise<void> // Обработчик копирования короткой ссылки.
  onDelete: (link: ShortLink) => Promise<void> // Функция удаления выбранной короткой ссылки.
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
  const skeletonCount = useMemo(() => calculateSkeletonCount(links), [links]) // Мемоизируем количество скелетонов при изменении списка ссылок.

  return (
    <section className="dashboard">{/* Корневой контейнер виджета дашборда. */}
      <ShortLinksHeader refreshing={refreshing || loading} onRefresh={onRefresh} />{/* Шапка с кнопкой обновления списка. */}
      <ShortLinkForm creating={creating} onCreate={onCreate} />{/* Форма создания новой короткой ссылки. */}

      <section className="links-section">{/* Блок для списка ссылок с заголовком. */}
        <header className="links-header">{/* Шапка раздела списка ссылок. */}
          <h2>Ваши ссылки</h2>{/* Заголовок секции со списком. */}
          <span className="links-counter">{links.length}</span>{/* Счётчик количества ссылок. */}
        </header>

        <ShortLinksList
          links={links}
          loading={loading || (refreshing && links.length === 0)} // Состояние загрузки учитывает первичную загрузку и обновление без данных.
          skeletonCount={skeletonCount} // Передаём рассчитанное количество элементов-заглушек.
          deleting={deleting} // Делимся набором удаляемых ссылок для отображения состояний.
          copiedId={copiedId} // Указываем, какая ссылка недавно скопирована.
          onCopy={onCopy} // Прокидываем обработчик копирования в строку списка.
          onDelete={onDelete} // Передаём функцию удаления для каждой строки.
        />
      </section>
    </section>
  )
}
