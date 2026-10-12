import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    ClipboardList,
    Package,
    Pencil,
    Plus,
    Power,
    X,
} from 'lucide-react'

import axios from 'axios'

import { ingredientService } from '../../../services/ingredientService'

import type { ApiError } from '../../../types/auth'

import type {
    Insumo,
    InsumoRequest,
    InsumoUpdateRequest,
    Movimiento,
    UnidadInsumo,
} from '../../../types/inventory'
import { ConfirmModal } from '../common/ConfirmModal'

const unidades: UnidadInsumo[] = ['kg', 'litros', 'unidades']

const emptyCreateForm: InsumoRequest = {
    nombre: '',
    unidad: 'kg',
    stockMinimo: 0,
    stockInicial: 0,
}

const emptyUpdateForm: InsumoUpdateRequest = {
    nombre: '',
    unidad: 'kg',
    stockMinimo: 0,
}

export function InsumoManager() {
    const [insumos, setInsumos] = useState<Insumo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [createForm, setCreateForm] = useState<InsumoRequest>(emptyCreateForm)
    const [updateForm, setUpdateForm] = useState<InsumoUpdateRequest>(emptyUpdateForm)
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [insumoToToggle, setInsumoToToggle] = useState<Insumo | null>(null)
    const [isToggling, setIsToggling] = useState(false)
    const [feedback, setFeedback] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)

    const [movementsInsumo, setMovementsInsumo] = useState<Insumo | null>(null)
    const [movements, setMovements] = useState<Movimiento[]>([])
    const [isLoadingMovements, setIsLoadingMovements] = useState(false)
    const [movementsError, setMovementsError] = useState('')

    const loadInsumos = () => {
        return ingredientService
            .getAll()
            .then((data) => {
                setError('')
                setInsumos(data)
            })
            .catch(() => {
                setError('No fue posible cargar los insumos.')
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        loadInsumos()
    }, [])

    const openCreateModal = () => {
        setEditingId(null)
        setCreateForm(emptyCreateForm)
        setFormError('')
        setIsModalOpen(true)
    }

    const openEditModal = (insumo: Insumo) => {
        setEditingId(insumo.id)
        setUpdateForm({
            nombre: insumo.nombre,
            unidad: insumo.unidad,
            stockMinimo: insumo.stockMinimo,
        })
        setFormError('')
        setIsModalOpen(true)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')
        setIsSaving(true)

        try {
            if (editingId) {
                await ingredientService.update(editingId, updateForm)
            } else {
                await ingredientService.create(createForm)
            }

            setIsModalOpen(false)
            await loadInsumos()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible guardar el insumo.',
                )
            } else {
                setFormError('Ocurrió un error inesperado.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const confirmarCambiarEstadoInsumo = async () => {
        if (!insumoToToggle) return
        setIsToggling(true)

        try {
            await ingredientService.updateStatus(insumoToToggle.id, !insumoToToggle.activo)
            const accion = insumoToToggle.activo ? 'desactivado' : 'activado'
            setFeedback({ texto: `Insumo "${insumoToToggle.nombre}" ${accion} correctamente.`, tipo: 'exito' })
            setInsumoToToggle(null)
            await loadInsumos()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFeedback({
                    texto: requestError.response?.data.message ?? 'No fue posible cambiar el estado del insumo.',
                    tipo: 'error',
                })
            } else {
                setFeedback({ texto: 'Ocurrió un error inesperado al actualizar el insumo.', tipo: 'error' })
            }
            setInsumoToToggle(null)
        } finally {
            setIsToggling(false)
        }
    }

    const openMovements = async (insumo: Insumo) => {
        setMovementsInsumo(insumo)
        setMovements([])
        setMovementsError('')
        setIsLoadingMovements(true)

        try {
            const data = await ingredientService.getMovements(insumo.id)
            setMovements(data)
        } catch {
            setMovementsError('No fue posible cargar los movimientos.')
        } finally {
            setIsLoadingMovements(false)
        }
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
            {/* Cabecera del Módulo */}
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        Inventario & Stock
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Insumos
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Control de materias primas, stocks mínimos y existencias actuales
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Nuevo Insumo</span>
                </button>
            </div>

            {/* Banner de Feedback */}
            {feedback && (
                <div
                    className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
                        feedback.tipo === 'exito'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    }`}
                >
                    <span>{feedback.texto}</span>
                    <button type="button" onClick={() => setFeedback(null)} className="p-1 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            )}

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
            {!isLoading && !error && insumos.length === 0 && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    Todavía no hay insumos registrados en el almacén.
                </div>
            )}

            {/* Lista de Insumos */}
            {!isLoading && !error && insumos.length > 0 && (
                <div className="mt-7 space-y-3.5">
                    {insumos.map((insumo) => (
                        <div
                            key={insumo.id}
                            className={[
                                'flex items-center justify-between gap-4 rounded-2xl border p-5 transition-all',
                                insumo.activo
                                    ? 'border-white/5 bg-[#18181c]/70 hover:border-amber-500/30 hover:bg-[#18181c]'
                                    : 'border-rose-500/20 bg-rose-950/10 opacity-70',
                            ].join(' ')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 font-bold">
                                    <Package size={22} />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h4 className="text-base font-bold text-white sm:text-lg">
                                            {insumo.nombre}
                                        </h4>

                                        {insumo.stockBajo && insumo.activo && (
                                            <span className="rounded-xl border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-300 animate-pulse">
                                                Stock crítico
                                            </span>
                                        )}

                                        {!insumo.activo && (
                                            <span className="rounded-xl border border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-rose-300">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-sm font-semibold text-white/50">
                                        Stock actual:{' '}
                                        <span className={insumo.stockBajo ? 'text-amber-400 font-bold' : 'text-white font-bold'}>
                                            {insumo.stockActual} {insumo.unidad}
                                        </span>{' '}
                                        • Mínimo:{' '}
                                        <span className="text-white/70">
                                            {insumo.stockMinimo} {insumo.unidad}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openMovements(insumo)}
                                    aria-label={`Movimientos de ${insumo.nombre}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/60 transition hover:bg-white/10 hover:text-white"
                                    title="Ver kardex / movimientos"
                                >
                                    <ClipboardList size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openEditModal(insumo)}
                                    aria-label={`Editar ${insumo.nombre}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/60 transition hover:bg-white/10 hover:text-white"
                                    title="Editar insumo"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setInsumoToToggle(insumo)}
                                    aria-label={`${insumo.activo ? 'Desactivar' : 'Activar'} ${insumo.nombre}`}
                                    className={[
                                        'flex h-10 w-10 items-center justify-center rounded-xl border transition',
                                        insumo.activo
                                            ? 'border-white/10 bg-[#16161a] text-white/50 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
                                    ].join(' ')}
                                    title={insumo.activo ? 'Desactivar insumo' : 'Reactivar insumo'}
                                >
                                    <Power size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Crear / Editar Insumo */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">
                                {editingId ? 'Editar Insumo' : 'Nuevo Insumo'}
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
                                    htmlFor="insumo-nombre"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Nombre del Insumo
                                </label>

                                <input
                                    id="insumo-nombre"
                                    type="text"
                                    value={editingId ? updateForm.nombre : createForm.nombre}
                                    onChange={(event) =>
                                        editingId
                                            ? setUpdateForm({ ...updateForm, nombre: event.target.value })
                                            : setCreateForm({ ...createForm, nombre: event.target.value })
                                    }
                                    placeholder="Ej. Café en Grano Tostado"
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="insumo-unidad"
                                        className="mb-2 block text-sm font-bold text-white/80"
                                    >
                                        Unidad de Medida
                                    </label>

                                    <select
                                        id="insumo-unidad"
                                        value={editingId ? updateForm.unidad : createForm.unidad}
                                        onChange={(event) =>
                                            editingId
                                                ? setUpdateForm({ ...updateForm, unidad: event.target.value as UnidadInsumo })
                                                : setCreateForm({ ...createForm, unidad: event.target.value as UnidadInsumo })
                                        }
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    >
                                        {unidades.map((unidad) => (
                                            <option key={unidad} value={unidad}>
                                                {unidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="insumo-minimo"
                                        className="mb-2 block text-sm font-bold text-white/80"
                                    >
                                        Stock Mínimo
                                    </label>

                                    <input
                                        id="insumo-minimo"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={editingId ? updateForm.stockMinimo : createForm.stockMinimo}
                                        onChange={(event) =>
                                            editingId
                                                ? setUpdateForm({ ...updateForm, stockMinimo: Number(event.target.value) })
                                                : setCreateForm({ ...createForm, stockMinimo: Number(event.target.value) })
                                        }
                                        required
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {!editingId && (
                                <div>
                                    <label
                                        htmlFor="insumo-inicial"
                                        className="mb-2 block text-sm font-bold text-white/80"
                                    >
                                        Stock Inicial en Almacén
                                    </label>

                                    <input
                                        id="insumo-inicial"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={createForm.stockInicial}
                                        onChange={(event) =>
                                            setCreateForm({
                                                ...createForm,
                                                stockInicial: Number(event.target.value),
                                            })
                                        }
                                        required
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Insumo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Movimientos / Kardex */}
            {movementsInsumo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                                    Kardex / Historial
                                </span>
                                <h3 className="mt-1 text-xl font-black text-white">
                                    Movimientos de {movementsInsumo.nombre}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMovementsInsumo(null)}
                                aria-label="Cerrar"
                                className="rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {isLoadingMovements && (
                            <div className="mt-6 space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="h-14 animate-pulse rounded-2xl bg-white/5"
                                    />
                                ))}
                            </div>
                        )}

                        {!isLoadingMovements && movementsError && (
                            <div
                                role="alert"
                                className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
                            >
                                {movementsError}
                            </div>
                        )}

                        {!isLoadingMovements && !movementsError && movements.length === 0 && (
                            <p className="py-8 text-center text-sm font-medium text-white/40">
                                Este insumo aún no tiene movimientos registrados.
                            </p>
                        )}

                        {!isLoadingMovements && !movementsError && movements.length > 0 && (
                            <div className="mt-6 max-h-96 space-y-2.5 overflow-y-auto pr-1">
                                {movements.map((movimiento) => (
                                    <div
                                        key={movimiento.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#16161a] px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">
                                                {movimiento.tipo === 'ENTRADA' ? '+' : '−'}
                                                {movimiento.cantidad} {movementsInsumo.unidad}
                                            </p>

                                            <p className="mt-0.5 text-xs text-white/50">
                                                {movimiento.fecha.replace('T', ' ').slice(0, 16)}
                                                {movimiento.observacion ? ` · ${movimiento.observacion}` : ''}
                                            </p>
                                        </div>

                                        <span
                                            className={[
                                                'rounded-xl border px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
                                                movimiento.tipo === 'ENTRADA'
                                                    ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                                                    : 'border-rose-500/30 bg-rose-500/20 text-rose-400',
                                            ].join(' ')}
                                        >
                                            {movimiento.tipo}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Personalizado */}
            <ConfirmModal
                isOpen={insumoToToggle !== null}
                title={insumoToToggle?.activo ? 'Desactivar Insumo' : 'Activar Insumo'}
                message={
                    insumoToToggle?.activo
                        ? `¿Estás seguro de desactivar "${insumoToToggle?.nombre}"? No podrá utilizarse en recetas ni recibir movimientos hasta que vuelva a activarse.`
                        : `¿Deseas reactivar el insumo "${insumoToToggle?.nombre}" para su uso operativo en almacén?`
                }
                confirmText={insumoToToggle?.activo ? 'Sí, desactivar' : 'Sí, activar'}
                cancelText="Cancelar"
                variant={insumoToToggle?.activo ? 'warning' : 'info'}
                isLoading={isToggling}
                onConfirm={confirmarCambiarEstadoInsumo}
                onCancel={() => setInsumoToToggle(null)}
            />
        </div>
    )
}
