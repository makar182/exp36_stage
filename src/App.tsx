import { useEffect, useMemo, useState } from 'react'
import './App.css'

type AttributeItem = {
  key: string
  value: string
}

const formatValue = (value: unknown): string => {
  if (typeof value === 'function') {
    return '[function]'
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'object' && value !== null) {
    const seen = new WeakSet<object>()

    try {
      const json = JSON.stringify(
        value,
        (_key, nestedValue) => {
          if (typeof nestedValue === 'function') {
            return '[function]'
          }

          if (typeof nestedValue === 'bigint') {
            return nestedValue.toString()
          }

          if (typeof nestedValue === 'object' && nestedValue !== null) {
            if (seen.has(nestedValue as object)) {
              return '[Circular]'
            }
            seen.add(nestedValue as object)
          }

          return nestedValue
        },
        2
      )

      return json
    } catch (error) {
      console.error('Failed to serialize value from Telegram.WebApp', error)
      return '[unserializable object]'
    }
  }

  if (value === undefined) {
    return 'undefined'
  }

  return String(value)
}

function App() {
  const [webApp, setWebApp] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const telegramWebApp = window.Telegram?.WebApp ?? null
    setWebApp(telegramWebApp ? { ...telegramWebApp } : null)
  }, [])

  const attributes = useMemo<AttributeItem[]>(() => {
    if (!webApp) {
      return []
    }

    return Object.entries(webApp)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => ({
        key,
        value: formatValue(value),
      }))
  }, [webApp])

  return (
    <main className="app">
      <section className="card">
        <h1 className="title">Информация о Telegram Mini App</h1>
        <p className="subtitle">
          Ниже перечислены доступные атрибуты объекта <code>window.Telegram.WebApp</code>.
        </p>

        {webApp ? (
          <dl className="attributes-list">
            {attributes.map(({ key, value }) => (
              <div key={key} className="attribute">
                <dt className="attribute-key">{key}</dt>
                <dd className="attribute-value">
                  <pre>{value}</pre>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="empty-state">
            Объект <code>window.Telegram.WebApp</code> не обнаружен. Откройте приложение из Telegram, чтобы увидеть
            данные Mini App.
          </p>
        )}
      </section>
    </main>
  )
}

export default App
