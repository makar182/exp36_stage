import { z } from 'zod'

const aliasRegex = /^[a-zA-Z0-9-_]+$/

export const createShortLinkSchema = z.object({
  url: z
    .string({ required_error: 'Введите ссылку, которую необходимо сократить' })
    .trim()
    .min(1, 'Введите ссылку, которую необходимо сократить')
    .url('Введите корректный URL'),
  alias: z
    .string()
    .trim()
    .max(64, 'Алиас должен быть не длиннее 64 символов')
    .regex(aliasRegex, 'Допустимы только буквы латиницы, цифры, дефис и нижнее подчёркивание')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type CreateShortLinkFormValues = z.input<typeof createShortLinkSchema>

export type CreateShortLinkInput = {
  url: string
  alias?: string
}

export const normalizeCreateShortLinkInput = (
  values: CreateShortLinkFormValues,
): CreateShortLinkInput => {
  const parsed = createShortLinkSchema.parse(values)
  const url = parsed.url.trim()
  const alias = parsed.alias?.trim()

  return alias
    ? {
        url,
        alias,
      }
    : { url }
}
