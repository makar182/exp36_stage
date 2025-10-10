import type { FC } from 'react' // Импортируем тип функционального компонента для определения сигнатуры.

type ShortLinksHeaderProps = {
  refreshing: boolean // Флаг, сигнализирующий, что данные сейчас обновляются.
  onRefresh: () => Promise<void> // Коллбэк для запуска обновления списка ссылок.
}

export const ShortLinksHeader: FC<ShortLinksHeaderProps> = ({ refreshing, onRefresh }) => (
  <header className="dashboard__header">{/* Шапка дашборда с заголовком и кнопкой. */}
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
