import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import type { User } from '../../lib/api'

interface AppLayoutProps {
  children: React.ReactNode
  user: User
  activeNavItem: string
  onNavigate: (id: string) => void
  onLogout: () => void
  pageTitle: string
}

export function AppLayout({ children, user, activeNavItem, onNavigate, onLogout, pageTitle }: AppLayoutProps) {
  return (
    <div className="flex h-full" style={{ background: 'var(--zx-bg-0)' }}>
      <Sidebar activeNavItem={activeNavItem} onNavigate={onNavigate} user={user} onLogout={onLogout} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle={pageTitle} user={user} onNavigate={onNavigate} onLogout={onLogout} />
        <main className="flex-1 min-h-0 overflow-auto" style={{ background: 'var(--zx-bg-0)', padding: 'var(--zx-space-6)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
