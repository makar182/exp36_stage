import { zodResolver } from '@hookform/resolvers/zod' // Интегрируем Zod с react-hook-form для валидации по схеме.
import type { FC } from 'react' // Используем тип FC для описания сигнатуры компонента.
import { useForm } from 'react-hook-form' // Применяем react-hook-form для управления состоянием формы.

import {
  createShortLinkSchema, // Схема валидации, описывающая ожидаемые поля.
  normalizeCreateShortLinkInput, // Помощник, который превращает значения формы в payload для API.
  type CreateShortLinkFormValues, // Тип, представляющий контролируемые значения формы.
  type CreateShortLinkInput, // Тип нормализованного payload для создания.
} from '../model/create-short-link-schema'

const defaultValues: CreateShortLinkFormValues = { // Задаём начальные значения для элементов формы.
  url: '', // Начинаем с пустого поля ссылки.
  alias: '', // Начинаем с пустого поля алиаса.
}

type ShortLinkFormProps = { // Пропсы, которые принимает компонент ShortLinkForm.
  creating: boolean // Показывает, выполняется ли сейчас запрос на создание ссылки.
  onCreate: (payload: CreateShortLinkInput) => Promise<void> // Колбэк, вызываемый после успешной отправки формы.
}

export const ShortLinkForm: FC<ShortLinkFormProps> = ({ creating, onCreate }) => { // Описываем компонент формы, собирающий данные для короткой ссылки.
  const {
    register, // Регистрируем поля, чтобы связать их с react-hook-form.
    handleSubmit, // Помощник для сборки обработчика отправки с предварительной валидацией.
    reset, // Функция, сбрасывающая форму к исходному состоянию.
    formState: { errors, isSubmitting }, // Получаем ошибки валидации и внутренний флаг отправки.
  } = useForm<CreateShortLinkFormValues>({
    resolver: zodResolver(createShortLinkSchema), // Валидируем поля с помощью схемы Zod.
    defaultValues, // Инициализируем форму заранее заданными значениями.
    mode: 'onBlur', // Запускаем проверку при потере фокуса для ранней обратной связи.
  })

  const onSubmit = handleSubmit(async (values) => { // Формируем обработчик отправки с валидацией и нормализацией.
    try {
      await onCreate(normalizeCreateShortLinkInput(values)) // Нормализуем данные и запускаем создание через пропсы.
      reset(defaultValues) // Очищаем форму после успешной отправки.
    } catch (error) {
      console.error('Failed to create short link', error) // Логируем неожиданные ошибки для отладки, не нарушая UX.
    }
  })

  return ( // Рендерим разметку формы, связанную с состоянием react-hook-form.
    <form className="shorten-form" onSubmit={onSubmit} noValidate> {/* Отключаем встроенную валидацию, чтобы использовать собственную логику. */}
      <div className="form-field"> {/* Группа для поля URL и его подписи. */}
        <label htmlFor="url">Длинная ссылка</label>
        <input
          id="url"
          type="url" // Используем тип URL, чтобы на мобильных показать подходящую клавиатуру и базовые подсказки.
          placeholder="https://example.com/article" // Даём пример, подсказывающий ожидаемый формат.
          {...register('url')} // Привязываем поле к контроллеру react-hook-form.
          disabled={creating || isSubmitting} // Блокируем ввод, пока идёт запрос.
          autoComplete="off" // Предотвращаем автозаполнение браузера.
        />
        {errors.url && <p className="form-error">{errors.url.message}</p>} {/* Показываем сообщение об ошибке, если URL не прошёл проверку. */}
      </div>
      <div className="form-field"> {/* Группа для необязательного алиаса. */}
        <label htmlFor="alias">Пользовательский алиас (необязательно)</label>
        <input
          id="alias"
          type="text" // Используем текстовое поле, поскольку у алиаса собственные правила валидации.
          placeholder="my-custom-alias" // Подсказываем ожидаемый формат алиаса.
          {...register('alias')} // Привязываем поле алиаса к состоянию формы.
          disabled={creating || isSubmitting} // Запрещаем правки во время отправки.
          autoComplete="off" // Не даём сохранённым значениям заполнять поле автоматически.
        />
        {errors.alias && <p className="form-error">{errors.alias.message}</p>} {/* Показываем сообщение об ошибке для алиаса при необходимости. */}
      </div>
      <div className="form-actions"> {/* Контейнер для кнопки отправки. */}
        <button className="primary-button" type="submit" disabled={creating || isSubmitting}> {/* Блокируем кнопку на время отправки. */}
          {creating || isSubmitting ? 'Создание...' : 'Создать короткую ссылку'} {/* Меняем подпись в зависимости от статуса отправки. */}
        </button>
      </div>
    </form>
  )
}
