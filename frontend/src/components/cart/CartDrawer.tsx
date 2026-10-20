import { useState, type FormEvent } from 'react'
import {
    ShoppingBag,
    X,
    Trash2,
    Plus,
    Minus,
    Coffee,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import type { ApiError } from '../../types/auth'

export function CartDrawer() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const {
        items,
        isCartOpen,
        closeCart,
        updateCantidad,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrecio,
    } = useCart()

    const [observacion, setObservacion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successOrderNumber, setSuccessOrderNumber] = useState<number | null>(null)

    if (!isCartOpen) return null

    const handleConfirmOrder = async (e: FormEvent) => {
        e.preventDefault()
        setErrorMsg('')

        if (items.length === 0) {
            setErrorMsg('El carrito está vacío.')
            return
        }

        if (!isAuthenticated) {
            closeCart()
            navigate('/login?redirect=/menu')
            return
        }

        setIsSubmitting(true)
        try {
            const pedido = await orderService.create({
                observacion: observacion.trim() || 'Pedido desde Menú Web',
                items: items.map((it) => ({
                    productoId: it.product.id,
                    cantidad: it.cantidad,
                })),
            })

            // Éxito
            setSuccessOrderNumber(pedido.id)
            clearCart()
            setObservacion('')

            // Redirigir a mis pedidos después de una breve animación
            setTimeout(() => {
                setSuccessOrderNumber(null)
                closeCart()
                navigate('/mis-pedidos')
            }, 1800)
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setErrorMsg(err.response?.data?.message || 'Error al procesar el pedido. Verifica el stock.')
            } else {
                setErrorMsg('Ocurrió un error inesperado al registrar el pedido.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop con desenfoque */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={closeCart}
            />

            {/* Panel lateral deslizante */}
            <div className="relative z-[120] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#121215] text-white shadow-2xl">
                {/* Cabecera del Carrito */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Tu Pedido</h2>
                            <p className="text-xs text-white/50">
                                {totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={closeCart}
                        className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                        aria-label="Cerrar carrito"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Mensaje de Pedido Exitoso */}
                {successOrderNumber !== null ? (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={42} />
                        </div>
                        <h3 className="mt-5 text-2xl font-black text-white">¡Pedido Confirmado!</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Tu comanda <span className="font-bold text-amber-400">#{successOrderNumber}</span> ha sido enviada a barra y cocina.
                        </p>
                        <p className="mt-4 text-xs text-white/40">
                            Redirigiendo a <strong className="text-white">Mis Pedidos</strong> para que sigas el estado en vivo...
                        </p>
                    </div>
                ) : items.length === 0 ? (
                    /* Carrito Vacío */
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] text-white/20">
                            <ShoppingBag size={44} strokeWidth={1.2} />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-white">Tu comanda está vacía</h3>
                        <p className="mt-2 text-xs text-white/45 max-w-xs leading-relaxed">
                            Aún no has agregado ningún café, postre o bebida a tu pedido.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                closeCart()
                                navigate('/menu')
                            }}
                            className="mt-6 flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-extrabold text-black shadow-lg shadow-amber-950/40 transition hover:from-amber-400 hover:to-amber-500"
                        >
                            <span>Explorar el Menú</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                ) : (
                    /* Contenido con Productos */
                    <form onSubmit={handleConfirmOrder} className="flex flex-1 flex-col overflow-hidden">
                        {/* Error Banner si existe */}
                        {errorMsg && (
                            <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Lista de Items */}
                        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                            {items.map(({ product, cantidad }) => {
                                const esTopeStock = cantidad >= product.stock

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3.5 rounded-2xl border border-white/8 bg-[#18181c] p-3.5 transition hover:border-white/15"
                                    >
                                        {/* Imagen o Ícono */}
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/5">
                                            {product.imagenUrl ? (
                                                <img
                                                    src={product.imagenUrl}
                                                    alt={product.nombre}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Coffee size={22} className="text-amber-400/60" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-xs font-bold text-white">
                                                {product.nombre}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-white/40">
                                                S/ {product.precio.toFixed(2)} c/u
                                            </p>

                                            {esTopeStock && (
                                                <p className="mt-1 text-[10px] font-semibold text-amber-400">
                                                    Stock máx: {product.stock}
                                                </p>
                                            )}

                                            {/* Controles de cantidad */}
                                            <div className="mt-2 flex items-center gap-2.5">
                                                <div className="flex items-center rounded-xl border border-white/10 bg-[#121215]">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateCantidad(product.id, cantidad - 1)
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center text-white/60 hover:text-white"
                                                        title="Reducir cantidad"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-7 text-center text-xs font-bold text-white">
                                                        {cantidad}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateCantidad(product.id, cantidad + 1)
                                                        }
                                                        disabled={esTopeStock}
                                                        className="flex h-7 w-7 items-center justify-center text-white/60 hover:text-white disabled:opacity-20"
                                                        title="Aumentar cantidad"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                <span className="text-xs font-black text-amber-400">
                                                    S/ {(product.precio * cantidad).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Eliminar Item */}
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(product.id)}
                                            className="cursor-pointer p-2 text-white/30 transition hover:text-rose-400"
                                            title="Quitar del pedido"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Campo de Observaciones / Mesa */}
                        <div className="border-t border-white/8 px-6 pt-4 pb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                                Nota del Pedido / Mesa (Opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Mesa 3, Para llevar, Leche sin lactosa..."
                                maxLength={255}
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#18181c] px-3.5 text-xs text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
                            />
                        </div>

                        {/* Footer y Totales */}
                        <div className="border-t border-white/10 bg-[#16161a] p-6 space-y-4">
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-white/50">
                                    <span>Subtotal</span>
                                    <span>S/ {totalPrecio.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>Servicio / Atención</span>
                                    <span className="text-emerald-400 font-semibold">Gratis</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/8 text-sm font-bold text-white">
                                    <span>Total a pagar</span>
                                    <span className="text-lg font-black text-amber-400">
                                        S/ {totalPrecio.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Botón de Acción */}
                            {isAuthenticated ? (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || items.length === 0}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-extrabold text-black shadow-lg shadow-amber-950/40 transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-40"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Enviando comanda a barra...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirmar Pedido (S/ {totalPrecio.toFixed(2)})</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-center text-xs text-amber-300/80">
                                        Inicia sesión para guardar el pedido en tu cuenta
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeCart()
                                            navigate('/login?redirect=/menu')
                                        }}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-extrabold text-black shadow-lg shadow-amber-950/40 transition hover:from-amber-400 hover:to-amber-500"
                                    >
                                        <span>Iniciar Sesión para Pedir</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
