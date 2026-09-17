import { LayoutDashboard, Cpu, Activity, HeartPulse, Wrench, Gauge, Wifi, FileText, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import type { User } from '../../lib/api'

interface SidebarProps {
  activeNavItem: string
  onNavigate: (id: string) => void
  user: User
  onLogout: () => void
}

const NAV_SECTIONS = [
  { label: 'Geral', items: [{ id: 'overview', label: 'Visao Geral', icon: LayoutDashboard }] },
  { label: 'Sistema', items: [
    { id: 'system', label: 'Sistema', icon: Cpu },
    { id: 'monitoring', label: 'Monitoramento', icon: Activity },
    { id: 'health', label: 'Saude', icon: HeartPulse },
  ]},
  { label: 'Ferramentas', items: [
    { id: 'maintenance', label: 'Manutencao', icon: Wrench },
    { id: 'optimization', label: 'Otimizacao', icon: Gauge },
    { id: 'network', label: 'Rede', icon: Wifi },
    { id: 'reports', label: 'Relatorios', icon: FileText },
  ]},
  { label: 'App', items: [{ id: 'settings', label: 'Configuracoes', icon: Settings }] },
]

export function Sidebar({ activeNavItem, onNavigate, user, onLogout }: SidebarProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <aside className="flex flex-col h-full select-none" style={{ width: 'var(--zx-sidebar-width)', minWidth: 'var(--zx-sidebar-width)', background: 'var(--zx-bg-1)', borderRight: '1px solid var(--zx-border-2)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4" style={{ height: 'var(--zx-topbar-height)', borderBottom: '1px solid var(--zx-border-1)' }}>
        <img src="/logo-1.png" alt="" style={{ width: 20, height: 20, borderRadius: 4, boxShadow: '0 0 6px rgba(37, 99, 235, 0.3)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <span style={{ fontSize: 'var(--zx-text-sm)', fontWeight: 'var(--zx-weight-bold)', color: 'var(--zx-text-1)', letterSpacing: '-0.02em' }}>Zyntrix</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            <div className="px-2 mb-1.5" style={{ fontSize: 'var(--zx-text-xs)', fontWeight: 'var(--zx-weight-medium)', color: 'var(--zx-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeNavItem === item.id
              const isHov = hovered === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center gap-2.5 w-full text-left"
                  style={{
                    height: 32, padding: '0 10px', borderRadius: 'var(--zx-radius-2)', border: 'none',
                    background: isActive ? 'var(--zx-brand-muted)' : isHov ? 'var(--zx-bg-2)' : 'transparent',
                    color: isActive ? 'var(--zx-brand-hover)' : 'var(--zx-text-2)',
                    fontSize: 'var(--zx-text-sm)',
                    fontWeight: isActive ? 'var(--zx-weight-medium)' : 'var(--zx-weight-normal)',
                    transition: 'all 100ms', cursor: 'pointer',
                  }}
                >
                  <Icon size={15} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--zx-border-2)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 'var(--zx-radius-2)', background: 'var(--zx-brand-muted)', color: 'var(--zx-brand-hover)', fontSize: 'var(--zx-text-xs)', fontWeight: 'var(--zx-weight-semibold)', flexShrink: 0 }}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 'var(--zx-text-sm)', fontWeight: 'var(--zx-weight-medium)', color: 'var(--zx-text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
          <button onClick={onLogout} title="Sair" style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--zx-radius-2)', background: 'transparent', border: 'none', color: 'var(--zx-text-4)', flexShrink: 0, cursor: 'pointer', transition: 'all 100ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-error-muted)'; e.currentTarget.style.color = 'var(--zx-error)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--zx-text-4)' }}
          ><LogOut size={13} /></button>
        </div>
      </div>
    </aside>
  )
}
