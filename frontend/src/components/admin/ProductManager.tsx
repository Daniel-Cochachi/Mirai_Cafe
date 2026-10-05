import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    Package,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react'

import axios from 'axios'

import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'

import type { ApiError } from '../../types/auth'
import type { Category } from '../../types/category'

import type {
    Product,
    ProductRequest,
} from '../../types/product'

const emptyForm: ProductRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    imagenUrl: '',
    disponible: true,
    stock: 0,
    categoriaId: 0,
}

export function ProductManager() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<ProductRequest>(emptyForm)
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const loadData = async () => {
        try {
            setIsLoading(true)
            setError('')

            const [productsData, categoriesData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
            ])

            setProducts(productsData)
            setCategories(categoriesData)
        } catch {
            setError('No fue posible cargar los productos.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const openCreateModal = () => {
        setEditingId(null)
        setForm({
            ...emptyForm,
            categoriaId: categories[0]?.id ?? 0,
        })
        setFormError('')
        setIsModalOpen(true)
    }

    const openEditModal = (product: Product) => {
        setEditingId(product.id)
        setForm({
            nombre: product.nombre,
            descripcion: product.descripcion ?? '',
            precio: product.precio,
            imagenUrl: product.imagenUrl ?? '',
            disponible: product.disponible,
            stock: product.stock,
            categoriaId: product.categoriaId,
        })
        setFormError('')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')
        setIsSaving(true)

        try {
            if (editingId) {
                await productService.update(editingId, form)
            } else {
                await productService.create(form)
            }

            closeModal()
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible guardar el producto.',
                )
            } else {
                setFormError('Ocurrió un error inesperado.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (product: Product) => {
        const confirmed = window.confirm(
            `¿Eliminar el producto "${product.nombre}"? Esta acción no se puede deshacer.`,
        )

        if (!confirmed) {
            return
        }

        try {
            await productService.remove(product.id)
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                window.alert(
                    requestError.response?.data.message ??
                    'No fue posible eliminar el producto.',
                )
            } else {
                window.alert('Ocurrió un error inesperado.')
            }
        }
    }

    const toggleAvailability = async (product: Product) => {
        try {
            await productService.updateAvailability(
                product.id,
                !product.disponible,
            )

            await loadData()
        } catch {
            window.alert('No fue posible actualizar la disponibilidad.')
        }
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                        Carta
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Productos
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={categories.length === 0}
                    className="flex items-center gap-2 rounded-xl bg-mirai-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={17} />
                    Nuevo producto
                </button>
            </div>

            {categories.length === 0 && !isLoading && (
                <p className="mt-5 text-sm text-white/40">
                    Crea al menos una categoría antes de agregar productos.
                </p>
            )}

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

            {!isLoading && error && (
                <div
                    role="alert"
                    className="mt-7 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                >
                    {error}
                </div>
            )}

            {!isLoading && !error && products.length === 0 && (
                <p className="mt-7 text-sm text-white/40">
                    Todavía no hay productos registrados.
                </p>
            )}

            {!isLoading && !error && products.length > 0 && (
                <div className="mt-7 space-y-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mirai-accent/10 text-mirai-accent">
                                    <Package size={20} />
                                </div>

                                <div>
                                    <p className="font-semibold text-white">
                                        {product.nombre}
                                    </p>

                                    <p className="mt-1 text-sm text-white/40">
                                        {product.categoriaNombre} · S/ {product.precio.toFixed(2)} · Stock: {product.stock}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleAvailability(product)}
                                    className={[
                                        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                                        product.disponible
                                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
                                    ].join(' ')}
                                >
                                    {product.disponible ? 'Disponible' : 'No disponible'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openEditModal(product)}
                                    aria-label={`Editar ${product.nombre}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(product)}
                                    aria-label={`Eliminar ${product.nombre}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editingId ? 'Editar producto' : 'Nuevo producto'}
                            </h3>

                            <button
                                type="button"
                                onClick={closeModal}
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
                                    htmlFor="nombre"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Nombre
                                </label>

                                <input
                                    id="nombre"
                                    type="text"
                                    value={form.nombre}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            nombre: event.target.value,
                                        })
                                    }
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="descripcion"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Descripción
                                </label>

                                <textarea
                                    id="descripcion"
                                    value={form.descripcion}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            descripcion: event.target.value,
                                        })
                                    }
                                    rows={2}
                                    disabled={isSaving}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="precio"
                                        className="mb-2 block text-sm font-semibold text-white/75"
                                    >
                                        Precio (S/)
                                    </label>

                                    <input
                                        id="precio"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={form.precio}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                precio: Number(event.target.value),
                                            })
                                        }
                                        required
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="stock"
                                        className="mb-2 block text-sm font-semibold text-white/75"
                                    >
                                        Stock
                                    </label>

                                    <input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={form.stock}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                stock: Number(event.target.value),
                                            })
                                        }
                                        required
                                        disabled={isSaving}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="categoriaId"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Categoría
                                </label>

                                <select
                                    id="categoriaId"
                                    value={form.categoriaId}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            categoriaId: Number(event.target.value),
                                        })
                                    }
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="imagenUrl"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    URL de imagen (opcional)
                                </label>

                                <input
                                    id="imagenUrl"
                                    type="text"
                                    value={form.imagenUrl ?? ''}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            imagenUrl: event.target.value,
                                        })
                                    }
                                    placeholder="https://..."
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={form.disponible}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            disponible: event.target.checked,
                                        })
                                    }
                                    disabled={isSaving}
                                    className="h-5 w-5 rounded border-white/20 bg-black/30 accent-mirai-accent"
                                />

                                <span className="text-sm font-semibold text-white/75">
                                    Disponible en el menú
                                </span>
                            </label>

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
        </div>
    )
}