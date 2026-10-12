import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    ArrowDownLeft,
    ArrowUpRight,
    Plus,
    X,
} from 'lucide-react'

import axios from 'axios'

import { ingredientService } from '../../../services/ingredientService'
import { inventoryService } from '../../../services/inventoryService'

import type { ApiError } from '../../../types/auth'

import type {
    Insumo,
    Movimiento,
    MovimientoRequest,
    TipoMovimiento,
} from '../../../types/inventory'

const emptyForm: MovimientoRequest = {
    insumoId: 0,
    tipo: 'ENTRADA',
    cantidad: 0,
    observacion: '',
}

export function MovementManager() {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([])
    const [insumos, setInsumos] = useState<Insumo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState<MovimientoRequest>(emptyForm)
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const loadData = () => {
        Promise.all([
            inventoryService.getAll(),
            ingredientService.getAll(),
        ])
            .then(([movimientosData, insumosData]) => {
                setError('')
                setMovimientos(movimientosData)
                setInsumos(insumosData)
            })
            .catch(() => {
                setError('No fue posible cargar los movimientos.')
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        loadData()
    }, [])

    const openCreateModal = () => {
        setForm(emptyForm)
        setFormError('')
        setIsModalOpen(true)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')
        setIsSaving(true)

        try {
            await inventoryService.create({
                ...form,
                observacion: form.observacion?.trim() || undefined,
            })

            setIsModalOpen(false)
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible registrar el movimiento.',
                )
            } else {
                setFormError('Ocurrió un error inesperado.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const insumoSeleccionado = insumos.find(
        (insumo) => insumo.id === form.insumoId,
    )

    return (
        <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
            {/* Cabecera del Módulo */}
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        Inventario & Kardex
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Movimientos
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Registro de entradas por compras y salidas o ajustes de almacén
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Nuevo Movimiento</span>
                </button>
            </div>

            {/* Estado de Carga */}
            {isLoading && (
                <div className="mt-7 space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-20 animate-pulse rounded-2xl bg-white/5"
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <div
                    role="alert"
                    className="mt-7 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300"
                >
                    {error}
                </div>
            )}

            {/* Vacío */}
            {!isLoading && !error && movimientos.length === 0 && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    Todavía no hay movimientos registrados en el kardex.
                </div>
            )}

            {/* Lista de Movimientos */}
            {!isLoading && !error && movimientos.length > 0 && (
                <div className="mt-7 space-y-3.5">
                    {movimientos.map((movimiento) => (
                        <div
                            key={movimiento.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#18181c]/70 p-5 transition-all hover:border-amber-500/30 hover:bg-[#18181c]"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={[
                                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border font-bold',
                                        movimiento.tipo === 'ENTRADA'
                                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                                            : 'border-rose-500/30 bg-rose-500/15 text-rose-400',
                                    ].join(' ')}
                                >
                                    {movimiento.tipo === 'ENTRADA' ? (
                                        <ArrowDownLeft size={22} />
                                    ) : (
                                        <ArrowUpRight size={22} />
                                    )}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h4 className="text-base font-bold text-white sm:text-lg">
                                            {movimiento.insumoNombre}
                                        </h4>

                                        <span
                                            className={[
                                                'rounded-xl border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide',
                                                movimiento.tipo === 'ENTRADA'
                                                    ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                                                    : 'border-rose-500/30 bg-rose-500/20 text-rose-400',
                                            ].join(' ')}
                                        >
                                            {movimiento.tipo}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm font-semibold text-white/50">
                                        {movimiento.fecha.replace('T', ' ').slice(0, 16)}
                                        {movimiento.observacion ? ` • ${movimiento.observacion}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div
                                className={[
                                    'shrink-0 text-xl font-black',
                                    movimiento.tipo === 'ENTRADA'
                                        ? 'text-emerald-400'
                                        : 'text-rose-400',
                                ].join(' ')}
                            >
                                {movimiento.tipo === 'ENTRADA' ? '+' : '−'}
                                {movimiento.cantidad}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Registro de Movimiento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">
                                Registrar Movimiento
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Cerrar"
                                className="rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div
                                role="alert"
                                className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
                            >
                                {formError}
                            </div>
                        )}

                        <form
                            className="mt-6 space-y-4"
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <label
                                    htmlFor="mov-insumo"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Insumo a Afectar
                                </label>

                                <select
                                    id="mov-insumo"
                                    value={form.insumoId || ''}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            insumoId: Number(event.target.value),
                                        })
                                    }
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                >
                                    <option value="" disabled>
                                        Selecciona un insumo
                                    </option>

                                    {insumos
                                        .filter((insumo) => insumo.activo)
                                        .map((insumo) => (
                                            <option key={insumo.id} value={insumo.id}>
                                                {insumo.nombre} (disponible: {insumo.stockActual} {insumo.unidad})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="mov-tipo"
                                        className="mb-2 block text-sm font-bold text-white/80"
                                    >
                                        Tipo de Movimiento
                                    </label>

                                    <select
                                        id="mov-tipo"
                                        value={form.tipo}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                tipo: event.target.value as TipoMovimiento,
                                            })
                                        }
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    >
                                        <option value="ENTRADA">Entrada (Compra/Ingreso)</option>
                                        <option value="SALIDA">Salida (Merma/Ajuste)</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="mov-cantidad"
                                        className="mb-2 block text-sm font-bold text-white/80"
                                    >
                                        Cantidad
                                        {insumoSeleccionado ? ` (${insumoSeleccionado.unidad})` : ''}
                                    </label>

                                    <input
                                        id="mov-cantidad"
                                        type="number"
                                        min={0.01}
                                        step="0.01"
                                        value={form.cantidad || ''}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                cantidad: Number(event.target.value),
                                            })
                                        }
                                        placeholder="0.00"
                                        required
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="mov-observacion"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Observación / Detalle (Opcional)
                                </label>

                                <input
                                    id="mov-observacion"
                                    type="text"
                                    value={form.observacion ?? ''}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            observacion: event.target.value,
                                        })
                                    }
                                    disabled={isSaving}
                                    placeholder="Ej. Compra de sacos a distribuidor"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Registrando...' : 'Registrar Movimiento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
