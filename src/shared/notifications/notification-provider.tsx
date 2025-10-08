import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { Notification, NotifyOptions } from './types'

const NotificationContext = createContext<{
  notifications: Notification[]
  notify: (options: NotifyOptions) => string
  dismiss: (id: string) => void
} | null>(null)

const nextId = (() => {
  let counter = 0
  return () => {
    counter += 1
    return `notification-${counter}`
  }
})()

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id))

    const timeoutId = timers.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timers.current.delete(id)
    }
  }, [])

  const notify = useCallback(
    ({ id: providedId, autoClose = 5000, ...rest }: NotifyOptions) => {
      const id = providedId ?? nextId()

      setNotifications((current) => {
        const next = current.filter((item) => item.id !== id)
        return [...next, { ...rest, id, autoClose }]
      })

      if (autoClose > 0 && typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          dismiss(id)
        }, autoClose)
        timers.current.set(id, timeoutId)
      }

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    return () => {
      timers.current.forEach((timeoutId) => {
        if (typeof window !== 'undefined') {
          window.clearTimeout(timeoutId)
        }
      })
      timers.current.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      notify,
      dismiss,
    }),
    [dismiss, notifications, notify],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}
