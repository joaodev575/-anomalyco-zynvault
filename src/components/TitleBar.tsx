import { useState, useEffect } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

interface TitleBarProps {
  currentPage?: string
}

export function TitleBar({ currentPage }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (window.zynvaultAPI?.windowIsMaximized) {
        setIsMaximized(await window.zynvaultAPI.windowIsMaximized())
      }
    }
    check()
  }, [])

  return (
    <>
      <style>{`
        .zx-drag { -webkit-app-region: drag; }
        .zx-no-drag { -webkit-app-region: no-drag; }
      `}</style>
      <div
        className="flex items-center justify-between select-none zx-drag"
        style={{
          height: 'var(--zx-titlebar-height)',
          background: 'var(--zx-bg-1)',
          borderBottom: '1px solid var(--zx-border-2)',
        }}
      >
        <div className="flex items-center gap-2 pl-3 zx-no-drag">
          <img src="/logo-1.png" alt="" style={{ width: 16, height: 16, borderRadius: 3, boxShadow: '0 0 5px rgba(37, 99, 235, 0.25)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span style={{ fontSize: 'var(--zx-text-sm)', fontWeight: 'var(--zx-weight-bold)', color: 'var(--zx-text-1)', letterSpacing: '-0.01em' }}>
            Zyntrix
          </span>
          {currentPage && (
            <>
              <span style={{ color: 'var(--zx-text-4)', fontSize: 'var(--zx-text-xs)' }}>/</span>
              <span style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)', fontWeight: 'var(--zx-weight-medium)' }}>
                {currentPage}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center h-full zx-no-drag">
          <button
            onClick={() => window.zynvaultAPI?.windowMinimize?.()}
            className="flex items-center justify-center h-full"
            style={{ width: 46, background: 'transparent', border: 'none', color: 'var(--zx-text-3)', transition: 'all 100ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-bg-3)'; e.currentTarget.style.color = 'var(--zx-text-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--zx-text-3)' }}
          >
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => window.zynvaultAPI?.windowMaximize?.()}
            className="flex items-center justify-center h-full"
            style={{ width: 46, background: 'transparent', border: 'none', color: 'var(--zx-text-3)', transition: 'all 100ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-bg-3)'; e.currentTarget.style.color = 'var(--zx-text-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--zx-text-3)' }}
          >
            {isMaximized ? <Square size={11} strokeWidth={1.5} /> : <Maximize2 size={13} strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => window.zynvaultAPI?.windowClose?.()}
            className="flex items-center justify-center h-full"
            style={{ width: 46, background: 'transparent', border: 'none', color: 'var(--zx-text-3)', transition: 'all 100ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-error)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--zx-text-3)' }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  )
}
