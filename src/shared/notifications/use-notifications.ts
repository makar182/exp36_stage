import { useCallback } from 'react'

import type { NotifyOptions } from './types'
import { useNotificationContext } from './notification-provider'

export const useNotifications = () => {
  const { notifications, notify, dismiss } = useNotificationContext()

  const push = useCallback(
    (options: NotifyOptions) => {
      return notify(options)
    },
    [notify],
  )

  return {
    notifications,
    notify: push,
    dismiss,
  }
}
