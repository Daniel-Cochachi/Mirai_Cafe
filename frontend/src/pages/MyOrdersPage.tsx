import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Clock,
    Utensils,
    CheckCircle2,
    Check,
    XCircle,
    ShoppingBag,
    RefreshCw,
    X,
    AlertCircle,
    ArrowRight,
    Ban,
} from 'lucide-react'
import axios from 'axios'

import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/footer'
import { ConfirmModal } from '../components/admin/common/ConfirmModal'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import type { PedidoResponse, EstadoPedido } from '../types/order'
import type { ApiError } from '../types/auth'

type FilterTab = 'TODOS' | 'ACTIVOS' | 'PAGADO' | 'CANCELADO'

export function MyOrdersPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [orders, setOrders] = useState<PedidoResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<FilterTab>('TODOS')

    // Cancelar Pedido state
    const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null)
    const [isCanceling, setIsCanceling] = useState(false)
    const [toastMessage, setToastMessage] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

    // Auth Guard
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/mis-pedidos', { replace: true })
        }
    }, [isAuthenticated, navigate])

    // Auto-dismiss toast
    useEffect(() => {
        if (!toastMessage) return
        const timer = setTimeout(() => setToastMessage(null), 4000)
        return () => clearTimeout(timer)
    }, [toastMessage])

    const fetchOrders = async () => {
        setIsLoading(true)
        setError('')
        try {
            const data = await orderService.getMyOrders()
            // Ordenar por fecha descendente (los más recientes primero)
            const ordenados = [...data].sort(
                (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            )
            setOrders(ordenados)
        } catch (err) {
            let msg = 'No fue posible cargar tu historial de pedidos. Intenta nuevamente.'
            if (axios.isAxiosError<ApiError>(err)) {
                msg = err.response?.data?.message || msg
            }
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders()
        }
    }, [isAuthenticated])

    // Actualización en vivo (Polling silencioso cada 6s si hay pedidos en preparación o listos)
    useEffect(() => {
        if (!isAuthenticated) return

        const hayActivos = orders.some(
            (o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO' || o.estado === 'LISTO'
        )
        if (!hayActivos) return

        const timer = setInterval(async () => {
            try {
                const data = await orderService.getMyOrders()
                const ordenados = [...data].sort(
                    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                )
                setOrders(ordenados)
            } catch {
                // No interrumpir la vista del cliente si falla un intento en segundo plano
            }
        }, 6000)

        return () => clearInterval(timer)
    }, [isAuthenticated, orders])

    // Filtrar pedidos según pestaña
    const filteredOrders = useMemo(() => {
        if (activeTab === 'TODOS') return orders
        if (activeTab === 'ACTIVOS') {
            return orders.filter(
                (o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO' || o.estado === 'LISTO'
            )
        }
        return orders.filter((o) => o.estado === activeTab)
    }, [orders, activeTab])

    const handleConfirmCancel = async () => {
        if (!cancelingOrderId) return
        setIsCanceling(true)
        try {
            await orderService.cancel(cancelingOrderId)
            setToastMessage({
                tipo: 'success',
                texto: `El pedido #${cancelingOrderId} fue cancelado exitosamente.`,
            })
            setCancelingOrderId(null)
            await fetchOrders()
        } catch (err) {
            let msg = 'No se pudo cancelar el pedido.'
            if (axios.isAxiosError<ApiError>(err)) {
                msg = err.response?.data?.message || msg
            }
            setToastMessage({ tipo: 'error', texto: msg })
        } finally {
            setIsCanceling(false)
        }
    }

    const badgeConfig = (estado: EstadoPedido) => {
        switch (estado) {
            case 'PENDIENTE':
                return {
                    label: 'En Espera',
                    classes: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                    icon: Clock,
                }
            case 'EN_PROCESO':
                return {
                    label: 'En Preparación',
                    classes: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
                    icon: Utensils,
                }
            case 'LISTO':
                return {
                    label: '¡Listo para Recoger!',
                    classes: 'border-purple-500/30 bg-purple-500/10 text-purple-300 font-black animate-pulse',
                    icon: CheckCircle2,
                }
            case 'PAGADO':
                return {
                    label: 'Entregado & Pagado',
                    classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                    icon: Check,
                }
            case 'CANCELADO':
                return {
                    label: 'Cancelado',
                    classes: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
                    icon: XCircle,
                }
        }
    }

    const getProgressStep = (estado: EstadoPedido): number => {
        switch (estado) {
            case 'PENDIENTE':
                return 1
            case 'EN_PROCESO':
                return 2
            case 'LISTO':
                return 3
            case 'PAGADO':
                return 4
            case 'CANCELADO':
                return 0
        }
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-32 text-white sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-5xl">
                    {/* Encabezado */}
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
                                Experiencia Mirai Café
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                Mis Pedidos
                            </h1>
                            <p className="mt-1.5 text-sm text-white/50">
                                Consulta el estado en tiempo real de tus comandas de cafetería
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={fetchOrders}
                                disabled={isLoading}
                                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-[#16161a] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                <span>Actualizar</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/menu')}
                                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-950/40 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                            >
                                <ShoppingBag size={15} />
                                <span>Nuevo Pedido</span>
                            </button>
                        </div>
                    </div>

                    {/* Filtros de Pestaña */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {[
                            { id: 'TODOS', label: 'Todos' },
                            { id: 'ACTIVOS', label: 'En Curso / Barra' },
                            { id: 'PAGADO', label: 'Completados' },
                            { id: 'CANCELADO', label: 'Cancelados' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as FilterTab)}
                                className={`cursor-pointer rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                        : 'border border-white/10 bg-[#141418] text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Alerta de Error */}
                    {error && (
                        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-8 space-y-4">
                            {[1, 2, 3].map((n) => (
                                <div
                                    key={n}
                                    className="h-44 w-full animate-pulse rounded-3xl border border-white/5 bg-white/[0.02]"
                                />
                            ))}
                        </div>
                    )}

                    {/* Listado de Pedidos */}
                    {!isLoading && !error && filteredOrders.length === 0 ? (
                        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#121215] p-12 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/30">
                                <ShoppingBag size={38} strokeWidth={1.3} />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-white">
                                {activeTab === 'TODOS'
                                    ? 'No tienes pedidos registrados'
                                    : 'No hay pedidos con este filtro'}
                            </h3>
                            <p className="mt-2 text-xs text-white/40 max-w-sm leading-relaxed">
                                Explora nuestra carta de cafés especiales, bebidas artesanales y postres recién horneados.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/menu')}
                                className="mt-6 flex cursor-pointer items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-extrabold text-black shadow-lg shadow-amber-950/40 transition hover:bg-amber-400"
                            >
                                <span>Ir a la Carta</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8 space-y-5">
                            {filteredOrders.map((pedido) => {
                                const badge = badgeConfig(pedido.estado)
                                const BadgeIcon = badge.icon
                                const currentStep = getProgressStep(pedido.estado)
                                const esCancelable = pedido.estado === 'PENDIENTE'

                                return (
                                    <div
                                        key={pedido.id}
                                        className="rounded-3xl border border-white/10 bg-[#141418] p-6 sm:p-7 shadow-xl transition hover:border-white/20"
                                    >
                                        {/* Cabecera de la Tarjeta */}
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-amber-400">
                                                        Pedido #{pedido.id}
                                                    </span>
                                                    <span
                                                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.classes}`}
                                                    >
                                                        <BadgeIcon size={12} />
                                                        <span>{badge.label}</span>
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-white/40">
                                                    {new Date(pedido.fecha).toLocaleDateString('es-PE', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}{' '}
                                                    •{' '}
                                                    {new Date(pedido.fecha).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <div className="text-right">
                                                    <span className="text-[11px] uppercase tracking-wider text-white/40">
                                                        Total
                                                    </span>
                                                    <p className="text-xl font-black text-white">
                                                        S/ {Number(pedido.total).toFixed(2)}
                                                    </p>
                                                </div>

                                                {esCancelable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCancelingOrderId(pedido.id)}
                                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 active:scale-95"
                                                        title="Anular pedido antes de preparación"
                                                    >
                                                        <Ban size={14} />
                                                        <span>Cancelar</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tracker de Estados (Solo si no está cancelado) */}
                                        {pedido.estado !== 'CANCELADO' && (
                                            <div className="mt-5 border-b border-white/8 pb-5">
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    {[
                                                        { step: 1, title: 'Comanda Recibida' },
                                                        { step: 2, title: 'En Barra / Cocina' },
                                                        { step: 3, title: 'Listo para Entrega' },
                                                        { step: 4, title: 'Completado' },
                                                    ].map((st) => {
                                                        const completado = currentStep >= st.step
                                                        const activo = currentStep === st.step

                                                        return (
                                                            <div key={st.step} className="flex flex-col items-center">
                                                                <div
                                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                                                                        completado
                                                                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 ring-2 ring-amber-500/50'
                                                                            : 'bg-white/5 text-white/30 border border-white/10'
                                                                    }`}
                                                                >
                                                                    {st.step}
                                                                </div>
                                                                <span
                                                                    className={`mt-2 text-[11px] font-bold ${
                                                                        activo
                                                                            ? 'text-amber-400'
                                                                            : completado
                                                                            ? 'text-white/80'
                                                                            : 'text-white/30'
                                                                    }`}
                                                                >
                                                                    {st.title}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Detalle de Productos */}
                                        <div className="mt-4 space-y-2">
                                            {pedido.detalles?.map((det) => (
                                                <div
                                                    key={det.id}
                                                    className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3.5 py-2 text-xs"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-amber-400">
                                                            {det.cantidad}x
                                                        </span>
                                                        <span className="font-medium text-white/90">
                                                            {det.productoNombre}
                                                        </span>
                                                        <span className="text-[11px] text-white/40">
                                                            (S/ {Number(det.precioUnitario).toFixed(2)} c/u)
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-white">
                                                        S/ {Number(det.subtotal).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Nota / Observación */}
                                        {pedido.observacion && (
                                            <div className="mt-3.5 rounded-xl border border-white/5 bg-black/20 p-3 text-xs text-white/60">
                                                <strong className="text-amber-400 font-semibold">Nota: </strong>
                                                <span>{pedido.observacion}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Cancelación */}
            <ConfirmModal
                isOpen={cancelingOrderId !== null}
                title="Cancelar Pedido"
                message={`¿Estás seguro de cancelar tu comanda #${cancelingOrderId}? El pedido se cancelará y los productos volverán al stock de cafetería.`}
                confirmText="Sí, cancelar pedido"
                cancelText="No, mantener pedido"
                variant="danger"
                isLoading={isCanceling}
                onConfirm={handleConfirmCancel}
                onCancel={() => setCancelingOrderId(null)}
            />

            {/* Toast Flotante */}
            {toastMessage && (
                <div
                    role="alert"
                    className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 ${
                        toastMessage.tipo === 'success'
                            ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
                            : 'border-rose-500/30 bg-rose-950/80 text-rose-200'
                    }`}
                >
                    {toastMessage.tipo === 'success' ? (
                        <Check size={16} className="text-emerald-400" />
                    ) : (
                        <X size={16} className="text-rose-400" />
                    )}
                    <span className="text-sm font-medium">{toastMessage.texto}</span>
                    <button
                        onClick={() => setToastMessage(null)}
                        className="ml-2 cursor-pointer text-white/40 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <Footer />
        </>
    )
}
