export const copyToClipboard = async (text: string) => { // Пытаемся скопировать переданный текст в буфер обмена.
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) { // По возможности используем современный асинхронный API буфера обмена.
    await navigator.clipboard.writeText(text) // Пишем текст через стандартизированный API.
    return // Выходим раньше, потому что копирование удалось.
  }

  if (typeof document === 'undefined') { // Страхуемся от выполнения в окружениях без DOM, например при SSR.
    throw new Error('Clipboard API недоступен в данном окружении') // Сообщаем вызывающему коду, что копирование невозможно.
  }

  const textarea = document.createElement('textarea') // Создаём скрытый textarea как запасной способ копирования текста.
  textarea.value = text // Заполняем поле текстом, который нужно скопировать.
  textarea.setAttribute('readonly', '') // Ставим readonly, чтобы не вызывать клавиатуру на мобильных.
  textarea.style.position = 'fixed' // Фиксируем позицию, чтобы прокрутка не влияла на элемент.
  textarea.style.top = '-1000px' // Убираем элемент за пределы экрана, исключая сдвиги верстки.
  textarea.style.opacity = '0' // Делаем textarea невидимой для пользователя.

  document.body.appendChild(textarea) // Добавляем textarea в DOM, чтобы выборка текста работала корректно.
  textarea.select() // Выделяем весь текст для копирования.

  try {
    const successful = document.execCommand('copy') // Используем устаревший execCommand для копирования текста.
    if (!successful) { // Проверяем, не вернула ли команда ошибку.
      throw new Error('Не удалось скопировать текст в буфер обмена') // Сообщаем вызывающему коду о неожиданной неудаче копирования.
    }
  } finally {
    document.body.removeChild(textarea) // Обязательно удаляем временный textarea, чтобы не засорять DOM.
  }
}
