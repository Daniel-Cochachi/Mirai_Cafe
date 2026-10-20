import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Plus,
    Printer,
    RefreshCw,
    Search,
    ShoppingBag,
    Trash2,
    Utensils,
    X,
    XCircle,
} from 'lucide-react'
import axios from 'axios'
import { orderService } from '../../../services/orderService'
import { productService } from '../../../services/productService'
import type { ApiError } from '../../../types/auth'
import type {
    EstadoPedido,
    OrderFilters,
    PedidoResponse,
} from '../../../types/order'
import type { Product } from '../../../types/product'
import { ConfirmModal } from '../common/ConfirmModal'

interface OrderManagerProps {
    isCreateOpen?: boolean
    onCloseCreate?: () => void
}

interface ItemCarritoPOS {
    producto: Product
    cantidad: number
}

interface ToastNotification {
    tipo: 'exito' | 'error' | 'advertencia'
    mensaje: string
}

export function OrderManager({ isCreateOpen, onCloseCreate }: OrderManagerProps) {
    const [pedidos, setPedidos] = useState<PedidoResponse[]>([])
    const [cargando, setCargando] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    // Filtros
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
    const [filtroFecha, setFiltroFecha] = useState<'todos' | 'hoy' | 'semana'>('todos')
    const [busqueda, setBusqueda] = useState<string>('')

    // Modales y Detalles
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoResponse | null>(null)
    const [cancelarPedidoId, setCancelarPedidoId] = useState<number | null>(null)
    const [isCanceling, setIsCanceling] = useState<boolean>(false)

    // Estados para POS de Venta en Mostrador
    const [localCreateOpen, setLocalCreateOpen] = useState(false)
    const [productosDisponibles, setProductosDisponibles] = useState<Product[]>([])
    const [itemsCarrito, setItemsCarrito] = useState<ItemCarritoPOS[]>([])
    const [observacion, setObservacion] = useState('')
    const [posSearch, setPosSearch] = useState('')
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
    const [posError, setPosError] = useState('')

    // Toast flotante
    const [toast, setToast] = useState<ToastNotification | null>(null)

    const modalCrearActivo = Boolean(isCreateOpen || localCreateOpen)
    const cerrarModalCrear = () => {
        if (onCloseCreate) onCloseCreate()
        setLocalCreateOpen(false)
        setItemsCarrito([])
        setObservacion('')
        setPosError('')
        setPosSearch('')
    }

    // Auto-dismiss del toast
    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => setToast(null), 4500)
        return () => clearTimeout(timer)
    }, [toast])

    // Calcular fechas para filtros
    const getFilterParams = (): OrderFilters => {
        const filters: OrderFilters = {}
        if (filtroEstado !== 'TODOS') {
            filters.status = filtroEstado as EstadoPedido
        }

        const now = new Date()
        if (filtroFecha === 'hoy') {
            const hoyStr = now.toISOString().split('T')[0]
            filters.from = hoyStr
            filters.to = hoyStr
        } else if (filtroFecha === 'semana') {
            const haceUnaSemana = new Date(now)
            haceUnaSemana.setDate(now.getDate() - 7)
            filters.from = haceUnaSemana.toISOString().split('T')[0]
            filters.to = now.toISOString().split('T')[0]
        }

        return filters
    }

    // Cargar Pedidos
    const cargarPedidos = async () => {
        setCargando(true)
        setError('')
        try {
            const data = await orderService.getAll(getFilterParams())
            setPedidos(data)
        } catch {
            setError('No fue posible cargar el listado de pedidos.')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarPedidos()
    }, [filtroEstado, filtroFecha])

    // Cargar productos para el modal POS cuando se abre
    useEffect(() => {
        if (modalCrearActivo) {
            productService
                .getAll({ available: true })
                .then((data) => setProductosDisponibles(data))
                .catch(() => setPosError('Error al cargar la carta de productos.'))
            setItemsCarrito([])
            setObservacion('')
            setPosSearch('')
            setPosError('')
        }
    }, [modalCrearActivo])

    // Métricas y KPIs de Auditoría
    const kpis = useMemo(() => {
        let totalVentasRecaudadas = 0
        let enPreparacion = 0
        let listos = 0
        let cancelados = 0

        pedidos.forEach((p) => {
            if (p.estado === 'PAGADO') totalVentasRecaudadas += Number(p.total)
            if (p.estado === 'PENDIENTE' || p.estado === 'EN_PROCESO') enPreparacion++
            if (p.estado === 'LISTO') listos++
            if (p.estado === 'CANCELADO') cancelados++
        })

        return {
            totalVentasRecaudadas,
            enPreparacion,
            listos,
            cancelados,
        }
    }, [pedidos])

    // Filtrado por texto (Búsqueda en cliente o ID)
    const pedidosFiltrados = useMemo(() => {
        const query = busqueda.trim().toLowerCase()
        if (!query) return pedidos

        return pedidos.filter((p) => {
            const matchNombre = p.usuarioNombre?.toLowerCase().includes(query)
            const matchId = p.id.toString().includes(query)
            const matchObservacion = (p.observacion ?? '').toLowerCase().includes(query)
            return matchNombre || matchId || matchObservacion
        })
    }, [pedidos, busqueda])

    // Acciones operativas de estado
    const handleCambiarEstado = async (id: number, nuevoEstado: EstadoPedido) => {
        try {
            await orderService.updateStatus(id, nuevoEstado)
            setToast({
                tipo: 'exito',
                mensaje: `Comanda #${id} actualizada a "${nuevoEstado.replace('_', ' ')}".`,
            })
            cargarPedidos()
        } catch (err) {
            const mensajeError = axios.isAxiosError<ApiError>(err)
                ? err.response?.data?.message || 'Error al actualizar comanda.'
                : 'Error inesperado.'
            setToast({ tipo: 'error', mensaje: mensajeError })
        }
    }

    const handlePagar = async (id: number) => {
        try {
            await orderService.pay(id)
            setToast({
                tipo: 'exito',
                mensaje: `Pedido #${id} marcado como PAGADO exitosamente.`,
            })
            cargarPedidos()
        } catch (err) {
            const mensajeError = axios.isAxiosError<ApiError>(err)
                ? err.response?.data?.message || 'Error al registrar pago.'
                : 'Error inesperado.'
            setToast({ tipo: 'error', mensaje: mensajeError })
        }
    }

    const confirmarCancelarPedido = async () => {
        if (!cancelarPedidoId) return
        setIsCanceling(true)
        try {
            await orderService.cancel(cancelarPedidoId)
            setToast({
                tipo: 'exito',
                mensaje: `Pedido #${cancelarPedidoId} cancelado. El stock fue repuesto a la carta.`,
            })
            setCancelarPedidoId(null)
            await cargarPedidos()
        } catch (err) {
            const mensajeError = axios.isAxiosError<ApiError>(err)
                ? err.response?.data?.message || 'No fue posible anular el pedido.'
                : 'Error inesperado.'
            setToast({ tipo: 'error', mensaje: mensajeError })
            setCancelarPedidoId(null)
        } finally {
            setIsCanceling(false)
        }
    }

    // Funciones del POS Mostrador
    const agregarAlCarrito = (producto: Product) => {
        setPosError('')
        const itemExistente = itemsCarrito.find((item) => item.producto.id === producto.id)

        if (itemExistente) {
            if (itemExistente.cantidad >= producto.stock) {
                setPosError(`Stock máximo disponible para ${producto.nombre}: ${producto.stock} unidades.`)
                return
            }
            setItemsCarrito((prev) =>
                prev.map((it) =>
                    it.producto.id === producto.id ? { ...it, cantidad: it.cantidad + 1 } : it
                )
            )
        } else {
            if (producto.stock < 1) {
                setPosError(`El producto ${producto.nombre} no tiene stock disponible.`)
                return
            }
            setItemsCarrito((prev) => [...prev, { producto, cantidad: 1 }])
        }
    }

    const actualizarCantidadCarrito = (productoId: number, nuevaCantidad: number) => {
        const prod = productosDisponibles.find((p) => p.id === productoId)
        if (!prod) return

        if (nuevaCantidad > prod.stock) {
            setPosError(`Stock máximo para ${prod.nombre} es ${prod.stock}.`)
            return
        }

        if (nuevaCantidad <= 0) {
            setItemsCarrito((prev) => prev.filter((it) => it.producto.id !== productoId))
            return
        }

        setPosError('')
        setItemsCarrito((prev) =>
            prev.map((it) => (it.producto.id === productoId ? { ...it, cantidad: nuevaCantidad } : it))
        )
    }

    const totalCarritoPOS = itemsCarrito.reduce(
        (acc, item) => acc + item.producto.precio * item.cantidad,
        0
    )

    const handleCrearPedido = async (e: FormEvent) => {
        e.preventDefault()
        setPosError('')

        if (itemsCarrito.length === 0) {
            setPosError('Debes agregar al menos un producto a la comanda.')
            return
        }

        setIsSubmittingOrder(true)
        try {
            await orderService.create({
                observacion: observacion.trim() || 'Venta en mostrador / Barra',
                items: itemsCarrito.map((it) => ({
                    productoId: it.producto.id,
                    cantidad: it.cantidad,
                })),
            })

            setToast({
                tipo: 'exito',
                mensaje: 'Pedido creado exitosamente y stock descontado.',
            })
            cerrarModalCrear()
            await cargarPedidos()
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setPosError(err.response?.data?.message || 'Error al procesar el pedido.')
            } else {
                setPosError('Ocurrió un error inesperado al procesar la comanda.')
            }
        } finally {
            setIsSubmittingOrder(false)
        }
    }

    const badgeEstado = (estado: EstadoPedido) => {
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
        <div className="space-y-7">
            {/* 1. KPIs de Auditoría y Ventas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Ingresos Cobrados
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-emerald-400">
                        S/ {kpis.totalVentasRecaudadas.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-white/40">Total recaudado de pedidos pagados</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Comandas en Curso
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
                            <Clock size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-sky-400">{kpis.enPreparacion}</p>
                    <p className="mt-1 text-xs text-white/40">Pendientes y en preparación</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Listos en Barra
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-purple-400">{kpis.listos}</p>
                    <p className="mt-1 text-xs text-white/40">Esperando entrega / cobro</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Anulados / Cancelados
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                            <XCircle size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-rose-400">{kpis.cancelados}</p>
                    <p className="mt-1 text-xs text-white/40">Con devolución de stock</p>
                </div>
            </div>

            {/* 2. Panel Principal */}
            <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
                {/* Cabecera del Módulo */}
                <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                            Control Operativo & Caja
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                            Pedidos & Ventas
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                            Atención de comandas en cocina, barra y registro de caja
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setLocalCreateOpen(true)}
                            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Venta en Mostrador</span>
                        </button>

                        <button
                            type="button"
                            onClick={cargarPedidos}
                            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
                            title="Actualizar comanda"
                        >
                            <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* 3. Barra de Filtros y Rango de Fechas */}
                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Filtros de Estado */}
                    <div className="flex flex-wrap items-center gap-2">
                        {['TODOS', 'PENDIENTE', 'EN_PROCESO', 'LISTO', 'PAGADO', 'CANCELADO'].map((est) => (
                            <button
                                key={est}
                                type="button"
                                onClick={() => setFiltroEstado(est)}
                                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${filtroEstado === est
                                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                        : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                {est.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Filtro Rápido de Fechas */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-white/10 bg-[#16161a] p-1 text-xs font-bold text-white/60">
                            <span className="flex items-center gap-1.5 px-2 text-white/40">
                                <Calendar size={14} /> Fecha:
                            </span>
                            <button
                                onClick={() => setFiltroFecha('todos')}
                                className={`rounded-lg px-2.5 py-1 transition ${filtroFecha === 'todos' ? 'bg-white/15 text-white' : 'hover:text-white'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltroFecha('hoy')}
                                className={`rounded-lg px-2.5 py-1 transition ${filtroFecha === 'hoy' ? 'bg-white/15 text-white' : 'hover:text-white'
                                    }`}
                            >
                                Hoy
                            </button>
                            <button
                                onClick={() => setFiltroFecha('semana')}
                                className={`rounded-lg px-2.5 py-1 transition ${filtroFecha === 'semana' ? 'bg-white/15 text-white' : 'hover:text-white'
                                    }`}
                            >
                                7 días
                            </button>
                        </div>

                        {/* Buscador de pedidos */}
                        <div className="relative min-w-[240px]">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente o #ID..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/10 bg-[#16161a] pl-10 pr-3 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Banner si la carga falla */}
                {error && (
                    <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* 4. Tabla de Pedidos */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-[#18181c]/70 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/8 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/50">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Cliente / Usuario</th>
                                    <th className="px-6 py-4">Fecha y Hora</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4 text-right">Acciones Operativas</th>
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
                                            No se encontraron pedidos con los filtros seleccionados.
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
                                            <td className="px-6 py-4 text-xs text-white/50">
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
                                                    {/* Ver Detalle / Ticket */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPedidoSeleccionado(pedido)}
                                                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/70 transition hover:bg-white/10 hover:text-white"
                                                        title="Ver comanda y ticket"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {/* Botón Cobrar si no está pagado ni cancelado */}
                                                    {pedido.estado !== 'PAGADO' && pedido.estado !== 'CANCELADO' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePagar(pedido.id)}
                                                            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3.5 text-xs font-extrabold text-emerald-400 transition hover:bg-emerald-500/30 active:scale-95"
                                                        >
                                                            <CreditCard size={14} />
                                                            <span>Cobrar</span>
                                                        </button>
                                                    )}

                                                    {/* Transición de Comanda */}
                                                    {pedido.estado === 'PENDIENTE' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCambiarEstado(pedido.id, 'EN_PROCESO')}
                                                            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/20 px-3.5 text-xs font-extrabold text-sky-400 transition hover:bg-sky-500/30 active:scale-95"
                                                        >
                                                            <Utensils size={14} />
                                                            <span>Preparar</span>
                                                        </button>
                                                    )}
                                                    {pedido.estado === 'EN_PROCESO' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCambiarEstado(pedido.id, 'LISTO')}
                                                            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/20 px-3.5 text-xs font-extrabold text-purple-400 transition hover:bg-purple-500/30 active:scale-95"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            <span>Listo</span>
                                                        </button>
                                                    )}

                                                    {/* Cancelar (con devolución de stock) */}
                                                    {pedido.estado !== 'CANCELADO' && pedido.estado !== 'PAGADO' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setCancelarPedidoId(pedido.id)}
                                                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 active:scale-95"
                                                            title="Anular pedido y restituir stock"
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
            </div>

            {/* 5. Modal Detalle y Ticket Térmico Imprimible */}
            {pedidoSeleccionado && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur-md">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                                    Ticket Comanda #{pedidoSeleccionado.id}
                                </span>
                                <h3 className="mt-1 text-xl font-black text-white">Detalle de Venta</h3>
                                <p className="mt-0.5 text-xs text-white/50">
                                    Cliente: <span className="font-bold text-white">{pedidoSeleccionado.usuarioNombre}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPedidoSeleccionado(null)}
                                className="cursor-pointer rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Lista de Productos */}
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
                            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-medium text-amber-300">
                                <strong>Nota:</strong> {pedidoSeleccionado.observacion}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-white/40">Total</span>
                                <p className="text-2xl font-black text-emerald-400">
                                    S/ {Number(pedidoSeleccionado.total).toFixed(2)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                            >
                                <Printer size={15} />
                                <span>Imprimir Comanda</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Modal POS de Venta en Mostrador Blindado */}
            {modalCrearActivo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#121215] p-7 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-white">Venta en Mostrador (Caja POS)</h3>
                                <p className="text-xs text-white/40">
                                    Elige los productos; el stock se descontará en tiempo real.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={cerrarModalCrear}
                                className="cursor-pointer rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {posError && (
                            <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-semibold text-red-300">
                                {posError}
                            </div>
                        )}

                        <form onSubmit={handleCrearPedido} className="mt-5 space-y-5">
                            {/* Selector / Buscador de Producto */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                    Agregar Producto a la Venta
                                </label>
                                <div className="mt-1.5 flex gap-2">
                                    <div className="relative flex-1">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="Filtrar producto por nombre..."
                                            value={posSearch}
                                            onChange={(e) => setPosSearch(e.target.value)}
                                            className="h-11 w-full rounded-2xl border border-white/10 bg-[#1c1c20] pl-10 pr-4 text-xs text-white focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>
                                    <select
                                        onChange={(e) => {
                                            const prodId = Number(e.target.value)
                                            if (!prodId) return
                                            const prod = productosDisponibles.find((p) => p.id === prodId)
                                            if (prod) agregarAlCarrito(prod)
                                            e.target.value = ''
                                        }}
                                        className="h-11 max-w-[260px] cursor-pointer rounded-2xl border border-white/10 bg-[#1c1c20] px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {productosDisponibles
                                            .filter((p) =>
                                                !posSearch || p.nombre.toLowerCase().includes(posSearch.toLowerCase())
                                            )
                                            .map((p) => (
                                                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                                                    {p.nombre} (S/ {p.precio.toFixed(2)}) - Stock: {p.stock}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Resumen del Carrito en Mostrador */}
                            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                {itemsCarrito.length === 0 ? (
                                    <div className="py-8 text-center text-xs italic text-white/30">
                                        <ShoppingBag size={24} className="mx-auto mb-2 opacity-30" />
                                        No has agregado ningún producto aún a la orden.
                                    </div>
                                ) : (
                                    itemsCarrito.map((item) => (
                                        <div
                                            key={item.producto.id}
                                            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3.5"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.producto.nombre}</p>
                                                <p className="text-xs text-amber-400">
                                                    S/ {item.producto.precio.toFixed(2)} c/u • Subtotal:{' '}
                                                    <span className="font-bold text-white">
                                                        S/ {(item.producto.precio * item.cantidad).toFixed(2)}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center rounded-xl border border-white/10 bg-[#1c1c20]">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            actualizarCantidadCarrito(item.producto.id, item.cantidad - 1)
                                                        }
                                                        className="px-2.5 py-1 text-sm font-bold text-white/60 hover:text-white"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-white">
                                                        {item.cantidad}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            actualizarCantidadCarrito(item.producto.id, item.cantidad + 1)
                                                        }
                                                        className="px-2.5 py-1 text-sm font-bold text-white/60 hover:text-white"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        actualizarCantidadCarrito(item.producto.id, 0)
                                                    }
                                                    className="cursor-pointer p-1.5 text-rose-400 hover:text-rose-300"
                                                    title="Quitar producto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Nota / Mesa */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                                    Observación / Mesa o Para Llevar
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. Mesa 4, Para llevar, Sin azúcar..."
                                    value={observacion}
                                    maxLength={255}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    className="mt-1.5 h-11 w-full rounded-2xl border border-white/10 bg-[#1c1c20] px-4 text-xs text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Footer de Totales y Envío */}
                            <div className="flex items-center justify-between border-t border-white/8 pt-5">
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-white/40">Total a Pagar</span>
                                    <p className="text-2xl font-black text-amber-400">
                                        S/ {totalCarritoPOS.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cerrarModalCrear}
                                        className="cursor-pointer rounded-2xl border border-white/10 px-5 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingOrder || itemsCarrito.length === 0}
                                        className="cursor-pointer rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-900/20 transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-40"
                                    >
                                        {isSubmittingOrder ? 'Guardando comanda...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 7. Modal de Confirmación para Cancelar Pedido */}
            <ConfirmModal
                isOpen={cancelarPedidoId !== null}
                title="Anular Pedido"
                message={`¿Estás seguro de cancelar el pedido #${cancelarPedidoId}? Se anulará la comanda y el stock de los productos se restituirá automáticamente a la carta.`}
                confirmText="Sí, anular pedido"
                cancelText="Volver"
                variant="danger"
                isLoading={isCanceling}
                onConfirm={confirmarCancelarPedido}
                onCancel={() => setCancelarPedidoId(null)}
            />

            {/* 8. Toast Flotante */}
            {toast && (
                <div
                    role="alert"
                    className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${toast.tipo === 'exito'
                            ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
                            : toast.tipo === 'advertencia'
                                ? 'border-amber-500/30 bg-amber-950/80 text-amber-200'
                                : 'border-rose-500/30 bg-rose-950/80 text-rose-200'
                        }`}
                >
                    {toast.tipo === 'exito' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check size={16} />
                        </div>
                    ) : toast.tipo === 'advertencia' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                            <AlertCircle size={16} />
                        </div>
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                            <X size={16} />
                        </div>
                    )}
                    <span className="text-sm font-medium">{toast.mensaje}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 cursor-pointer text-white/40 hover:text-white"
                        aria-label="Cerrar notificación"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
