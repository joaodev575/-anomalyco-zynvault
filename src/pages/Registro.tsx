import { useState } from "react";
import { ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";

type Page = "login" | "registro" | "esqueci-senha";

interface RegistroProps {
  onNavigate: (page: Page) => void;
  onRegister: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading?: boolean;
}

export default function Registro({ onNavigate, onRegister, isLoading = false }: RegistroProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) { setError("Preencha todos os campos"); return; }
    if (password !== confirmPassword) { setError("As senhas nao coincidem"); return; }
    if (!acceptTerms) { setError("Voce precisa aceitar os termos de uso"); return; }
    try { await onRegister(name, email, password, confirmPassword); }
    catch (err: unknown) { setError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Falha ao criar conta"); }
  }

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center h-screen overflow-hidden px-4 py-8" style={{ background: 'var(--zx-bg-0)' }}>
      <div className="relative z-10 w-full max-w-[360px]">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--zx-radius-3)]" style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-brand-border)', boxShadow: '0 0 20px rgba(37, 99, 235, 0.25)' }}>
            <img src="/logo-1.png" alt="Zyntrix" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)', letterSpacing: '-0.02em' }}>Zyntrix</h1>
            <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>PC Intelligence & Maintenance</p>
          </div>
        </div>

        <div style={{ background: 'var(--zx-bg-1)', border: '1px solid var(--zx-border-2)', borderRadius: 'var(--zx-radius-4)', padding: 28 }}>
          <div className="mb-6">
            <h2 style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)' }}>Criar Conta</h2>
            <p className="mt-1.5" style={{ fontSize: 'var(--zx-text-sm)', color: 'var(--zx-text-3)' }}>Preencha os dados para criar sua conta</p>
          </div>

          {error && (
            <div className="mb-5" style={{ background: 'var(--zx-error-muted)', border: '1px solid var(--zx-error-border)', borderRadius: 'var(--zx-radius-2)', padding: '10px 12px', fontSize: 'var(--zx-text-xs)', fontWeight: 500, color: 'var(--zx-error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Nome</Label>
              <Input id="name" type="text" placeholder="Seu nome completo" autoComplete="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} disabled={isLoading}
                style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" autoComplete="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={isLoading}
                style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Senha</Label>
              <Input id="password" type="password" placeholder="Crie uma senha forte" autoComplete="new-password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} disabled={isLoading}
                style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Confirmar Senha</Label>
              <Input id="confirm-password" type="password" placeholder="Repita sua senha" autoComplete="new-password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} disabled={isLoading}
                style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 pt-1">
              <input id="terms" type="checkbox" className="mt-0.5 h-4 w-4 rounded" style={{ accentColor: 'var(--zx-brand)', border: '1px solid var(--zx-border-3)', background: 'var(--zx-bg-2)' }} checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} disabled={isLoading} />
              <span style={{ fontSize: 'var(--zx-text-xs)', lineHeight: 1.4, color: 'var(--zx-text-3)' }}>
                Aceito os <span style={{ color: 'var(--zx-brand)', cursor: 'pointer' }}>termos de uso</span> e a <span style={{ color: 'var(--zx-brand)', cursor: 'pointer' }}>politica de privacidade</span>
              </span>
            </label>
            <Button type="submit" disabled={isLoading} className="w-full" style={{ height: 40, marginTop: 8, fontSize: 'var(--zx-text-sm)', fontWeight: 600 }}>
              {isLoading ? <><Loader2 className="animate-spin" size={14} /> Criando conta...</> : <>Criar Conta <ArrowRight size={14} /></>}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1" style={{ height: 1, background: 'var(--zx-border-2)' }} />
            <span style={{ fontSize: 'var(--zx-text-xs)', fontWeight: 500, color: 'var(--zx-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ou</span>
            <div className="flex-1" style={{ height: 1, background: 'var(--zx-border-2)' }} />
          </div>

          <div style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', borderRadius: 'var(--zx-radius-2)', padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>
              Ja tem uma conta?{" "}
              <button type="button" onClick={() => onNavigate("login")} className="inline-flex items-center gap-1" style={{ fontWeight: 500, color: 'var(--zx-brand)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--zx-text-xs)' }}>
                <ArrowLeft size={12} />Entrar
              </button>
            </p>
          </div>
        </div>
        <p className="mt-6 text-center" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-4)' }}>Ambiente seguro e protegido</p>
      </div>
    </div>
  );
}
