import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import { Plus, X } from 'lucide-react'

import axios from 'axios'

import { ingredientService } from '../../services/ingredientService'
import { inventoryService } from '../../services/inventoryService'

import type { ApiError } from '../../types/auth'

import type {
    Insumo,
    Movimiento,
    MovimientoRequest,
    TipoMovimiento,
} from '../../types/inventory'

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
        <div className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                        Inventario
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Movimientos
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-mirai-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark"
                >
                    <Plus size={17} />
                    Nuevo movimiento
                </button>
            </div>

            {isLoading && (
                <div className="mt-7 space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-16 animate-pulse rounded-2xl bg-white/5"
                        />
                    ))}
                </div>
            )}

            {!isLoading && error && (
                <div
                    role="alert"
                    className="mt-7 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                >
                    {error}
                </div>
            )}

            {!isLoading && !error && movimientos.length === 0 && (
                <p className="mt-7 text-sm text-white/40">
                    Todavía no hay movimientos registrados.
                </p>
            )}

            {!isLoading && !error && movimientos.length > 0 && (
                <div className="mt-7 space-y-3">
                    {movimientos.map((movimiento) => (
                        <div
                            key={movimiento.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-5"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-white">
                                        {movimiento.insumoNombre}
                                    </p>

                                    <span
                                        className={[
                                            'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                                            movimiento.tipo === 'ENTRADA'
                                                ? 'bg-emerald-500/15 text-emerald-300'
                                                : 'bg-red-500/15 text-red-300',
                                        ].join(' ')}
                                    >
                                        {movimiento.tipo}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-white/40">
                                    {movimiento.fecha.replace('T', ' ').slice(0, 16)}
                                    {movimiento.observacion ? ` · ${movimiento.observacion}` : ''}
                                </p>
                            </div>

                            <p
                                className={[
                                    'shrink-0 text-lg font-bold',
                                    movimiento.tipo === 'ENTRADA'
                                        ? 'text-emerald-300'
                                        : 'text-red-300',
                                ].join(' ')}
                            >
                                {movimiento.tipo === 'ENTRADA' ? '+' : '−'}
                                {movimiento.cantidad}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                Nuevo movimiento
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Cerrar"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div
                                role="alert"
                                className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                {formError}
                            </div>
                        )}

                        <form
                            className="mt-6 space-y-5"
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <label
                                    htmlFor="mov-insumo"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Insumo
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
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
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

                            <div>
                                <label
                                    htmlFor="mov-tipo"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Tipo
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
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <option value="ENTRADA">Entrada</option>
                                    <option value="SALIDA">Salida</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="mov-cantidad"
                                    className="mb-2 block text-sm font-semibold text-white/75"
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
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="mov-observacion"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Observación
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
                                    placeholder="Ej. Compra a proveedor"
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex h-12 w-full items-center justify-center rounded-xl bg-mirai-accent px-5 font-semibold text-white transition hover:bg-mirai-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Registrando...' : 'Registrar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
