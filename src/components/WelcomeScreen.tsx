import { useState, useCallback } from 'react'
import { Monitor, Activity, Wrench, HeartPulse, Settings, ChevronRight, ChevronLeft, X, Zap } from 'lucide-react'

interface WelcomeScreenProps { onComplete: () => void }

export function shouldShowOnboarding(): boolean {
  return !localStorage.getItem('zynvault-onboarded')
}

const SLIDES = [
  { icon: Zap, title: 'Bem-vindo ao Zyntrix', description: 'Seu centro de controle para otimizacao e monitoramento do sistema.', accent: 'var(--zx-brand)' },
  { icon: Monitor, title: 'Visao Geral', description: 'Acompanhe o desempenho do seu sistema em tempo real com metricas detalhadas.', accent: 'var(--zx-brand)' },
  { icon: Activity, title: 'Monitoramento', description: 'Monitore o uso de recursos com graficos ao vivo e alertas inteligentes.', accent: 'var(--zx-info)' },
  { icon: Wrench, title: 'Ferramentas', description: 'Acesse ferramentas de manutencao, otimizacao e diagnostico do sistema.', accent: 'var(--zx-success)' },
  { icon: HeartPulse, title: 'Saude do Sistema', description: 'Verifique integridade, drivers e componentes com diagnosticos completos.', accent: 'var(--zx-warning)' },
  { icon: Settings, title: 'Personalizacao', description: 'Configure o Zyntrix conforme suas preferencias e necessidades.', accent: 'var(--zx-text-3)' },
]

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]
  const Icon = slide.icon

  const handleNext = useCallback(() => {
    if (current < SLIDES.length - 1) setCurrent(c => c + 1)
    else { localStorage.setItem('zynvault-onboarded', 'true'); onComplete() }
  }, [current, onComplete])

  const handleClose = useCallback(() => {
    localStorage.setItem('zynvault-onboarded', 'true'); onComplete()
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center animate-zx-fade-in" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }}>
      <div className="flex flex-col animate-zx-scale-in" style={{ width: 400, background: 'var(--zx-bg-1)', border: '1px solid var(--zx-border-3)', borderRadius: 'var(--zx-radius-4)', boxShadow: 'var(--zx-shadow-4)', overflow: 'hidden' }}>
        <div className="flex justify-end p-3">
          <button onClick={handleClose} style={{ width: 28, height: 28, borderRadius: 'var(--zx-radius-2)', background: 'transparent', border: 'none', color: 'var(--zx-text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 100ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--zx-bg-3)'; e.currentTarget.style.color = 'var(--zx-text-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--zx-text-3)' }}
          ><X size={14} /></button>
        </div>

        <div className="flex flex-col items-center px-8 pb-6" style={{ minHeight: 200 }}>
          <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 'var(--zx-radius-4)', background: 'var(--zx-brand-muted)', border: '1px solid var(--zx-brand-border)', marginBottom: 20 }}>
            <Icon size={22} style={{ color: slide.accent }} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)', marginBottom: 8, textAlign: 'center' }}>{slide.title}</h2>
          <p style={{ fontSize: 'var(--zx-text-sm)', color: 'var(--zx-text-3)', textAlign: 'center', lineHeight: 'var(--zx-leading-relaxed)', maxWidth: 300 }}>{slide.description}</p>
        </div>

        <div className="flex justify-center gap-1.5 pb-4">
          {SLIDES.map((_, i) => (
            <div key={i} style={{ width: i === current ? 16 : 5, height: 5, borderRadius: 3, background: i === current ? 'var(--zx-brand)' : 'var(--zx-bg-4)', transition: 'all 200ms' }} />
          ))}
        </div>

        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid var(--zx-border-2)', background: 'var(--zx-bg-0)' }}>
          <button onClick={() => current > 0 && setCurrent(c => c - 1)} disabled={current === 0} className="zx-btn zx-btn-ghost" style={{ height: 30, fontSize: 'var(--zx-text-xs)', opacity: current === 0 ? 0.3 : 1 }}>
            <ChevronLeft size={14} />Voltar
          </button>
          <button onClick={handleNext} className="zx-btn zx-btn-primary" style={{ height: 30, fontSize: 'var(--zx-text-xs)' }}>
            {current === SLIDES.length - 1 ? 'Comecar' : 'Proximo'}
            {current < SLIDES.length - 1 && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
