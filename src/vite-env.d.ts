/// <reference types="vite/client" />

declare global {
  interface TelegramWebApp {
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
