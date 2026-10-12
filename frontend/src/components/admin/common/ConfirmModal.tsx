import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
} from 'lucide-react'

export interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    variant?: 'danger' | 'warning' | 'info' | 'success'
    onConfirm: () => void
    onCancel?: () => void
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    showCancel = true,
    variant = 'danger',
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            onConfirm()
        }
    }

    const variantStyles = {
        danger: {
            badge: 'Peligro / Acción destructiva',
            iconContainer: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
            button: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-rose-950/40',
        },
        warning: {
            badge: 'Atención requerida',
            iconContainer: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
            button: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-amber-950/40',
        },
        info: {
            badge: 'Información del sistema',
            iconContainer: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
            button: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-sky-950/40',
        },
        success: {
            badge: 'Operación exitosa',
            iconContainer: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            button: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-950/40',
        },
    }

    const currentVariant = variantStyles[variant]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur-md">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                {showCancel && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="absolute right-6 top-6 rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 transition hover:text-white disabled:opacity-50"
                        aria-label="Cerrar modal"
                    >
                        <X size={16} />
                    </button>
                )}

                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${currentVariant.iconContainer}`}
                    >
                        {variant === 'danger' && <AlertTriangle size={28} />}
                        {variant === 'warning' && <AlertTriangle size={28} />}
                        {variant === 'info' && <Info size={28} />}
                        {variant === 'success' && <CheckCircle2 size={28} />}
                    </div>
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                            {currentVariant.badge}
                        </span>
                        <h3 className="text-xl font-black text-white">{title}</h3>
                    </div>
                </div>

                <p className="mt-4 text-sm font-medium leading-relaxed text-white/70">
                    {message}
                </p>

                <div className="mt-7 flex items-center gap-3">
                    {showCancel && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="h-12 flex-1 rounded-2xl border border-white/10 bg-[#16161a] text-sm font-bold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`h-12 flex-1 rounded-2xl text-sm font-extrabold shadow-lg transition active:scale-95 disabled:opacity-50 ${currentVariant.button}`}
                    >
                        {isLoading ? 'Procesando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
