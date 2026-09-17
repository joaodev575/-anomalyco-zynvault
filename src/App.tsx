import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { TitleBar } from './components/TitleBar'
import LoadingScreen from './components/LoadingScreen'
import { WelcomeScreen, shouldShowOnboarding } from './components/WelcomeScreen'
import { AppLayout } from './components/layout/AppLayout'
import { MetricsProvider } from './contexts/MetricsContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import Login from './pages/Login'
import Registro from './pages/Registro'
import EsqueciSenha from './pages/EsqueciSenha'
import { api, User } from './lib/api'
import { initTelemetry, clearTelemetry, trackAppLaunch, trackActivity } from './lib/telemetry'

const Overview = lazy(() => import('./pages/Overview'))
const System = lazy(() => import('./pages/System'))
const Monitoring = lazy(() => import('./pages/Monitoring'))
const Health = lazy(() => import('./pages/Health'))
const Maintenance = lazy(() => import('./pages/Maintenance'))
const Optimization = lazy(() => import('./pages/Optimization'))
const Network = lazy(() => import('./pages/Network'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--zx-border-1)] border-t-[var(--zx-brand)]" />
        <span className="text-[9px] text-[var(--zx-text-3)]">Carregando...</span>
      </div>
    </div>
  )
}

type AuthPage = 'login' | 'registro' | 'esqueci-senha'
type AppPage = 'overview' | 'system' | 'monitoring' | 'health' | 'maintenance' | 'optimization' | 'network' | 'reports' | 'settings'
type Page = AuthPage | AppPage

const PAGE_TITLES: Record<AppPage, string> = {
  overview: 'Visao Geral',
  system: 'Sistema',
  monitoring: 'Monitoramento',
  health: 'Saude',
  maintenance: 'Manutencao',
  optimization: 'Otimizacao',
  network: 'Rede',
  reports: 'Relatorios',
  settings: 'Configuracoes',
}

function App() {
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useKeyboardShortcuts({
    'ctrl+1': () => setPage('overview'),
    'ctrl+2': () => setPage('system'),
    'ctrl+3': () => setPage('monitoring'),
    'ctrl+4': () => setPage('health'),
    'ctrl+5': () => setPage('maintenance'),
    'ctrl+6': () => setPage('network'),
    'ctrl+7': () => setPage('reports'),
    'ctrl+8': () => setPage('settings'),
    'ctrl+l': () => { localStorage.removeItem('token'); window.location.reload() },
  })

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.getMe()
        if (response.success && response.data?.user) {
          setUser(response.data.user)
          setPage('overview')
          initTelemetry(response.data.user.id)
          trackAppLaunch()
          if (shouldShowOnboarding()) {
            setShowWelcome(true)
          }
        } else {
          localStorage.removeItem('token')
        }
      } catch {
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = useCallback(async (email: string, password: string, remember: boolean) => {
    setIsAuthLoading(true)
    try {
      const response = await api.login({ email, password, remember })
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        setPage('overview')
        initTelemetry(response.data.user.id)
        trackActivity('Login realizado', 'system')
        trackAppLaunch()
        if (shouldShowOnboarding()) {
          setShowWelcome(true)
        }
      } else if (!response.success && response.message) {
        throw new Error(response.message)
      } else {
        throw new Error('Falha no login')
      }
    } catch (err) {
      throw err
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  const handleRegister = useCallback(
    async (name: string, email: string, password: string, confirmPassword: string) => {
      setIsAuthLoading(true)
      try {
        const response = await api.register({ name, email, password, confirmPassword })
        if (response.success && response.data?.user) {
          setUser(response.data.user)
          setPage('overview')
          if (shouldShowOnboarding()) {
            setShowWelcome(true)
          }
        } else {
          throw new Error(response.message || 'Falha no registro')
        }
      } finally {
        setIsAuthLoading(false)
      }
    },
    []
  )

  const handleForgotPassword = useCallback(async (email: string) => {
    setIsAuthLoading(true)
    try {
      await api.forgotPassword({ email })
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      clearTelemetry()
      setUser(null)
      setPage('login')
      setShowWelcome(false)
    }
  }, [])

  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false)
  }, [])

  const isAuthPage = (p: Page): p is AuthPage =>
    p === 'login' || p === 'registro' || p === 'esqueci-senha'

  const isAppPage = (p: Page): p is AppPage =>
    !isAuthPage(p)

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col">
        <TitleBar />
        <LoadingScreen
          message="Inicializando"
          submessage="Verificando credenciais"
          onComplete={() => {}}
          duration={2000}
        />
      </div>
    )
  }

  function renderAuthPage() {
    switch (page) {
      case 'login':
        return (
          <Login
            onNavigate={setPage}
            onLogin={handleLogin}
            isLoading={isAuthLoading}
          />
        )
      case 'registro':
        return (
          <Registro
            onNavigate={setPage}
            onRegister={handleRegister}
            isLoading={isAuthLoading}
          />
        )
      case 'esqueci-senha':
        return (
          <EsqueciSenha
            onNavigate={setPage}
            onForgotPassword={handleForgotPassword}
            isLoading={isAuthLoading}
          />
        )
      default:
        return (
          <Login
            onNavigate={setPage}
            onLogin={handleLogin}
            isLoading={isAuthLoading}
          />
        )
    }
  }

  function renderAppPage() {
    if (!user) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-[var(--zx-text-2)]">Faca login para continuar</p>
        </div>
      )
    }

    switch (page) {
      case 'overview':
        return <Overview />
      case 'system':
        return <System />
      case 'monitoring':
        return <Monitoring />
      case 'health':
        return <Health />
      case 'maintenance':
        return <Maintenance />
      case 'optimization':
        return <Optimization />
      case 'network':
        return <Network />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings user={user} />
      default:
        return <Overview />
    }
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <TitleBar currentPage={isAppPage(page) ? PAGE_TITLES[page] : undefined} />
      <main className="flex-1 min-h-0 overflow-hidden bg-[var(--zx-bg-0)]">
        {isAuthPage(page) ? (
          renderAuthPage()
        ) : (
          <MetricsProvider>
          <AppLayout
            user={user!}
            activeNavItem={page}
            onNavigate={(id) => {
              if (isAppPage(id as Page)) setPage(id as AppPage)
            }}
            onLogout={handleLogout}
            pageTitle={PAGE_TITLES[page as AppPage] || 'Visao Geral'}
          >
            {isAuthLoading ? (
              <LoadingScreen
                message="Processando"
                submessage="Aguarde"
                onComplete={() => {}}
                duration={1500}
              />
            ) : (
              <Suspense fallback={<PageFallback />}>
                {renderAppPage()}
              </Suspense>
            )}
          </AppLayout>
          </MetricsProvider>
        )}
      </main>

      {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}
    </div>
  )
}

export default App
