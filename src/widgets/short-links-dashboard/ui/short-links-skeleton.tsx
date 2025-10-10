import type { FC } from 'react' // Импортируем тип функционального компонента для типизации.

type ShortLinksSkeletonProps = {
  count: number // Количество строк-заглушек, которые нужно показать.
}

export const ShortLinksSkeleton: FC<ShortLinksSkeletonProps> = ({ count }) => {
  return (
    <ul className="links-list skeleton">{/* Контейнер скелетона списка. */}
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="link-item">{/* Элемент списка-заглушка. */}
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </li>
      ))}
    </ul>
  )
}
