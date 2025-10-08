import type { FC } from 'react'

type ShortLinksHeaderProps = {
  refreshing: boolean
  onRefresh: () => Promise<void>
}

export const ShortLinksHeader: FC<ShortLinksHeaderProps> = ({ refreshing, onRefresh }) => (
  <header className="dashboard__header">
    <div>
      <h1 className="title">URL Shortener</h1>
      <p className="subtitle">
        Управляйте короткими ссылками сервиса{' '}
        <span className="subtitle-accent">makar182/url-shortener</span> прямо из Mini App.
      </p>
    </div>
    <button className="ghost-button" onClick={() => void onRefresh()} disabled={refreshing}>
      {refreshing ? 'Обновление...' : 'Обновить'}
    </button>
  </header>
)
