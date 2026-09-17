import { useState } from "react";
import { ArrowRight, Loader2, ArrowLeft, Check } from "lucide-react";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";

type Page = "login" | "registro" | "esqueci-senha";

interface EsqueciSenhaProps {
  onNavigate: (page: Page) => void;
  onForgotPassword: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EsqueciSenha({ onNavigate, onForgotPassword, isLoading = false }: EsqueciSenhaProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Digite seu email"); return; }
    try { await onForgotPassword(email); setSuccess(true); }
    catch (err: unknown) { setError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Falha ao enviar codigo"); }
  }

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center h-screen overflow-hidden px-4 py-8" style={{ background: 'var(--zx-bg-0)' }}>
      <div className="relative z-10 w-full max-w-[360px]">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[var(--zx-radius-3)]" style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-brand-border)', boxShadow: '0 0 12px rgba(37, 99, 235, 0.2)' }}>
            <img src="/logo-1.png" alt="Zyntrix" className="h-7 w-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)', letterSpacing: '-0.02em' }}>Zyntrix</h1>
            <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>PC Intelligence & Maintenance</p>
          </div>
        </div>

        <div style={{ background: 'var(--zx-bg-1)', border: '1px solid var(--zx-border-2)', borderRadius: 'var(--zx-radius-4)', padding: 28 }}>
          {success ? (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'var(--zx-success-muted)', border: '1px solid var(--zx-success-border)' }}>
                <Check size={24} style={{ color: 'var(--zx-success)' }} strokeWidth={2} />
              </div>
              <div className="text-center">
                <h2 style={{ fontSize: 'var(--zx-text-lg)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)' }}>Email enviado!</h2>
                <p className="mt-1.5" style={{ fontSize: 'var(--zx-text-sm)', color: 'var(--zx-text-3)' }}>Verifique sua caixa de entrada para o codigo de recuperacao.</p>
              </div>
              <Button type="button" onClick={() => onNavigate("login")} className="w-full" style={{ height: 40, fontSize: 'var(--zx-text-sm)', fontWeight: 600 }}>
                <ArrowLeft size={14} /> Voltar ao login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 style={{ fontSize: 'var(--zx-text-xl)', fontWeight: 'var(--zx-weight-semibold)', color: 'var(--zx-text-1)' }}>Recuperar Senha</h2>
                <p className="mt-1.5" style={{ fontSize: 'var(--zx-text-sm)', color: 'var(--zx-text-3)' }}>Digite seu email para receber o link de recuperacao</p>
              </div>
              {error && (
                <div className="mb-5" style={{ background: 'var(--zx-error-muted)', border: '1px solid var(--zx-error-border)', borderRadius: 'var(--zx-radius-2)', padding: '10px 12px', fontSize: 'var(--zx-text-xs)', fontWeight: 500, color: 'var(--zx-error)' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" autoComplete="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={isLoading}
                    style={{ height: 38, background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', fontSize: 'var(--zx-text-sm)' }} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full" style={{ height: 40, fontSize: 'var(--zx-text-sm)', fontWeight: 600 }}>
                  {isLoading ? <><Loader2 className="animate-spin" size={14} /> Enviando...</> : <>Enviar Link <ArrowRight size={14} /></>}
                </Button>
              </form>
            </>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1" style={{ height: 1, background: 'var(--zx-border-2)' }} />
            <span style={{ fontSize: 'var(--zx-text-xs)', fontWeight: 500, color: 'var(--zx-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ou</span>
            <div className="flex-1" style={{ height: 1, background: 'var(--zx-border-2)' }} />
          </div>

          <div style={{ background: 'var(--zx-bg-2)', border: '1px solid var(--zx-border-2)', borderRadius: 'var(--zx-radius-2)', padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)' }}>
              Lembrou sua senha?{" "}
              <button type="button" onClick={() => onNavigate("login")} className="inline-flex items-center gap-1" style={{ fontWeight: 500, color: 'var(--zx-brand)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--zx-text-xs)' }}>
                <ArrowLeft size={12} />Voltar ao login
              </button>
            </p>
          </div>
        </div>
        <p className="mt-6 text-center" style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-4)' }}>Ambiente seguro e protegido</p>
      </div>
    </div>
  );
}
