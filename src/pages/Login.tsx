import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";

type Page = "login" | "registro" | "esqueci-senha";

interface LoginProps {
  onNavigate: (page: Page) => void;
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
  isLoading?: boolean;
}

export default function Login({ onNavigate, onLogin, isLoading = false }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha todos os campos"); return; }
    try {
      await onLogin(email, password, remember);
    } catch (err: unknown) {
      setError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Falha no login");
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center h-screen overflow-hidden px-4 py-8" style={{ background: 'var(--zx-bg-0)' }}>
      <div className="relative z-10 w-full max-w-[360px]">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[var(--zx-radius-3)]" style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-brand-border)', boxShadow: '0 0 12px rgba(37, 99, 235, 0.2)' }}>
            <img src="/logo-1.png" alt="Zyntrix" className="h-7 w-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)', letterSpacing: '-0.02em' }}>Zyntrix</h1>
            <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>PC Intelligence & Maintenance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--zx-bg-1)', border: '1px solid var(--zx-border-2)', borderRadius: 'var(--zx-radius-4)', padding: 28 }}>
          {error && (
            <div className="mb-5" style={{ background: 'var(--zx-error-muted)', border: '1px solid var(--zx-error-border)', borderRadius: 'var(--zx-radius-2)', padding: '10px 12px', fontSize: 'var(--zx-text-xs)', fontWeight: 500, color: 'var(--zx-error)' }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" autoComplete="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={isLoading}
                style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Senha</Label>
                <a href="javascript:void(0)" onClick={() => onNavigate("esqueci-senha")} style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)', transition: 'color 100ms' }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--zx-brand)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--zx-text-3)' }}
                >Esqueceu a senha?</a>
              </div>
              <Input id="password" type="password" placeholder="Digite sua senha" autoComplete="current-password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} disabled={isLoading}
                style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 pt-1">
              <input id="remember" type="checkbox" className="h-4 w-4 rounded" style={{ accentColor: 'var(--zx-brand)', border: '1px solid var(--zx-border-3)', background: 'var(--zx-bg-2)' }} checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={isLoading} />
              <span style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Lembrar de mim</span>
            </label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" style={{ height: 40, marginTop: 24, fontSize: 'var(--zx-text-sm)', fontWeight: 600 }}>
            {isLoading ? <><Loader2 className="animate-spin" size={14} /> Entrando...</> : <>Entrar <ArrowRight size={14} /></>}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1" style={{ height: 1, background: 'var(--zx-border-2)' }} />
          <span style={{ fontSize: 'var(--zx-text-xs)', fontWeight: 500, color: 'var(--zx-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ou</span>
          <div className="flex-1" style={{ height: 1, background: 'var(--zx-border-2)' }} />
        </div>

        <div className="text-center">
          <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>
            Nao tem uma conta?{" "}
            <a href="javascript:void(0)" onClick={() => onNavigate("registro")} style={{ fontWeight: 500, color: 'var(--zx-brand)', transition: 'color 100ms' }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--zx-brand-hover)' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--zx-brand)' }}
            >Criar Conta</a>
          </p>
        </div>
      </div>
      <p className="absolute bottom-5 text-center" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-4)' }}>Ambiente seguro e protegido</p>
    </div>
  );
}
