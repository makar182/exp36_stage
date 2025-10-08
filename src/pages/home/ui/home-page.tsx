import { ShortLinksDashboard } from '@/widgets/short-links-dashboard'
import { useShortLinks } from '@/features/short-links'
import { useTelegramTheme } from '@/shared/lib/use-telegram-theme'

export const HomePage = () => {
  const { accentStyle } = useTelegramTheme()
  const {
    links,
    loading,
    refreshing,
    creating,
    deleting,
    copiedId,
    refresh,
    createLink,
    copyLink,
    deleteLink,
  } = useShortLinks()

  return (
    <main className="app" style={accentStyle}>
      <ShortLinksDashboard
        links={links}
        loading={loading}
        refreshing={refreshing}
        creating={creating}
        deleting={deleting}
        copiedId={copiedId}
        onRefresh={refresh}
        onCreate={createLink}
        onCopy={copyLink}
        onDelete={deleteLink}
      />
    </main>
  )
}
