export { useShortLinks } from './model/use-short-links' // Переэкспортируем доменный хук для потребителей вне модуля фичи.
export type {
  CreateShortLinkFormValues, // Предоставляем тип значений формы для UI-слоя.
  CreateShortLinkInput, // Предоставляем тип нормализованного payload для взаимодействия с API.
} from './model/create-short-link-schema'
export {
  createShortLinkSchema, // Предоставляем схему Zod для повторного использования валидации.
  normalizeCreateShortLinkInput, // Предоставляем помощник, преобразующий значения формы в payload для API.
} from './model/create-short-link-schema'
export { ShortLinkForm } from './ui/short-link-form' // Экспортируем переиспользуемый компонент формы создания ссылок.
