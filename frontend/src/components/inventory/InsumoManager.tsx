import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    ClipboardList,
    Pencil,
    Plus,
    Power,
    X,
} from 'lucide-react'

import axios from 'axios'

import { ingredientService } from '../../services/ingredientService'

import type { ApiError } from '../../types/auth'

import type {
    Insumo,
    InsumoRequest,
    InsumoUpdateRequest,
    Movimiento,
    UnidadInsumo,
} from '../../types/inventory'

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

    const handleToggleStatus = async (insumo: Insumo) => {
        const accion = insumo.activo ? 'desactivar' : 'activar'
        const confirmed = window.confirm(
            `¿${accion[0].toUpperCase()}${accion.slice(1)} el insumo "${insumo.nombre}"?`,
        )

        if (!confirmed) {
            return
        }

        try {
            await ingredientService.updateStatus(insumo.id, !insumo.activo)
            await loadInsumos()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                window.alert(
                    requestError.response?.data.message ??
                    'No fue posible cambiar el estado del insumo.',
                )
            } else {
                window.alert('Ocurrió un error inesperado.')
            }
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
        <div className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                        Inventario
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Insumos
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-mirai-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark"
                >
                    <Plus size={17} />
                    Nuevo insumo
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

            {!isLoading && !error && insumos.length === 0 && (
                <p className="mt-7 text-sm text-white/40">
                    Todavía no hay insumos registrados.
                </p>
            )}

            {!isLoading && !error && insumos.length > 0 && (
                <div className="mt-7 space-y-3">
                    {insumos.map((insumo) => (
                        <div
                            key={insumo.id}
                            className={[
                                'flex items-center justify-between gap-4 rounded-2xl border bg-black/20 p-5',
                                insumo.activo ? 'border-white/8' : 'border-red-500/20 opacity-60',
                            ].join(' ')}
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-white">
                                        {insumo.nombre}
                                    </p>

                                    {insumo.stockBajo && insumo.activo && (
                                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">
                                            Stock bajo
                                        </span>
                                    )}

                                    {!insumo.activo && (
                                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-300">
                                            Inactivo
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-white/40">
                                    Stock actual:{' '}
                                    <span className="font-semibold text-white/70">
                                        {insumo.stockActual} {insumo.unidad}
                                    </span>{' '}
                                    · Mínimo: {insumo.stockMinimo} {insumo.unidad}
                                </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <button
                                    type="button"
                                    onClick={() => openMovements(insumo)}
                                    aria-label={`Movimientos de ${insumo.nombre}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                                >
                                    <ClipboardList size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openEditModal(insumo)}
                                    aria-label={`Editar ${insumo.nombre}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(insumo)}
                                    aria-label={`${insumo.activo ? 'Desactivar' : 'Activar'} ${insumo.nombre}`}
                                    className={[
                                        'flex h-9 w-9 items-center justify-center rounded-lg transition',
                                        insumo.activo
                                            ? 'text-white/50 hover:bg-white/10 hover:text-white'
                                            : 'text-emerald-300 hover:bg-emerald-500/15',
                                    ].join(' ')}
                                >
                                    <Power size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editingId ? 'Editar insumo' : 'Nuevo insumo'}
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
                                    htmlFor="insumo-nombre"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Nombre
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
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="insumo-unidad"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Unidad
                                </label>

                                <select
                                    id="insumo-unidad"
                                    value={editingId ? updateForm.unidad : createForm.unidad}
                                    onChange={(event) =>
                                        editingId
                                            ? setUpdateForm({ ...updateForm, unidad: event.target.value })
                                            : setCreateForm({ ...createForm, unidad: event.target.value })
                                    }
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Stock mínimo
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
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {!editingId && (
                                <div>
                                    <label
                                        htmlFor="insumo-inicial"
                                        className="mb-2 block text-sm font-semibold text-white/75"
                                    >
                                        Stock inicial
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
                                        className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex h-12 w-full items-center justify-center rounded-xl bg-mirai-accent px-5 font-semibold text-white transition hover:bg-mirai-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {movementsInsumo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                                    Historial
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-white">
                                    Movimientos de {movementsInsumo.nombre}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMovementsInsumo(null)}
                                aria-label="Cerrar"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
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
                                className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                {movementsError}
                            </div>
                        )}

                        {!isLoadingMovements && !movementsError && movements.length === 0 && (
                            <p className="mt-6 text-sm text-white/40">
                                Este insumo aún no tiene movimientos.
                            </p>
                        )}

                        {!isLoadingMovements && !movementsError && movements.length > 0 && (
                            <div className="mt-6 max-h-80 space-y-3 overflow-y-auto pr-1">
                                {movements.map((movimiento) => (
                                    <div
                                        key={movimiento.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {movimiento.tipo === 'ENTRADA' ? '+' : '−'}
                                                {movimiento.cantidad} {movementsInsumo.unidad}
                                            </p>

                                            <p className="mt-0.5 text-xs text-white/40">
                                                {movimiento.fecha.replace('T', ' ').slice(0, 16)}
                                                {movimiento.observacion ? ` · ${movimiento.observacion}` : ''}
                                            </p>
                                        </div>

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
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
