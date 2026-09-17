import { useState, useRef, useEffect } from 'react'
import { Bell, Settings, ChevronDown, LogOut, Search } from 'lucide-react'
import type { User as UserType } from '../../lib/api'

interface TopBarProps {
  pageTitle: string
  user: UserType
  onNavigate: (id: string) => void
  onLogout: () => void
}

export function TopBar({ pageTitle, user, onNavigate, onLogout }: TopBarProps) {
  const [showUser, setShowUser] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="flex items-center justify-between px-5" style={{ height: 'var(--zx-topbar-height)', background: 'var(--zx-bg-1)', borderBottom: '1px solid var(--zx-border-2)', flexShrink: 0 }}>
      <h1 style={{ fontSize: 'var(--zx-text-lg)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)', letterSpacing: '-0.01em' }}>{pageTitle}</h1>

      <div className="flex items-center gap-1">
        {/* Search */}
        <button className="flex items-center gap-2" style={{ height: 28, padding: '0 8px', borderRadius: 'var(--zx-radius-2)', background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', color: 'var(--zx-text-4)', fontSize: 'var(--zx-text-xs)', cursor: 'pointer', transition: 'all 100ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--zx-border-3)'; e.currentTarget.style.color = 'var(--zx-text-3)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--zx-border-2)'; e.currentTarget.style.color = 'var(--zx-text-4)' }}
        ><Search size={11} /><span>Ctrl+K</span></button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => { setShowNotif(!showNotif); setShowUser(false) }} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--zx-radius-2)', background: showNotif ? 'var(--zx-bg-3)' : 'transparent', border: 'none', color: 'var(--zx-text-3)', position: 'relative', cursor: 'pointer', transition: 'all 100ms' }}
            onMouseEnter={(e) => { if (!showNotif) e.currentTarget.style.background = 'var(--zx-bg-2)' }}
            onMouseLeave={(e) => { if (!showNotif) e.currentTarget.style.background = 'transparent' }}
          >
            <Bell size={14} />
            <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--zx-brand)', border: '1.5px solid var(--zx-bg-1)' }} />
          </button>
          {showNotif && (
            <div className="animate-zx-slide-down" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 280, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-3)', borderRadius: 'var(--zx-radius-3)', boxShadow: 'var(--zx-shadow-3)', zIndex: 50, overflow: 'hidden' }}>
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)' }}>Notificacoes</div>
              <div className="px-3 py-6 text-center"><span style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-4)' }}>Nenhuma notificacao</span></div>
            </div>
          )}
        </div>

        {/* User */}
        <div ref={userRef} className="relative">
          <button onClick={() => { setShowUser(!showUser); setShowNotif(false) }} className="flex items-center gap-2" style={{ height: 28, padding: '0 6px', borderRadius: 'var(--zx-radius-2)', background: showUser ? 'var(--zx-bg-3)' : 'transparent', border: 'none', color: 'var(--zx-text-2)', cursor: 'pointer', transition: 'all 100ms' }}
            onMouseEnter={(e) => { if (!showUser) e.currentTarget.style.background = 'var(--zx-bg-2)' }}
            onMouseLeave={(e) => { if (!showUser) e.currentTarget.style.background = 'transparent' }}
          >
            <div className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 'var(--zx-radius-2)', background: 'var(--zx-brand-muted)', color: 'var(--zx-brand-hover)', fontSize: 'var(--zx-text-xs)', fontWeight: 'var(--zx-weight-semibold)' }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <ChevronDown size={11} style={{ color: 'var(--zx-text-4)' }} />
          </button>
          {showUser && (
            <div className="animate-zx-slide-down" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 190, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-3)', borderRadius: 'var(--zx-radius-3)', boxShadow: 'var(--zx-shadow-3)', zIndex: 50, overflow: 'hidden' }}>
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--zx-border-2)' }}>
                <div style={{ fontSize: 'var(--zx-text-sm)', fontWeight: 'var(--zx-weight-medium)', color: 'var(--zx-text-1)' }}>{user.name}</div>
                <div style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>{user.email}</div>
              </div>
              <div className="py-1">
                <button onClick={() => { onNavigate('settings'); setShowUser(false) }} className="flex items-center gap-2 w-full text-left" style={{ height: 28, padding: '0 12px', background: 'transparent', border: 'none', color: 'var(--zx-text-2)', fontSize: 'var(--zx-text-sm)', cursor: 'pointer', transition: 'background 100ms' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-bg-3)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                ><Settings size={12} />Configuracoes</button>
                <button onClick={() => { onLogout(); setShowUser(false) }} className="flex items-center gap-2 w-full text-left" style={{ height: 28, padding: '0 12px', background: 'transparent', border: 'none', color: 'var(--zx-error)', fontSize: 'var(--zx-text-sm)', cursor: 'pointer', transition: 'background 100ms' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-error-muted)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                ><LogOut size={12} />Sair</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
