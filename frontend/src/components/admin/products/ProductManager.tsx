import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    Coffee,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react'
import axios from 'axios'
import { categoryService } from '../../../services/categoryService'
import { productService } from '../../../services/productService'
import type { ApiError } from '../../../types/auth'
import type { Category } from '../../../types/category'
import type {
    Product,
    ProductRequest,
} from '../../../types/product'
import { ConfirmModal } from '../common/ConfirmModal'

const emptyForm: ProductRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoriaId: 0,
    disponible: true,
    imagenUrl: '',
}

function ProductThumbnail({ src, alt }: { src?: string | null; alt: string }) {
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        setHasError(false)
    }, [src])

    if (!src || hasError) {
        return (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 font-bold shadow-inner">
                <Coffee size={24} />
            </div>
        )
    }

    return (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#141416] shadow-sm">
            <img
                src={src}
                alt={alt}
                onError={() => setHasError(true)}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                loading="lazy"
            />
        </div>
    )
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
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [feedback, setFeedback] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)

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
            setError('No fue posible cargar los datos.')
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
            stock: product.stock,
            categoriaId: product.categoriaId,
            disponible: product.disponible,
            imagenUrl: product.imagenUrl ?? '',
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

    const confirmarEliminarProducto = async () => {
        if (!productToDelete) return
        setIsDeleting(true)

        try {
            await productService.remove(productToDelete.id)
            setFeedback({ texto: `Producto "${productToDelete.nombre}" eliminado correctamente.`, tipo: 'exito' })
            setProductToDelete(null)
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFeedback({
                    texto: requestError.response?.data.message ?? 'No fue posible eliminar el producto.',
                    tipo: 'error',
                })
            } else {
                setFeedback({ texto: 'Ocurrió un error inesperado al eliminar el producto.', tipo: 'error' })
            }
            setProductToDelete(null)
        } finally {
            setIsDeleting(false)
        }
    }

    const toggleAvailability = async (product: Product) => {
        try {
            await productService.updateAvailability(
                product.id,
                !product.disponible,
            )
            setFeedback({
                texto: `Disponibilidad de "${product.nombre}" actualizada a ${!product.disponible ? 'Disponible' : 'Agotado'}.`,
                tipo: 'exito',
            })
            await loadData()
        } catch {
            setFeedback({ texto: 'No fue posible actualizar la disponibilidad.', tipo: 'error' })
        }
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
            {/* Cabecera del Módulo */}
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        Catálogo de Menú
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        Productos de la Carta
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Administración de productos disponibles, precios y control de stock
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={categories.length === 0}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Nuevo Producto</span>
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

            {categories.length === 0 && !isLoading && (
                <p className="mt-5 text-sm text-amber-400">
                    ⚠️ Debes crear al menos una categoría antes de poder registrar productos.
                </p>
            )}

            {/* Carga */}
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
            {!isLoading && !error && products.length === 0 && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    Todavía no hay productos registrados en la carta.
                </div>
            )}

            {/* Lista de Productos */}
            {!isLoading && !error && products.length > 0 && (
                <div className="mt-7 space-y-3.5">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#18181c]/70 p-5 transition-all hover:border-amber-500/30 hover:bg-[#18181c]"
                        >
                            <div className="flex items-center gap-4">
                                <ProductThumbnail src={product.imagenUrl} alt={product.nombre} />

                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-base font-bold text-white sm:text-lg">
                                            {product.nombre}
                                        </h4>
                                        <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/60">
                                            {product.categoriaNombre}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm font-semibold text-white/50">
                                        Precio: <span className="text-amber-400 font-bold">S/ {product.precio.toFixed(2)}</span> • Stock:{' '}
                                        <span className={product.stock <= 5 ? 'text-rose-400 font-bold' : 'text-white'}>
                                            {product.stock} unid.
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                {/* Badge de Disponibilidad */}
                                <button
                                    type="button"
                                    onClick={() => toggleAvailability(product)}
                                    className={[
                                        'rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all',
                                        product.disponible
                                            ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                            : 'border-rose-500/30 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30',
                                    ].join(' ')}
                                >
                                    {product.disponible ? 'Disponible' : 'Agotado'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openEditModal(product)}
                                    aria-label={`Editar ${product.nombre}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/60 transition hover:bg-white/10 hover:text-white"
                                    title="Editar producto"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setProductToDelete(product)}
                                    aria-label={`Eliminar ${product.nombre}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20"
                                    title="Eliminar producto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Crear / Editar Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">
                                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
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

                        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="nombre"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Nombre del Producto
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={form.nombre}
                                    onChange={(event) =>
                                        setForm({ ...form, nombre: event.target.value })
                                    }
                                    placeholder="Ej. Capuccino Vainilla"
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="precio"
                                        className="mb-2 block text-sm font-bold text-white/80"
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
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="stock"
                                        className="mb-2 block text-sm font-bold text-white/80"
                                    >
                                        Stock Inicial
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
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="categoriaId"
                                    className="mb-2 block text-sm font-bold text-white/80"
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
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="imagenUrl"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    URL de Imagen (Opcional)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="imagenUrl"
                                        type="text"
                                        value={form.imagenUrl ?? ''}
                                        onChange={(event) =>
                                            setForm({ ...form, imagenUrl: event.target.value })
                                        }
                                        placeholder="https://..."
                                        disabled={isSaving}
                                        className="h-12 flex-1 rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                    />
                                    {form.imagenUrl ? (
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#16161a]">
                                            <img
                                                src={form.imagenUrl}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    ;(e.currentTarget as HTMLElement).style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                {form.imagenUrl ? (
                                    <p className="mt-1.5 text-xs text-white/40">
                                        Vista previa del producto
                                    </p>
                                ) : null}
                            </div>

                            <label className="flex cursor-pointer items-center gap-3 pt-2">
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
                                    className="h-5 w-5 rounded border-white/20 bg-black/30 accent-amber-500"
                                />
                                <span className="text-sm font-bold text-white/90">
                                    Disponible en la carta inmediatamente
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Personalizado */}
            <ConfirmModal
                isOpen={productToDelete !== null}
                title="Eliminar Producto"
                message={`¿Estás seguro de eliminar el producto "${productToDelete?.nombre}"? Esta acción lo retirará permanentemente de la carta.`}
                confirmText="Sí, eliminar producto"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={confirmarEliminarProducto}
                onCancel={() => setProductToDelete(null)}
            />
        </div>
    )
}
