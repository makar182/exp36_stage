/// <reference types="vite/client" />

declare global {
  interface TelegramThemeParams {
    bg_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    hint_color?: string
    text_color?: string
    [key: string]: string | undefined
  }

  interface TelegramWebApp {
    themeParams?: TelegramThemeParams
    ready?: () => void
    onEvent?: (event: string, callback: (params?: TelegramThemeParams) => void) => void
    offEvent?: (event: string, callback: (params?: TelegramThemeParams) => void) => void
    [key: string]: unknown
  }

  interface TelegramNamespace {
    WebApp?: TelegramWebApp
  }

  interface Window {
    Telegram?: TelegramNamespace
  }
}

export {}
