import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Theme = {
  accentText?: string
  accent?: string
  background?: string
}

const normaliseColor = (value?: string) => (value && value.trim().length > 0 ? value : undefined)

const mapThemeParams = (params?: TelegramThemeParams | null): Theme | undefined => {
  if (!params) {
    return undefined
  }

  return {
    accentText: normaliseColor(params.button_text_color),
    accent: normaliseColor(params.button_color),
    background: normaliseColor(params.bg_color),
  }
}

const resolveWebAppTheme = (): Theme | undefined => mapThemeParams(window.Telegram?.WebApp?.themeParams)

export const useTelegramTheme = () => {
  const [theme, setTheme] = useState<Theme | undefined>(() => resolveWebAppTheme())

  useEffect(() => {
    const webApp = window.Telegram?.WebApp

    if (!webApp) {
      return
    }

    if (typeof webApp.ready === 'function') {
      webApp.ready()
    }

    setTheme(mapThemeParams(webApp.themeParams))

    const handleThemeChange = (params?: TelegramThemeParams) => {
      const mapped = mapThemeParams(params)

      setTheme(mapped ?? mapThemeParams(webApp.themeParams))
    }

    webApp.onEvent?.('themeChanged', handleThemeChange)

    return () => {
      webApp.offEvent?.('themeChanged', handleThemeChange)
    }
  }, [])

  const accentStyle = useMemo(() => {
    if (!theme?.accent) {
      return undefined
    }

    return {
      '--accent-color': theme.accent,
      '--accent-text-color': theme.accentText ?? '#ffffff',
      '--background-color': theme.background ?? '#f8fafc',
    } as CSSProperties
  }, [theme])

  return { theme, accentStyle }
}
