import { useEffect, useState } from 'react'
import {
    CheckCircle2,
    CreditCard,
    Eye,
    RefreshCw,
    Search,
    Utensils,
    X,
    XCircle,
} from 'lucide-react'
import api from '../../../services/api'
import { ConfirmModal } from '../common/ConfirmModal'

interface DetallePedido {
    id: number
    productoId: number
    productoNombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
}

interface Pedido {
    id: number
    usuarioId: number
    usuarioNombre: string
    fecha: string
    total: number
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'PAGADO' | 'CANCELADO'
    observacion?: string
    detalles: DetallePedido[]
}

interface OrderManagerProps {
    isCreateOpen?: boolean
    onCloseCreate?: () => void
}

export function OrderManager({ isCreateOpen, onCloseCreate }: OrderManagerProps) {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [cargando, setCargando] = useState<boolean>(true)
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
    const [busqueda, setBusqueda] = useState<string>('')
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)
    const [cancelarPedidoId, setCancelarPedidoId] = useState<number | null>(null)
    const [isCanceling, setIsCanceling] = useState<boolean>(false)
    // Estados para crear pedido
    const [productosDisponibles, setProductosDisponibles] = useState<any[]>([])
    const [itemsPedido, setItemsPedido] = useState<{ productoId: number; cantidad: number }[]>([])
    const [observacion, setObservacion] = useState('')
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)


    const cargarPedidos = async () => {
        setCargando(true)
        try {
            const params = filtroEstado !== 'TODOS' ? { status: filtroEstado } : {}
            const res = await api.get<Pedido[]>('/orders', { params })
            setPedidos(res.data)
        } catch (err: any) {
            console.error('Error al cargar pedidos:', err)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarPedidos()
    }, [filtroEstado])

    useEffect(() => {
        if (isCreateOpen) {
            api.get('/products?available=true')
                .then(res => setProductosDisponibles(res.data))
                .catch(err => console.error('Error cargando productos:', err))
            setItemsPedido([])
            setObservacion('')
        }
    }, [isCreateOpen])
    const handleCrearPedido = async (e: React.FormEvent) => {
        e.preventDefault()
        if (itemsPedido.length === 0) {
            setMensaje({ texto: 'Debes agregar al menos un producto al pedido.', tipo: 'error' })
            return
        }
        setIsSubmittingOrder(true)
        try {
            await api.post('/orders', {
                observacion: observacion || 'Venta en mostrador',
                items: itemsPedido,
            })
            setMensaje({ texto: 'Pedido creado exitosamente.', tipo: 'exito' })
            if (onCloseCreate) onCloseCreate()
            await cargarPedidos()
        } catch (err: any) {
            setMensaje({
                texto: err.response?.data?.message || 'Error al crear el pedido.',
                tipo: 'error',
            })
        } finally {
            setIsSubmittingOrder(false)
        }
    }

    const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { estado: nuevoEstado })
            setMensaje({ texto: `Estado del pedido #${id} actualizado a ${nuevoEstado}`, tipo: 'exito' })
            cargarPedidos()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.message || 'Error al cambiar estado', tipo: 'error' })
        }
    }

    const handlePagar = async (id: number) => {
        try {
            await api.post(`/orders/${id}/pay`)
            setMensaje({ texto: `Pedido #${id} marcado como PAGADO`, tipo: 'exito' })
            cargarPedidos()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.message || 'Error al confirmar pago', tipo: 'error' })
        }
    }

    const confirmarCancelarPedido = async () => {
        if (!cancelarPedidoId) return
        setIsCanceling(true)
        try {
            await api.post(`/orders/${cancelarPedidoId}/cancel`)
            setMensaje({ texto: `Pedido #${cancelarPedidoId} cancelado y stock restablecido correctamente.`, tipo: 'exito' })
            setCancelarPedidoId(null)
            await cargarPedidos()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.message || 'Error al cancelar pedido', tipo: 'error' })
        } finally {
            setIsCanceling(false)
        }
    }

    const pedidosFiltrados = pedidos.filter((p) => {
        return (
            p.usuarioNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.id.toString().includes(busqueda)
        )
    })

    const badgeEstado = (estado: string) => {
        switch (estado) {
            case 'PAGADO':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'PENDIENTE':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            case 'EN_PROCESO':
                return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
            case 'LISTO':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'CANCELADO':
                return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            default:
                return 'bg-white/10 text-white/60 border-white/10'
        }
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
            {/* Cabecera del Módulo */}
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        Gestión Operativa
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Pedidos & Comandas
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Atención de comandas, cocina, barra y cobro en tiempo real
                    </p>
                </div>

                <button
                    type="button"
                    onClick={cargarPedidos}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#18181c] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
                >
                    <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
                    <span>Actualizar</span>
                </button>
            </div>

            {/* Mensajes flotantes de feedback */}
            {mensaje && (
                <div
                    className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${mensaje.tipo === 'exito'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                        }`}
                >
                    <span>{mensaje.texto}</span>
                    <button type="button" onClick={() => setMensaje(null)} className="p-1 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Filtros y Búsqueda */}
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {['TODOS', 'PENDIENTE', 'EN_PROCESO', 'LISTO', 'PAGADO', 'CANCELADO'].map((est) => (
                        <button
                            key={est}
                            type="button"
                            onClick={() => setFiltroEstado(est)}
                            className={[
                                'rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all',
                                filtroEstado === est
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-950/30'
                                    : 'border border-white/10 bg-[#18181c] text-white/60 hover:bg-white/10 hover:text-white',
                            ].join(' ')}
                        >
                            {est.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="relative min-w-[280px]">
                    <Search size={18} className="absolute left-4 top-3.5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o #ID..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#18181c] pl-11 pr-4 text-sm text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Tabla de Pedidos */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-[#18181c]/70 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/8 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/50">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha / Hora</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {cargando ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-sm font-medium text-white/40">
                                        Cargando comanda de pedidos...
                                    </td>
                                </tr>
                            ) : pedidosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-sm font-medium text-white/40">
                                        No se encontraron pedidos con el filtro actual.
                                    </td>
                                </tr>
                            ) : (
                                pedidosFiltrados.map((pedido) => (
                                    <tr key={pedido.id} className="transition-colors hover:bg-white/[0.02]">
                                        <td className="px-6 py-4 font-black text-amber-400">
                                            #{pedido.id}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {pedido.usuarioNombre}
                                        </td>
                                        <td className="px-6 py-4 text-white/50 text-xs">
                                            {new Date(pedido.fecha).toLocaleDateString()} •{' '}
                                            {new Date(pedido.fecha).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeEstado(
                                                    pedido.estado
                                                )}`}
                                            >
                                                {pedido.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-white">
                                            S/ {Number(pedido.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Ver Detalle */}
                                                <button
                                                    type="button"
                                                    onClick={() => setPedidoSeleccionado(pedido)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/70 transition hover:bg-white/10 hover:text-white"
                                                    title="Ver detalle del pedido"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Botón Pagar si no está pagado ni cancelado */}
                                                {pedido.estado !== 'PAGADO' && pedido.estado !== 'CANCELADO' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePagar(pedido.id)}
                                                        className="flex h-10 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3.5 text-xs font-extrabold text-emerald-400 transition hover:bg-emerald-500/30 active:scale-95"
                                                    >
                                                        <CreditCard size={14} />
                                                        <span>Cobrar</span>
                                                    </button>
                                                )}

                                                {/* Cambiar Estado a EN_PROCESO / LISTO */}
                                                {pedido.estado === 'PENDIENTE' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCambiarEstado(pedido.id, 'EN_PROCESO')}
                                                        className="flex h-10 items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/20 px-3.5 text-xs font-extrabold text-sky-400 transition hover:bg-sky-500/30 active:scale-95"
                                                    >
                                                        <Utensils size={14} />
                                                        <span>Preparar</span>
                                                    </button>
                                                )}
                                                {pedido.estado === 'EN_PROCESO' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCambiarEstado(pedido.id, 'LISTO')}
                                                        className="flex h-10 items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/20 px-3.5 text-xs font-extrabold text-purple-400 transition hover:bg-purple-500/30 active:scale-95"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        <span>Listo</span>
                                                    </button>
                                                )}

                                                {/* Cancelar */}
                                                {pedido.estado !== 'CANCELADO' && pedido.estado !== 'PAGADO' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCancelarPedidoId(pedido.id)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 active:scale-95"
                                                        title="Cancelar pedido y reponer stock"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalle de Pedido */}
            {pedidoSeleccionado && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                                    Comanda #{pedidoSeleccionado.id}
                                </span>
                                <h3 className="mt-1 text-xl font-black text-white">
                                    Detalle del Pedido
                                </h3>
                                <p className="mt-0.5 text-xs text-white/50">
                                    Cliente: <span className="font-bold text-white">{pedidoSeleccionado.usuarioNombre}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPedidoSeleccionado(null)}
                                aria-label="Cerrar"
                                className="rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Lista de Productos del Pedido */}
                        <div className="mt-6 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                            {pedidoSeleccionado.detalles?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#16161a] p-4 text-sm"
                                >
                                    <div>
                                        <p className="font-bold text-white">{item.productoNombre}</p>
                                        <p className="text-xs text-white/40">
                                            {item.cantidad} x S/ {Number(item.precioUnitario).toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="font-black text-amber-400">
                                        S/ {Number(item.subtotal).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {pedidoSeleccionado.observacion && (
                            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-medium text-amber-300">
                                <strong>Observación:</strong> {pedidoSeleccionado.observacion}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5">
                            <span className="text-sm font-bold text-white/60">Total a Pagar</span>
                            <span className="text-2xl font-black text-emerald-400">
                                S/ {Number(pedidoSeleccionado.total).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Personalizado */}
            <ConfirmModal
                isOpen={cancelarPedidoId !== null}
                title="Cancelar Pedido"
                message={`¿Estás seguro de cancelar el pedido #${cancelarPedidoId}? Se anulará la orden y se devolverá automáticamente el stock de los productos a la carta.`}
                confirmText="Sí, cancelar pedido"
                cancelText="Volver"
                variant="danger"
                isLoading={isCanceling}
                onConfirm={confirmarCancelarPedido}
                onCancel={() => setCancelarPedidoId(null)}
            />
            {/* Modal de Crear Pedido en Mostrador */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#121215] p-7 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-white">Nuevo Pedido en Mostrador</h3>
                                <p className="text-xs text-white/40">Selecciona los productos y cantidades para la venta</p>
                            </div>
                            <button
                                type="button"
                                onClick={onCloseCreate}
                                className="rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCrearPedido} className="mt-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                    Agregar Producto
                                </label>
                                <select
                                    onChange={(e) => {
                                        const prodId = Number(e.target.value)
                                        if (!prodId) return
                                        setItemsPedido(prev => {
                                            const existe = prev.find(item => item.productoId === prodId)
                                            if (existe) {
                                                return prev.map(item => item.productoId === prodId ? { ...item, cantidad: item.cantidad + 1 } : item)
                                            }
                                            return [...prev, { productoId: prodId, cantidad: 1 }]
                                        })
                                        e.target.value = ''
                                    }}
                                    className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#1c1c20] px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                                >
                                    <option value="">-- Seleccionar producto para agregar --</option>
                                    {productosDisponibles.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} (S/ {Number(p.precio).toFixed(2)}) - Stock: {p.stock}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                {itemsPedido.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-white/30 italic">
                                        No has seleccionado ningún producto aún.
                                    </p>
                                ) : (
                                    itemsPedido.map((item, idx) => {
                                        const prod = productosDisponibles.find(p => p.id === item.productoId)
                                        return (
                                            <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3">
                                                <div>
                                                    <p className="text-sm font-bold text-white">{prod?.nombre}</p>
                                                    <p className="text-xs text-amber-400">S/ {Number(prod?.precio || 0).toFixed(2)} c/u</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={prod?.stock || 99}
                                                        value={item.cantidad}
                                                        onChange={(e) => {
                                                            const val = Math.max(1, Number(e.target.value))
                                                            setItemsPedido(prev => prev.map((it, i) => i === idx ? { ...it, cantidad: val } : it))
                                                        }}
                                                        className="w-16 rounded-xl border border-white/10 bg-[#1c1c20] px-2 py-1 text-center text-sm font-bold text-white focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setItemsPedido(prev => prev.filter((_, i) => i !== idx))}
                                                        className="p-1 text-red-400 hover:text-red-300"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                                    Observación / Mesa
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. Mesa 4 o Para llevar"
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#1c1c20] px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-white/8 pt-5">
                                <button
                                    type="button"
                                    onClick={onCloseCreate}
                                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingOrder || itemsPedido.length === 0}
                                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/20 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-40"
                                >
                                    {isSubmittingOrder ? 'Guardando...' : 'Crear Pedido'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
