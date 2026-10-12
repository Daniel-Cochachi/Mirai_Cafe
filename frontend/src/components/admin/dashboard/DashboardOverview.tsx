import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    Coffee,
    ExternalLink,
    Search,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ingredientService } from '../../../services/ingredientService'
import { productService } from '../../../services/productService'
import api from '../../../services/api'
import type { AdminTab } from '../Layout/AdminSidebar'
import type { Insumo } from '../../../types/inventory'

interface DashboardOverviewProps {
    onNavigateTab: (tab: AdminTab) => void
}

interface PedidoItem {
    id: number
    usuarioNombre: string
    total: number
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'PAGADO' | 'CANCELADO'
    fecha: string
    detalles?: Array<{ productoNombre: string; cantidad: number }>
}

export function DashboardOverview({ onNavigateTab }: DashboardOverviewProps) {
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
    const [busqueda, setBusqueda] = useState<string>('')

    // Métricas en tiempo real
    const [totalProductos, setTotalProductos] = useState<number>(0)
    const [insumosCriticos, setInsumosCriticos] = useState<Insumo[]>([])
    const [pedidos, setPedidos] = useState<PedidoItem[]>([])
    const [cargando, setCargando] = useState<boolean>(true)

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [prods, bajos, resPedidos] = await Promise.all([
                productService.getAll(),
                ingredientService.getLowStock(),
                api.get('/orders'),
            ])
            setTotalProductos(prods.length)
            setInsumosCriticos(bajos)
            setPedidos(resPedidos.data || [])
        } catch (err) {
            console.error('Error al cargar métricas del dashboard:', err)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    // Métricas calculadas
    const ventasHoy = pedidos
        .filter((p) => p.estado === 'PAGADO')
        .reduce((sum, p) => sum + Number(p.total), 0)

    const pedidosPendientes = pedidos.filter((p) => p.estado === 'PENDIENTE' || p.estado === 'EN_PROCESO').length

    const pedidosFiltrados = pedidos.filter((p) => {
        const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado
        const coincideBusqueda =
            p.usuarioNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.id.toString().includes(busqueda)
        return coincideEstado && coincideBusqueda
    })

    const badgeEstado = (estado: string) => {
        switch (estado) {
            case 'PAGADO':
                return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Pagado' }
            case 'PENDIENTE':
                return { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Pendiente' }
            case 'EN_PROCESO':
                return { color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', label: 'En preparación' }
            case 'LISTO':
                return { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Listo para entrega' }
            case 'CANCELADO':
                return { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Cancelado' }
            default:
                return { color: 'bg-white/10 text-white/60 border-white/10', label: estado }
        }
    }

    return (
        <div className="space-y-10">
            {/* ======================================================== */}
            {/* 1. TARJETAS DE MÉTRICAS (COLORES MIRAI CAFÉ & MOCA)      */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {/* 1. Ventas Pagadas (Caramelo / Moca Cálido) */}
                <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#b87343] via-[#8c4f2c] to-[#5c3017] p-7 text-white shadow-xl shadow-amber-950/20 transition-all hover:translate-y-[-2px]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-amber-200">
                            Ventas Cobradas
                        </span>
                        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
                            <TrendingUp size={26} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="text-4xl font-black tracking-tight sm:text-5xl">
                            S/ {ventasHoy.toFixed(2)}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-amber-200/80">
                            Total de órdenes pagadas
                        </p>
                    </div>
                </div>

                {/* 2. Pedidos en Cola (Café Tostado & Dorado) */}
                <div
                    onClick={() => onNavigateTab('orders')}
                    className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#17171a] p-7 text-white shadow-xl transition-all hover:translate-y-[-2px] hover:border-amber-500/40"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-white/60">
                            Por Atender
                        </span>
                        <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-400">
                            <ShoppingBag size={26} />
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="text-4xl font-black tracking-tight sm:text-5xl text-white">
                            {pedidosPendientes}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-amber-400">
                            {pedidos.length} pedidos en total registrados
                        </p>
                    </div>
                </div>

                {/* 3. Insumos Críticos (Alerta Tostado / Terracota) */}
                <div
                    onClick={() => onNavigateTab('ingredients')}
                    className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#17171a] p-7 text-white shadow-xl transition-all hover:translate-y-[-2px] hover:border-rose-500/40"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-white/60">
                            Stock Crítico
                        </span>
                        <div className="rounded-2xl bg-rose-500/15 p-3 text-rose-400">
                            <AlertTriangle size={26} />
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="text-4xl font-black tracking-tight sm:text-5xl text-rose-400">
                            {insumosCriticos.length}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-white/50">
                            Insumos bajo el nivel mínimo
                        </p>
                    </div>
                </div>

                {/* 4. Carta de Productos (Expreso Oscuro) */}
                <div
                    onClick={() => onNavigateTab('products')}
                    className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#17171a] p-7 text-white shadow-xl transition-all hover:translate-y-[-2px] hover:border-amber-500/40"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-white/60">
                            Carta Mirai
                        </span>
                        <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-400">
                            <Coffee size={26} />
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="text-4xl font-black tracking-tight sm:text-5xl text-white">
                            {totalProductos}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-white/50">
                            Productos activos en el menú
                        </p>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 2. GRILLA PRINCIPAL: PEDIDOS RECIENTES + RESUMEN STOCK   */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 2.1 Columna Izquierda: Pedidos y Ventas (2 Columnas) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Filtros de Píldoras y Buscador con tipografía más grande */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Filtros por Estado */}
                        <div className="flex flex-wrap gap-2.5">
                            {['TODOS', 'PENDIENTE', 'EN_PROCESO', 'PAGADO', 'CANCELADO'].map((estado) => (
                                <button
                                    key={estado}
                                    type="button"
                                    onClick={() => setFiltroEstado(estado)}
                                    className={[
                                        'rounded-2xl px-4 py-2.5 text-sm font-bold transition-all',
                                        filtroEstado === estado
                                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                            : 'bg-[#151518] text-white/60 hover:bg-white/10 hover:text-white',
                                    ].join(' ')}
                                >
                                    {estado === 'TODOS'
                                        ? `Todos (${pedidos.length})`
                                        : estado.charAt(0) + estado.slice(1).toLowerCase().replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Buscador de Pedidos */}
                        <div className="relative min-w-[260px]">
                            <Search size={18} className="absolute left-4 top-3.5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente o #ID..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-[#151518] py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Tabla Amplia de Pedidos */}
                    <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-5">
                            <div>
                                <h3 className="text-xl font-extrabold text-white">Pedidos Recientes</h3>
                                <p className="mt-1 text-sm text-white/45">
                                    Flujo de órdenes entrantes y ventas
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onNavigateTab('orders')}
                                className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-amber-400 transition hover:bg-white/10"
                            >
                                Ir a Módulo Pedidos →
                            </button>
                        </div>

                        <div className="divide-y divide-white/5">
                            {cargando ? (
                                <p className="py-12 text-center text-sm text-white/40">
                                    Cargando pedidos de la cafetería...
                                </p>
                            ) : pedidosFiltrados.length === 0 ? (
                                <div className="py-14 text-center text-sm text-white/40">
                                    No hay pedidos registrados con este filtro.
                                </div>
                            ) : (
                                pedidosFiltrados.slice(0, 6).map((pedido) => {
                                    const badge = badgeEstado(pedido.estado)
                                    return (
                                        <div
                                            key={pedido.id}
                                            className="flex flex-col justify-between gap-4 py-4.5 sm:flex-row sm:items-center"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-base font-black text-amber-400">
                                                    #{pedido.id}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-white">
                                                        {pedido.usuarioNombre || 'Cliente'}
                                                    </h4>
                                                    <p className="mt-0.5 text-xs text-white/45">
                                                        {new Date(pedido.fecha).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}{' '}
                                                        • {pedido.detalles?.length || 1} producto(s)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <span
                                                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold ${badge.color}`}
                                                >
                                                    {badge.label}
                                                </span>
                                                <span className="text-lg font-black text-white">
                                                    S/ {Number(pedido.total).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* 2.2 Columna Derecha: Alertas de Insumos + Enlace Directo a Carta */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Tarjeta Insumos Críticos */}
                    <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <h4 className="text-base font-extrabold text-white">Insumos en Alerta</h4>
                                <p className="text-xs text-white/40">Materias primas por agotarse</p>
                            </div>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-400">
                                {insumosCriticos.length}
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {insumosCriticos.length === 0 ? (
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs font-semibold text-emerald-400">
                                    ✓ Todo el stock de insumos está en orden
                                </div>
                            ) : (
                                insumosCriticos.slice(0, 4).map((insumo) => (
                                    <div
                                        key={insumo.id}
                                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3.5"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">{insumo.nombre}</p>
                                            <p className="text-xs text-white/40">
                                                Mínimo requerido: {insumo.stockMinimo} {insumo.unidad}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-rose-400">
                                                {insumo.stockActual} {insumo.unidad}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => onNavigateTab('ingredients')}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#18181c] py-3 text-sm font-bold text-amber-400 transition hover:bg-white/10"
                        >
                            <span>Gestionar Insumos e Inventario</span>
                        </button>
                    </div>

                    {/* Tarjeta Enlace a Carta Digital */}
                    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#1a1410] to-[#121215] p-7 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                                <Coffee size={22} />
                            </div>
                            <div>
                                <h4 className="text-base font-extrabold text-white">Carta Digital Mirai</h4>
                                <p className="text-xs text-white/40">Menú público para los clientes</p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs leading-relaxed text-white/50">
                            Puedes abrir la vista del cliente en otra pestaña para simular pedidos y revisar la disponibilidad de productos en vivo.
                        </p>

                        <Link
                            to="/menu"
                            target="_blank"
                            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-extrabold text-black shadow-lg shadow-amber-950/40 transition hover:from-amber-400 hover:to-amber-500"
                        >
                            <span>Abrir Menú de Clientes</span>
                            <ExternalLink size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
