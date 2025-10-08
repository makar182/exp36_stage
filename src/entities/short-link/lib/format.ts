const normalizeDateInput = (value?: string) => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

const formatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatShortLinkDate = (value?: string) => {
  const date = normalizeDateInput(value)

  if (!date) {
    return null
  }

  return formatter.format(date)
}
