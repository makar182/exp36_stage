import { zodResolver } from '@hookform/resolvers/zod'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'

import {
  createShortLinkSchema,
  normalizeCreateShortLinkInput,
  type CreateShortLinkFormValues,
  type CreateShortLinkInput,
} from '../model/create-short-link-schema'

const defaultValues: CreateShortLinkFormValues = {
  url: '',
  alias: '',
}

type ShortLinkFormProps = {
  creating: boolean
  onCreate: (payload: CreateShortLinkInput) => Promise<void>
}

export const ShortLinkForm: FC<ShortLinkFormProps> = ({ creating, onCreate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateShortLinkFormValues>({
    resolver: zodResolver(createShortLinkSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCreate(normalizeCreateShortLinkInput(values))
      reset(defaultValues)
    } catch (error) {
      console.error('Failed to create short link', error)
    }
  })

  return (
    <form className="shorten-form" onSubmit={onSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="url">Длинная ссылка</label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com/article"
          {...register('url')}
          disabled={creating || isSubmitting}
          autoComplete="off"
        />
        {errors.url && <p className="form-error">{errors.url.message}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="alias">Пользовательский алиас (необязательно)</label>
        <input
          id="alias"
          type="text"
          placeholder="my-custom-alias"
          {...register('alias')}
          disabled={creating || isSubmitting}
          autoComplete="off"
        />
        {errors.alias && <p className="form-error">{errors.alias.message}</p>}
      </div>
      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={creating || isSubmitting}>
          {creating || isSubmitting ? 'Создание...' : 'Создать короткую ссылку'}
        </button>
      </div>
    </form>
  )
}
