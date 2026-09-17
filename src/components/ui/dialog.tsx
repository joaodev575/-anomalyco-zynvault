import { cn } from 'cn'

function Dialog({ ...props }: any) { return <div {...props} /> }

function DialogOverlay({ className, ...props }: any) {
  return <div className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]", className)} {...props} />
}

function DialogContent({ className, ...props }: any) {
  return <div className={cn("relative w-full max-w-[440px] mx-4 rounded-[var(--zx-radius-4)] bg-[var(--zx-bg-2)] border border-[var(--zx-border-3)] p-5 shadow-[var(--zx-shadow-4)]", className)} {...props} />
}

function DialogHeader({ className, ...props }: any) {
  return <div className={cn("flex items-center gap-2 mb-3", className)} {...props} />
}

function DialogTitle({ className, ...props }: any) {
  return <h3 className={cn("text-[var(--zx-text-md)] font-semibold text-[var(--zx-text-1)]", className)} {...props} />
}

function DialogDescription({ className, ...props }: any) {
  return <p className={cn("text-[var(--zx-text-xs)] text-[var(--zx-text-3)] mb-3", className)} {...props} />
}

function DialogActions({ className, ...props }: any) {
  return <div className={cn("mt-4 flex gap-2", className)} {...props} />
}

function DialogCancelButton({ className, onClick, ...props }: any) {
  return (
    <button
      onClick={onClick}
      className={cn("flex-1 h-[34px] rounded-[var(--zx-radius-2)] border border-[var(--zx-border-3)] bg-[var(--zx-bg-1)] text-[var(--zx-text-sm)] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-3)] hover:text-[var(--zx-text-1)] transition-all", className)}
      {...props}
    />
  )
}

function DialogConfirmButton({ className, onClick, ...props }: any) {
  return (
    <button
      onClick={onClick}
      className={cn("flex-1 h-[34px] rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] text-[var(--zx-text-sm)] font-semibold text-white hover:bg-[var(--zx-brand-hover)] transition-all shadow-[var(--zx-shadow-1)]", className)}
      {...props}
    />
  )
}

export { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogActions, DialogCancelButton, DialogConfirmButton }
