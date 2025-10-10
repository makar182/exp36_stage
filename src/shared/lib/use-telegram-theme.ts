import { useEffect, useMemo, useState, type CSSProperties } from 'react' // Импортируем хуки React, чтобы отслеживать данные темы и мемоизировать вычисленные стили.

type Theme = { // Структура, описывающая нужные цвета темы Telegram.
  accentText?: string // Цвет текста на акцентных фонах.
  accent?: string // Основной акцентный цвет, который отдаёт Telegram.
  background?: string // Рекомендованный Telegram цвет фона.
}

const normaliseColor = (value?: string) => (value && value.trim().length > 0 ? value : undefined) // Считаем пустые или состоящие из пробелов значения неопределёнными.

const mapThemeParams = (params?: TelegramThemeParams | null): Theme | undefined => { // Преобразуем параметры темы Telegram в локальную структуру Theme.
  if (!params) { // Если параметров нет, возвращаем undefined, показывая отсутствие переопределений.
    return undefined
  }

  return {
    accentText: normaliseColor(params.button_text_color), // Извлекаем цвет текста на акцентных элементах, если он задан.
    accent: normaliseColor(params.button_color), // Берём основной акцентный цвет, который Telegram использует для кнопок.
    background: normaliseColor(params.bg_color), // Получаем рекомендуемый цвет фона.
  }
}

const resolveWebAppTheme = (): Theme | undefined => mapThemeParams(window.Telegram?.WebApp?.themeParams) // Читаем начальную тему из контекста Telegram WebApp, если он доступен.

export const useTelegramTheme = () => { // Хук, предоставляющий данные темы Telegram и производные стили.
  const [theme, setTheme] = useState<Theme | undefined>(() => resolveWebAppTheme()) // Инициализируем состояние текущими параметрами темы Telegram.

  useEffect(() => { // Подписываемся на изменения темы Telegram при монтировании хука.
    const webApp = window.Telegram?.WebApp // Получаем интерфейс Telegram WebApp из глобального объекта.

    if (!webApp) { // Выходим, если контекст Telegram недоступен.
      return
    }

    if (typeof webApp.ready === 'function') { // Некоторые интеграции требуют вызвать ready перед работой с темой.
      webApp.ready()
    }

    setTheme(mapThemeParams(webApp.themeParams)) // Заполняем локальное состояние темы текущими параметрами.

    const handleThemeChange = (params?: TelegramThemeParams) => { // Обработчик, вызываемый при изменении темы Telegram.
      const mapped = mapThemeParams(params) // Преобразуем входящие параметры к локальной структуре Theme.

      setTheme(mapped ?? mapThemeParams(webApp.themeParams)) // Используем переданную тему либо берём последние значения из объекта WebApp.
    }

    webApp.onEvent?.('themeChanged', handleThemeChange) // Регистрируем обработчик, если API предоставляет onEvent.

    return () => { // Функция очистки, выполняющаяся при размонтировании компонента.
      webApp.offEvent?.('themeChanged', handleThemeChange) // Удаляем обработчик, чтобы избежать утечек.
    }
  }, [])

  const accentStyle = useMemo(() => { // Мемоизируем вычисленные CSS-переменные, основанные на теме.
    if (!theme?.accent) { // Если акцентный цвет недоступен, возвращаем undefined и не задаём инлайновые стили.
      return undefined
    }

    return {
      '--accent-color': theme.accent, // Передаём акцентный цвет в виде CSS-переменной.
      '--accent-text-color': theme.accentText ?? '#ffffff', // Задаём запасной цвет текста для читаемости.
      '--background-color': theme.background ?? '#f8fafc', // Предоставляем запасной цвет фона, если Telegram его не прислал.
    } as CSSProperties // Приводим объект к CSSProperties, чтобы удовлетворить TypeScript.
  }, [theme])

  return { theme, accentStyle } // Возвращаем и сырые параметры темы, и готовые инлайновые стили.
}
