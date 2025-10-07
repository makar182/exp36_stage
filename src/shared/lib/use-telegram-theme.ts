import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Theme = {
  accentText?: string
  accent?: string
  background?: string
}

const resolveWebAppTheme = (): Theme | undefined => {
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

export const useTelegramTheme = () => {
  const [theme, setTheme] = useState<Theme | undefined>(() => resolveWebAppTheme())

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      if (typeof window.Telegram.WebApp.ready === 'function') {
        window.Telegram.WebApp.ready()
      }
      setTheme(resolveWebAppTheme())
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
