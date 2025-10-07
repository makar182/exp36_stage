import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'

import type { ShortLink } from '@/entities/short-link'
import { formatDate } from '@/shared/lib/format-date'

type FormState = {
  url: string
  alias: string
}

type ShortLinksDashboardProps = {
  links: ShortLink[]
  loading: boolean
  creating: boolean
  deleting: ReadonlySet<string>
  error: string | null
  copiedId: string | null
  onRefresh: () => Promise<void>
  onCreate: (payload: { url: string; alias?: string }) => Promise<ShortLink | undefined>
  onCopy: (link: ShortLink) => Promise<void>
  onDelete: (link: ShortLink) => Promise<void>
  onResetError: () => void
  onSetError: (message: string) => void
}

const defaultFormState: FormState = {
  url: '',
  alias: '',
}

export const ShortLinksDashboard = ({
  links,
  loading,
  creating,
  deleting,
  error,
  copiedId,
  onRefresh,
  onCreate,
  onCopy,
  onDelete,
  onResetError,
  onSetError,
}: ShortLinksDashboardProps) => {
  const [form, setForm] = useState<FormState>(defaultFormState)

  const hasLinks = links.length > 0

  const skeletonItems = useMemo(() => Array.from({ length: 3 }), [])

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (error) {
      onResetError()
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [error, onResetError])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.url.trim()) {
      onSetError('Введите ссылку, которую необходимо сократить')
      return
    }

    const result = await onCreate({
      url: form.url,
      alias: form.alias || undefined,
    })

    if (result) {
      setForm(defaultFormState)
    }
  }, [form, onCreate, onSetError])

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="title">URL Shortener</h1>
          <p className="subtitle">
            Управляйте короткими ссылками сервиса{' '}
            <span className="subtitle-accent">makar182/url-shortener</span> прямо из Mini App.
          </p>
        </div>
        <button className="ghost-button" onClick={() => void onRefresh()} disabled={loading}>
          {loading ? 'Обновление...' : 'Обновить'}
        </button>
      </header>

      <form className="shorten-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="url">Длинная ссылка</label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com/article"
            value={form.url}
            onChange={handleInputChange}
            required
            disabled={creating}
          />
        </div>
        <div className="form-field">
          <label htmlFor="alias">Пользовательский алиас (необязательно)</label>
          <input
            id="alias"
            name="alias"
            type="text"
            placeholder="my-custom-alias"
            value={form.alias}
            onChange={handleInputChange}
            disabled={creating}
          />
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={creating}>
            {creating ? 'Создание...' : 'Создать короткую ссылку'}
          </button>
        </div>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <section className="links-section">
        <header className="links-header">
          <h2>Ваши ссылки</h2>
          <span className="links-counter">{links.length}</span>
        </header>

        {loading && !hasLinks ? (
          <ul className="links-list skeleton">
            {skeletonItems.map((_, index) => (
              <li key={index} className="link-item">
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </li>
            ))}
          </ul>
        ) : hasLinks ? (
          <ul className="links-list">
            {links.map((link) => {
              const createdAt = formatDate(link.createdAt)
              const expiresAt = formatDate(link.expiresAt)
              const isDeleting = deleting.has(link.id)
              const isCopied = copiedId === link.id

              return (
                <li key={link.id} className="link-item">
                  <div className="link-top-row">
                    <a href={link.shortUrl} target="_blank" rel="noreferrer" className="link-short">
                      {link.shortUrl}
                    </a>
                    <div className="link-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => void onCopy(link)}
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
            })}
          </ul>
        ) : (
          <p className="empty-state">
            Пока нет созданных ссылок. Используйте форму выше, чтобы сократить первую ссылку.
          </p>
        )}
      </section>
    </section>
  )
}
