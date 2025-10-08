import { useNotifications } from '../use-notifications'

export const NotificationCenter = () => {
  const { notifications, dismiss } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <aside className="notification-center" role="status" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification--${notification.kind}`}>
          <div className="notification__body">
            {notification.title && <p className="notification__title">{notification.title}</p>}
            <p className="notification__message">{notification.message}</p>
          </div>
          <button type="button" className="notification__close" onClick={() => dismiss(notification.id)} aria-label="Закрыть">
            ×
          </button>
        </div>
      ))}
    </aside>
  )
}
