import { useState, useEffect } from 'react'

interface LoadingScreenProps {
  message?: string
  submessage?: string
  onComplete?: () => void
  duration?: number
}

export default function LoadingScreen({
  message = 'Inicializando',
  submessage = 'Carregando recursos',
  onComplete,
  duration = 2500,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1)
      setProgress((1 - Math.pow(1 - t, 3)) * 100)
      if (t >= 1) { clearInterval(interval); onComplete?.() }
    }, 16)
    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div className="flex flex-col items-center justify-center flex-1" style={{ background: 'var(--zx-bg-0)' }}>
      <div className="flex flex-col items-center gap-5 animate-zx-fade-in">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--zx-radius-3)]" style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-brand-border)', boxShadow: '0 0 20px rgba(37, 99, 235, 0.25)' }}>
          <img src="/logo-1.png" alt="Zyntrix" style={{ width: 40, height: 40 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)', letterSpacing: '-0.02em' }}>
            Zyntrix
          </span>
          <span style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>{submessage}</span>
        </div>
        <div className="zx-progress" style={{ width: 160, marginTop: 8 }}>
          <div className="zx-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-4)' }}>{message}</span>
      </div>
    </div>
  )
}
