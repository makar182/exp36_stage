export type NotificationKind = 'info' | 'success' | 'error'

export type Notification = {
  id: string
  kind: NotificationKind
  title?: string
  message: string
  autoClose?: number
}

export type NotifyOptions = Omit<Notification, 'id'> & { id?: string }
