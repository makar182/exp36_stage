import { useNotifications } from '../use-notifications' // Используем хук уведомлений, чтобы получить состояние и действия.

export const NotificationCenter = () => { // Компонент, отвечающий за рендер активных уведомлений.
  const { notifications, dismiss } = useNotifications() // Получаем уведомления и обработчик закрытия из контекста.

  if (notifications.length === 0) { // Ничего не показываем, если отображать нечего.
    return null
  }

  return (
    <aside className="notification-center" role="status" aria-live="polite"> {/* Область, объявляющая новые уведомления. */}
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification--${notification.kind}`}> {/* Применяем модификатор варианта. */}
          <div className="notification__body"> {/* Контейнер для текстового содержимого. */}
            {notification.title && <p className="notification__title">{notification.title}</p>} {/* Показываем заголовок, если он передан. */}
            <p className="notification__message">{notification.message}</p> {/* Отображаем текст уведомления. */}
          </div>
          <button type="button" className="notification__close" onClick={() => dismiss(notification.id)} aria-label="Закрыть"> {/* Даём пользователю возможность закрыть уведомление вручную. */}
            ×
          </button>
        </div>
      ))}
    </aside>
  )
}
