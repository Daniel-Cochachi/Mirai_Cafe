import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react'

import axios from 'axios'

import { ingredientService } from '../../services/ingredientService'
import { productService } from '../../services/productService'
import { recipeService } from '../../services/recipeService'

import type { ApiError } from '../../types/auth'

import type { Product } from '../../types/product'

import type {
    Insumo,
    Receta,
    RecetaItemRequest,
} from '../../types/inventory'

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

    const handleDelete = async (insumoId: number, insumoNombre: string) => {
        const confirmed = window.confirm(
            `¿Quitar el insumo "${insumoNombre}" de la receta?`,
        )

        if (!confirmed) {
            return
        }

        try {
            await recipeService.removeItem(productoId, insumoId)
            await loadReceta(productoId)
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                window.alert(
                    requestError.response?.data.message ??
                    'No fue posible quitar el insumo de la receta.',
                )
            } else {
                window.alert('Ocurrió un error inesperado.')
            }
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
        <div className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                        Preparación
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Recetas
                    </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select
                        value={productoId || ''}
                        onChange={(event) => setProductoId(Number(event.target.value))}
                        disabled={isLoading}
                        aria-label="Producto"
                        className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="" disabled>
                            Selecciona un producto
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
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-mirai-accent/50 hover:text-white"
                        >
                            <Pencil size={16} />
                            Editar receta
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
                        className="flex items-center gap-2 rounded-xl bg-mirai-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Plus size={17} />
                        Agregar insumo
                    </button>
                </div>
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

            {!isLoading && !error && productos.length === 0 && (
                <p className="mt-7 text-sm text-white/40">
                    No hay productos disponibles para crear recetas.
                </p>
            )}

            {!isLoading && !error && receta && receta.items.length === 0 && (
                <p className="mt-7 text-sm text-white/40">
                    El producto "{receta.productoNombre}" todavía no tiene insumos en su receta.
                </p>
            )}

            {!isLoading && !error && receta && receta.items.length > 0 && (
                <div className="mt-7 space-y-3">
                            {receta.items.map((item) => {
                                const insumo = insumoById(item.insumoId)
                                const inactivo = insumo ? !insumo.activo : false

                                return (
                                    <div
                                        key={item.insumoId}
                                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-5"
                                    >
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-white">
                                                    {item.insumoNombre}
                                                </p>

                                                {inactivo && (
                                                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-300">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm text-white/40">
                                                {item.cantidad} {item.unidad} por unidad del producto
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.insumoId, item.insumoNombre)}
                                            aria-label={`Quitar ${item.insumoNombre}`}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )
                            })}
                </div>
            )}

            {isAddOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                Agregar insumo a la receta
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
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
                            onSubmit={handleAdd}
                        >
                            {insumosDisponibles.length === 0 && (
                                <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/45">
                                    No hay insumos disponibles para agregar:
                                    todos los insumos activos ya están en la receta.
                                </p>
                            )}

                            <div>
                                <label
                                    htmlFor="receta-insumo"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Insumo
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
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Cantidad por unidad
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
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving || insumosDisponibles.length === 0}
                                className="flex h-12 w-full items-center justify-center rounded-xl bg-mirai-accent px-5 font-semibold text-white transition hover:bg-mirai-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Agregando...' : 'Agregar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isEditOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                Editar receta
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
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
                            className="mt-6 space-y-4"
                            onSubmit={handleSaveEdit}
                        >
                            {editRows.map((row) => {
                                const insumo = insumoById(row.insumoId)
                                const inactivo = insumo ? !insumo.activo : false

                                return (
                                    <div
                                        key={row.key}
                                        className={[
                                            'flex items-end gap-3 rounded-2xl border bg-black/20 p-4',
                                            inactivo ? 'border-red-500/30' : 'border-white/8',
                                        ].join(' ')}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate font-semibold text-white">
                                                    {insumo?.nombre ?? 'Insumo'}
                                                </p>

                                                {inactivo && (
                                                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-300">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>

                                            {inactivo && (
                                                <p className="mt-1 text-xs font-semibold text-red-300">
                                                    Quita este insumo para poder guardar la receta.
                                                </p>
                                            )}

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
                                                className="mt-2 h-10 w-32 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                            <p className="mt-1 text-xs text-white/35">
                                                {insumo?.unidad}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditRows(editRows.filter((item) => item.key !== row.key))
                                            }
                                            aria-label="Quitar fila"
                                            disabled={isSaving}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )
                            })}

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
                                        className="flex items-center gap-2 text-sm font-semibold text-mirai-accent transition hover:text-white"
                                    >
                                        <Plus size={15} />
                                        Agregar fila
                                    </button>
                                )
                            })()}

                            <button
                                type="submit"
                                disabled={isSaving || editRows.length === 0}
                                className="flex h-12 w-full items-center justify-center rounded-xl bg-mirai-accent px-5 font-semibold text-white transition hover:bg-mirai-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar receta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
