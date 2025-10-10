import { useCallback } from 'react' // Импортируем useCallback, чтобы мемоизировать обёрнутый обработчик уведомлений.

import type { NotifyOptions } from './types' // Импортируем тип опций, которые принимаются при создании уведомлений.
import { useNotificationContext } from './notification-provider' // Получаем контекст уведомлений, чтобы читать состояние и действия.

export const useNotifications = () => { // Хук, предоставляющий компонентам помощники для работы с уведомлениями.
  const { notifications, notify, dismiss } = useNotificationContext() // Получаем из контекста уведомления и функции управления.

  const push = useCallback( // Мемоизируем обёртку вокруг notify, чтобы сохранить стабильные ссылки.
    (options: NotifyOptions) => {
      return notify(options) // Делегируем вызов реализации notify из контекста.
    },
    [notify], // Пересоздаём обёртку только при изменении функции notify.
  )

  return {
    notifications, // Передаём массив активных уведомлений для рендера.
    notify: push, // Предоставляем мемоизированную функцию постановки уведомлений в очередь.
    dismiss, // Отдаём помощник закрытия, чтобы вызывать удаление уведомлений.
  }
}
