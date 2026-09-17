import { Hammer } from 'lucide-react'

export default function EmBreve() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-[280px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--zx-radius-4)]" style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)' }}>
          <Hammer size={28} style={{ color: 'var(--zx-text-3)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--zx-text-lg)', fontWeight: 'var(--zx-weight-bold)', color: 'var(--zx-text-1)' }}>Em Breve</h2>
          <p className="mt-1.5" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)', lineHeight: 'var(--zx-leading-relaxed)' }}>
            Esta funcionalidade estara disponivel em breve.
          </p>
        </div>
      </div>
    </div>
  )
}
