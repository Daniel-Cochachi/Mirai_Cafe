import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    Pencil,
    Plus,
    Trash2,
    UtensilsCrossed,
    X,
} from 'lucide-react'

import axios from 'axios'

import { ingredientService } from '../../../services/ingredientService'
import { productService } from '../../../services/productService'
import { recipeService } from '../../../services/recipeService'

import type { ApiError } from '../../../types/auth'

import type { Product } from '../../../types/product'

import type {
    Insumo,
    Receta,
    RecetaItemRequest,
} from '../../../types/inventory'
import { ConfirmModal } from '../common/ConfirmModal'

interface EditRow extends RecetaItemRequest {
    key: number
}

export function RecipeManager() {
    const [productos, setProductos] = useState<Product[]>([])
    const [insumos, setInsumos] = useState<Insumo[]>([])
    const [productoId, setProductoId] = useState<number>(0)
    const [receta, setReceta] = useState<Receta | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [addForm, setAddForm] = useState<RecetaItemRequest>({
        insumoId: 0,
        cantidad: 0,
    })
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editRows, setEditRows] = useState<EditRow[]>([])
    const [nextKey, setNextKey] = useState(1)
    const [itemToRemove, setItemToRemove] = useState<{ insumoId: number; insumoNombre: string } | null>(null)
    const [isRemoving, setIsRemoving] = useState(false)
    const [feedback, setFeedback] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)

    const loadInicial = () => {
        Promise.all([
            productService.getAll(),
            ingredientService.getAll(),
        ])
            .then(([productosData, insumosData]) => {
                setError('')
                setProductos(productosData)
                setInsumos(insumosData)

                if (productosData.length > 0) {
                    setProductoId(productosData[0].id)
                }
            })
            .catch(() => {
                setError('No fue posible cargar los productos.')
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const loadReceta = (id: number) => {
        return recipeService
            .getByProduct(id)
            .then((data) => {
                setError('')
                setReceta(data)
            })
            .catch(() => {
                setReceta(null)
                setError('No fue posible cargar la receta del producto.')
            })
    }

    useEffect(() => {
        loadInicial()
    }, [])

    useEffect(() => {
        if (productoId) {
            loadReceta(productoId)
        }
    }, [productoId])

    const insumosDisponibles = insumos.filter(
        (insumo) =>
            insumo.activo &&
            !receta?.items.some((item) => item.insumoId === insumo.id),
    )

    const handleAdd = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')
        setIsSaving(true)

        try {
            const data = await recipeService.addItem(productoId, addForm)
            setReceta(data)
            setIsAddOpen(false)
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible agregar el insumo a la receta.',
                )
            } else {
                setFormError('Ocurrió un error inesperado.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const confirmarQuitarInsumo = async () => {
        if (!itemToRemove) return
        setIsRemoving(true)

        try {
            await recipeService.removeItem(productoId, itemToRemove.insumoId)
            setFeedback({ texto: `Insumo "${itemToRemove.insumoNombre}" retirado de la receta.`, tipo: 'exito' })
            setItemToRemove(null)
            await loadReceta(productoId)
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFeedback({
                    texto: requestError.response?.data.message ?? 'No fue posible quitar el insumo de la receta.',
                    tipo: 'error',
                })
            } else {
                setFeedback({ texto: 'Ocurrió un error inesperado al quitar el insumo.', tipo: 'error' })
            }
            setItemToRemove(null)
        } finally {
            setIsRemoving(false)
        }
    }

    const openEditModal = () => {
        if (!receta) {
            return
        }

        let key = 1
        const rows: EditRow[] = receta.items.map((item) => ({
            key: key++,
            insumoId: item.insumoId,
            cantidad: item.cantidad,
        }))

        setEditRows(rows)
        setNextKey(key)
        setFormError('')
        setIsEditOpen(true)
    }

    const handleSaveEdit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')
        setIsSaving(true)

        try {
            await recipeService.replace(productoId, {
                items: editRows.map(({ insumoId, cantidad }) => ({
                    insumoId,
                    cantidad,
                })),
            })
            await loadReceta(productoId)
            setIsEditOpen(false)
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible guardar la receta.',
                )
            } else {
                setFormError('Ocurrió un error inesperado.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const insumoById = (id: number) =>
        insumos.find((insumo) => insumo.id === id)

    return (
        <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
            {/* Cabecera del Módulo */}
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        Producción & Fórmulas
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Fichas Técnicas / Recetas
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Composición de insumos requeridos por cada porción o bebida servida
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={productoId || ''}
                        onChange={(event) => setProductoId(Number(event.target.value))}
                        disabled={isLoading}
                        aria-label="Producto"
                        className="h-12 rounded-2xl border border-white/10 bg-[#18181c] px-4 text-sm font-bold text-white outline-none transition focus:border-amber-500 disabled:opacity-60"
                    >
                        <option value="" disabled>
                            Selecciona un producto...
                        </option>

                        {productos.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                                {producto.nombre}
                            </option>
                        ))}
                    </select>

                    {receta && receta.items.length > 0 && (
                        <button
                            type="button"
                            onClick={openEditModal}
                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
                        >
                            <Pencil size={16} />
                            <span>Editar Receta</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            setAddForm({ insumoId: 0, cantidad: 0 })
                            setFormError('')
                            setIsAddOpen(true)
                        }}
                        disabled={!productoId}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <Plus size={18} />
                        <span>Agregar Insumo</span>
                    </button>
                </div>
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

            {/* No hay productos */}
            {!isLoading && !error && productos.length === 0 && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    No hay productos disponibles para configurar recetas en la carta.
                </div>
            )}

            {/* No ha seleccionado producto */}
            {!isLoading && !error && productos.length > 0 && !productoId && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    Selecciona un producto arriba para visualizar o armar su ficha técnica de ingredientes.
                </div>
            )}

            {/* Receta vacía para el producto */}
            {!isLoading && !error && productoId && receta && receta.items.length === 0 && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    El producto "{receta.productoNombre}" todavía no tiene insumos agregados en su receta.
                </div>
            )}

            {/* Lista de Insumos en la Receta */}
            {!isLoading && !error && receta && receta.items.length > 0 && (
                <div className="mt-7 space-y-3.5">
                    {receta.items.map((item) => {
                        const insumo = insumoById(item.insumoId)
                        const inactivo = insumo ? !insumo.activo : false

                        return (
                            <div
                                key={item.insumoId}
                                className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#18181c]/70 p-5 transition-all hover:border-amber-500/30 hover:bg-[#18181c]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 font-bold">
                                        <UtensilsCrossed size={22} />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h4 className="text-base font-bold text-white sm:text-lg">
                                                {item.insumoNombre}
                                            </h4>

                                            {inactivo && (
                                                <span className="rounded-xl border border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-rose-300">
                                                    Inactivo en Almacén
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm font-semibold text-white/50">
                                            Dosificación:{' '}
                                            <span className="font-bold text-amber-400">
                                                {item.cantidad} {item.unidad}
                                            </span>{' '}
                                            por unidad preparada
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setItemToRemove({ insumoId: item.insumoId, insumoNombre: item.insumoNombre })}
                                    aria-label={`Quitar ${item.insumoNombre}`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20"
                                    title="Quitar insumo de la receta"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal: Agregar Insumo */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">
                                Agregar Insumo a la Receta
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
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
                            onSubmit={handleAdd}
                        >
                            {insumosDisponibles.length === 0 && (
                                <p className="rounded-2xl border border-white/8 bg-[#16161a] px-4 py-3 text-sm text-white/50">
                                    Todos los insumos activos ya forman parte de la receta de este producto.
                                </p>
                            )}

                            <div>
                                <label
                                    htmlFor="receta-insumo"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Insumo a Incorporar
                                </label>

                                <select
                                    id="receta-insumo"
                                    value={addForm.insumoId || ''}
                                    onChange={(event) =>
                                        setAddForm({
                                            ...addForm,
                                            insumoId: Number(event.target.value),
                                        })
                                    }
                                    required
                                    disabled={isSaving || insumosDisponibles.length === 0}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="" disabled>
                                        Selecciona un insumo
                                    </option>

                                    {insumosDisponibles.map((insumo) => (
                                        <option key={insumo.id} value={insumo.id}>
                                            {insumo.nombre} ({insumo.unidad})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="receta-cantidad"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Cantidad por Unidad Preparada
                                    {addForm.insumoId
                                        ? ` (${insumoById(addForm.insumoId)?.unidad ?? ''})`
                                        : ''}
                                </label>

                                <input
                                    id="receta-cantidad"
                                    type="number"
                                    min={0.01}
                                    step="0.01"
                                    value={addForm.cantidad || ''}
                                    onChange={(event) =>
                                        setAddForm({
                                            ...addForm,
                                            cantidad: Number(event.target.value),
                                        })
                                    }
                                    placeholder="0.00"
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving || insumosDisponibles.length === 0}
                                className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Agregando...' : 'Agregar a la Receta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Receta Completa */}
            {isEditOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">
                                Editar Ficha de Insumos
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
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
                            onSubmit={handleSaveEdit}
                        >
                            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                                {editRows.map((row) => {
                                    const insumo = insumoById(row.insumoId)
                                    const inactivo = insumo ? !insumo.activo : false

                                    return (
                                        <div
                                            key={row.key}
                                            className={[
                                                'flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all',
                                                inactivo ? 'border-rose-500/30 bg-rose-950/20' : 'border-white/5 bg-[#16161a]',
                                            ].join(' ')}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate font-bold text-white text-sm">
                                                        {insumo?.nombre ?? 'Insumo'}
                                                    </p>

                                                    {inactivo && (
                                                        <span className="rounded-xl border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-rose-300">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </div>

                                                {inactivo && (
                                                    <p className="mt-1 text-xs font-semibold text-rose-300">
                                                        Quita este insumo para poder guardar la receta.
                                                    </p>
                                                )}

                                                <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0.01}
                                                        step="0.01"
                                                        value={row.cantidad || ''}
                                                        aria-label={`Cantidad de ${insumo?.nombre ?? ''}`}
                                                        onChange={(event) =>
                                                            setEditRows(
                                                                editRows.map((item) =>
                                                                    item.key === row.key
                                                                        ? { ...item, cantidad: Number(event.target.value) }
                                                                        : item,
                                                                ),
                                                            )
                                                        }
                                                        required
                                                        disabled={isSaving}
                                                        className="h-10 w-28 rounded-xl border border-white/10 bg-[#121215] px-3 text-sm font-bold text-white focus:border-amber-500 focus:outline-none"
                                                    />
                                                    <span className="text-xs font-bold text-white/50">
                                                        {insumo?.unidad}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditRows(editRows.filter((item) => item.key !== row.key))
                                                }
                                                aria-label="Quitar fila"
                                                disabled={isSaving}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>

                            {(() => {
                                const usados = editRows.map((row) => row.insumoId)
                                const disponibles = insumos.filter(
                                    (insumo) => insumo.activo && !usados.includes(insumo.id),
                                )

                                if (disponibles.length === 0) {
                                    return null
                                }

                                return (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditRows([
                                                ...editRows,
                                                { key: nextKey, insumoId: disponibles[0].id, cantidad: 1 },
                                            ])
                                            setNextKey(nextKey + 1)
                                        }}
                                        className="flex items-center gap-2 text-sm font-bold text-amber-400 transition hover:text-amber-300"
                                    >
                                        <Plus size={16} />
                                        <span>Agregar otro insumo</span>
                                    </button>
                                )
                            })()}

                            <button
                                type="submit"
                                disabled={isSaving || editRows.length === 0}
                                className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Receta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Personalizado */}
            <ConfirmModal
                isOpen={itemToRemove !== null}
                title="Quitar Insumo de la Receta"
                message={`¿Estás seguro de quitar "${itemToRemove?.insumoNombre}" de la receta?`}
                confirmText="Sí, quitar insumo"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isRemoving}
                onConfirm={confirmarQuitarInsumo}
                onCancel={() => setItemToRemove(null)}
            />
        </div>
    )
}
