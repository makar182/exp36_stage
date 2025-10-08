import type { FC } from 'react'

type ShortLinksSkeletonProps = {
  count: number
}

export const ShortLinksSkeleton: FC<ShortLinksSkeletonProps> = ({ count }) => {
  return (
    <ul className="links-list skeleton">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="link-item">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </li>
      ))}
    </ul>
  )
}
