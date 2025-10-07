import { ShortLinksDashboard } from '@/widgets/short-links-dashboard'
import { useShortLinks } from '@/features/short-links'
import { useTelegramTheme } from '@/shared/lib/use-telegram-theme'

export const HomePage = () => {
  const { accentStyle } = useTelegramTheme()
  const {
    links,
    loading,
    creating,
    deleting,
    error,
    copiedId,
    refresh,
    createLink,
    copyLink,
    deleteLink,
    resetError,
    setErrorMessage,
  } = useShortLinks()

  return (
    <main className="app" style={accentStyle}>
      <ShortLinksDashboard
        links={links}
        loading={loading}
        creating={creating}
        deleting={deleting}
        error={error}
        copiedId={copiedId}
        onRefresh={refresh}
        onCreate={createLink}
        onCopy={copyLink}
        onDelete={deleteLink}
        onResetError={resetError}
        onSetError={setErrorMessage}
      />
    </main>
  )
}
