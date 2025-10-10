import {
  createContext, // Создаём контекст React для глобального распространения уведомлений.
  useCallback, // Мемоизируем обработчики, чтобы избежать лишних перерисовок.
  useContext, // Доступаемся к контексту внутри хуков-потребителей.
  useEffect, // Очищаем таймеры при размонтировании провайдера.
  useMemo, // Мемоизируем значение контекста ради производительности.
  useRef, // Храним ссылки на таймеры автозакрытия.
  useState, // Храним список активных уведомлений в состоянии.
  type ReactNode, // Тип пропса children у провайдера.
} from 'react'

import type { Notification, NotifyOptions } from './types' // Импортируем типы, связанные с уведомлениями.

const NotificationContext = createContext<{
  notifications: Notification[] // Коллекция активных уведомлений, которые рисует центр.
  notify: (options: NotifyOptions) => string // Функция для постановки уведомления в очередь и получения его идентификатора.
  dismiss: (id: string) => void // Функция для удаления уведомления по идентификатору.
} | null>(null) // Инициализируем контекст null-значением, чтобы потребители могли обнаружить неправильное использование.

const nextId = (() => { // Замыкание, генерирующее уникальные последовательные идентификаторы уведомлений.
  let counter = 0 // Внутренний счётчик, запоминающий последний выданный идентификатор.
  return () => { // Возвращаем функцию, увеличивающую счётчик и возвращающую готовый идентификатор.
    counter += 1 // Увеличиваем счётчик для каждого нового идентификатора.
    return `notification-${counter}` // Собираем человеко-читаемую уникальную строку.
  }
})()

export const NotificationProvider = ({ children }: { children: ReactNode }) => { // Компонент-провайдер, который управляет состоянием уведомлений и отдаёт контекст.
  const [notifications, setNotifications] = useState<Notification[]>([]) // Поддерживаем список активных уведомлений.
  const timers = useRef(new Map<string, number>()) // Отслеживаем идентификаторы таймеров автозакрытия по ключу уведомления.

  const dismiss = useCallback((id: string) => { // Удаляем уведомление по идентификатору и очищаем его таймер.
    setNotifications((current) => current.filter((item) => item.id !== id)) // Фильтруем массив состояния, исключая закрытое уведомление.

    const timeoutId = timers.current.get(id) // Ищем запланированный таймер для указанного id.
    if (timeoutId) { // Очищаем таймер только если он действительно есть.
      clearTimeout(timeoutId) // Отменяем таймер автозакрытия.
      timers.current.delete(id) // Удаляем запись о таймере из карты.
    }
  }, [])

  const notify = useCallback( // Добавляем новое уведомление и при необходимости настраиваем автоудаление.
    ({ id: providedId, autoClose = 5000, ...rest }: NotifyOptions) => {
      const id = providedId ?? nextId() // Используем переданный идентификатор либо генерируем новый.

      setNotifications((current) => { // Атомарно обновляем массив уведомлений.
        const next = current.filter((item) => item.id !== id) // Удаляем возможное уведомление с таким же id.
        return [...next, { ...rest, id, autoClose }] // Добавляем новое уведомление в конец списка.
      })

      if (autoClose > 0 && typeof window !== 'undefined') { // Запускаем автоудаление только в браузере и если таймаут положительный.
        const timeoutId = window.setTimeout(() => { // Создаём таймер, который позже закроет уведомление.
          dismiss(id) // Закрываем уведомление, когда срабатывает таймер.
        }, autoClose)
        timers.current.set(id, timeoutId) // Сохраняем идентификатор таймера, чтобы его можно было отменить.
      }

      return id // Возвращаем идентификатор, чтобы вызывающий код мог ссылаться на уведомление.
    },
    [dismiss],
  )

  useEffect(() => { // Очищаем все активные таймеры при размонтировании провайдера.
    return () => {
      timers.current.forEach((timeoutId) => { // Проходим по всем активным таймерам.
        if (typeof window !== 'undefined') { // Проверяем наличие window перед очисткой.
          window.clearTimeout(timeoutId) // Отменяем каждый таймер, чтобы не осталось висящих колбэков.
        }
      })
      timers.current.clear() // Удаляем все записи из карты таймеров.
    }
  }, [])

  const value = useMemo( // Мемоизируем значение контекста, чтобы не перерисовывать потребителей лишний раз.
    () => ({
      notifications, // Передаём текущий список уведомлений.
      notify, // Передаём функцию постановки уведомлений в очередь.
      dismiss, // Передаём функцию удаления уведомлений.
    }),
    [dismiss, notifications, notify],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider> // Рендерим провайдер с мемоизированным значением контекста.
}

export const useNotificationContext = () => { // Пользовательский хук для безопасного доступа к контексту уведомлений.
  const context = useContext(NotificationContext) // Читаем значение контекста из React.
  if (!context) { // Бросаем понятную ошибку, если хук вызвали вне провайдера.
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context // Возвращаем полученное значение контекста вызывающему коду.
}
