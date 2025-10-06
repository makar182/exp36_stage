import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { createShortLink, deleteShortLink, fetchShortLinks, ShortLink } from './api/urlShortener'

type FormState = {
  url: string
  alias: string
}

const defaultFormState: FormState = {
  url: '',
  alias: '',
}

const formatDate = (value?: string) => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const resolveWebAppTheme = () => {
  const theme = window.Telegram?.WebApp?.themeParams

  if (!theme) {
    return undefined
  }

  return {
    accentText: theme.button_text_color,
    accent: theme.button_color,
    background: theme.bg_color,
  }
}

function App() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [webAppTheme, setWebAppTheme] = useState(resolveWebAppTheme)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      if (typeof window.Telegram.WebApp.ready === 'function') {
        window.Telegram.WebApp.ready()
      }
      setWebAppTheme(resolveWebAppTheme())
    }
  }, [])

  const accentStyle = useMemo(() => {
    if (!webAppTheme?.accent) {
      return undefined
    }

    return {
      '--accent-color': webAppTheme.accent,
      '--accent-text-color': webAppTheme.accentText ?? '#ffffff',
      '--background-color': webAppTheme.background ?? '#f8fafc',
    } as CSSProperties
  }, [webAppTheme])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchShortLinks()
      setLinks(data)
    } catch (fetchError) {
      console.error(fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Не удалось загрузить ссылки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!copiedId) {
      return
    }

    const timeout = setTimeout(() => setCopiedId(null), 2500)

    return () => clearTimeout(timeout)
  }, [copiedId])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.url.trim()) {
      setError('Введите ссылку, которую необходимо сократить')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newLink = await createShortLink({
        url: form.url.trim(),
        alias: form.alias.trim() || undefined,
      })

      setLinks((prev) => [newLink, ...prev.filter((item) => item.id !== newLink.id)])
      setForm(defaultFormState)
      setCopiedId(newLink.id)
      try {
        await navigator.clipboard?.writeText(newLink.shortUrl)
      } catch (clipboardError) {
        console.warn('Failed to copy newly created link', clipboardError)
      }
    } catch (createError) {
      console.error(createError)
      setError(createError instanceof Error ? createError.message : 'Не удалось создать короткую ссылку')
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async (link: ShortLink) => {
    try {
      await navigator.clipboard?.writeText(link.shortUrl)
      setCopiedId(link.id)
    } catch (copyError) {
      console.error(copyError)
      setError('Не удалось скопировать ссылку в буфер обмена')
    }
  }

  const handleDelete = async (link: ShortLink) => {
    setDeleting((prev) => {
      const next = new Set(prev)
      next.add(link.id)
      return next
    })
    setError(null)

    try {
      await deleteShortLink(link.id)
      setLinks((prev) => prev.filter((item) => item.id !== link.id))
    } catch (deleteError) {
      console.error(deleteError)
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить ссылку')
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev)
        next.delete(link.id)
        return next
      })
    }
  }

  return (
    <main className="app" style={accentStyle}>
      <section className="dashboard">
        <header className="dashboard__header">
          <div>
            <h1 className="title">URL Shortener</h1>
            <p className="subtitle">
              Управляйте короткими ссылками сервиса{' '}
              <span className="subtitle-accent">makar182/url-shortener</span> прямо из Mini App.
            </p>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} disabled={loading}>
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

          {loading && links.length === 0 ? (
            <ul className="links-list skeleton">
              {Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="link-item">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </li>
              ))}
            </ul>
          ) : links.length > 0 ? (
            <ul className="links-list">
              {links.map((link) => {
                const createdAt = formatDate(link.createdAt)
                const expiresAt = formatDate(link.expiresAt)
                const isDeleting = deleting.has(link.id)
                const isCopied = copiedId === link.id

                return (
                  <li key={link.id} className="link-item">
                    <div className="link-top-row">
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link-short"
                      >
                        {link.shortUrl}
                      </a>
                      <div className="link-actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => void handleCopy(link)}
                        >
                          {isCopied ? 'Скопировано' : 'Копировать'}
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => void handleDelete(link)}
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
                      {typeof link.clicks === 'number' && (
                        <span>Переходы: {link.clicks}</span>
                      )}
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
    </main>
  )
}

export default App
