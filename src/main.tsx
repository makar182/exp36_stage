import React from 'react' // Импортируем рантайм React, чтобы работала трансформация JSX.
import ReactDOM from 'react-dom/client' // Подключаем клиентский рендерер ReactDOM для современного создания корня.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // Импортируем инструменты клиента запросов для управления серверным состоянием.

import { NotificationCenter, NotificationProvider } from '@/shared/notifications' // Подключаем UI уведомлений и провайдер контекста из общего модуля.

import './index.css' // Подключаем глобальные стили приложения.

import { App } from './app' // Импортируем корневой компонент приложения, отвечающий за разметку и маршруты.

const queryClient = new QueryClient({ // Создаём клиент TanStack Query, управляющий кэшированием серверных данных.
  defaultOptions: { // Задаём настройки по умолчанию для всех запросов.
    queries: { // Конфигурируем параметры, относящиеся к запросам.
      refetchOnWindowFocus: false, // Отключаем автоматическое обновление при возвращении окна в фокус.
      retry: 1, // Повторяем неудачный запрос один раз перед показом ошибки.
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render( // Монтируем дерево компонентов React в корневой DOM-элемент.
  <React.StrictMode> {/* Включаем дополнительные проверки и предупреждения в режиме разработки. */}
    <QueryClientProvider client={queryClient}> {/* Передаём клиент запросов всем дочерним компонентам. */}
      <NotificationProvider> {/* Предоставляем контекст уведомлений компонентам, которые ставят сообщения в очередь. */}
        <App /> {/* Рендерим основной компонент приложения. */}
        <NotificationCenter /> {/* Размещаем центр уведомлений, чтобы сообщения отображались глобально. */}
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
