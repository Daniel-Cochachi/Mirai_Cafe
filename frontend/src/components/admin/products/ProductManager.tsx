import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Coffee,
    Layers,
    Pencil,
    Plus,
    Search,
    ShoppingBag,
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

    // Filtros y Búsqueda
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'TODAS'>('TODAS')
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'TODOS' | 'DISPONIBLES' | 'AGOTADOS'>('TODOS')

    // Modal Crear / Editar
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<ProductRequest>(emptyForm)
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Modal Eliminar
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [feedback, setFeedback] = useState<{
        texto: string
        tipo: 'exito' | 'error'
        accion?: { etiqueta: string; ejecutar: () => void }
    } | null>(null)

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
            setError('No fue posible cargar los productos y categorías del catálogo.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Métricas para auditoría
    const stats = useMemo(() => {
        return {
            total: products.length,
            disponibles: products.filter((p) => p.disponible).length,
            agotados: products.filter((p) => !p.disponible).length,
            bajoStock: products.filter((p) => p.stock <= 5).length,
            categorias: categories.length,
        }
    }, [products, categories])

    // Lista filtrada en tiempo real
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const query = searchQuery.trim().toLowerCase()
            const matchesQuery =
                !query ||
                p.nombre.toLowerCase().includes(query) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(query)) ||
                String(p.id).includes(query)

            const matchesCategory =
                selectedCategoryFilter === 'TODAS' || p.categoriaId === selectedCategoryFilter

            const matchesStatus =
                selectedStatusFilter === 'TODOS' ||
                (selectedStatusFilter === 'DISPONIBLES' && p.disponible) ||
                (selectedStatusFilter === 'AGOTADOS' && !p.disponible)

            return matchesQuery && matchesCategory && matchesStatus
        })
    }, [products, searchQuery, selectedCategoryFilter, selectedStatusFilter])

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

        // Sanitización y validaciones preventivas
        const nombreLimpio = form.nombre.trim()
        if (nombreLimpio.length < 2) {
            setFormError('El nombre del producto debe tener al menos 2 caracteres.')
            return
        }

        if (form.precio <= 0) {
            setFormError('El precio del producto debe ser mayor a S/ 0.00.')
            return
        }

        if (form.stock < 0) {
            setFormError('El stock no puede ser un valor negativo.')
            return
        }

        if (!form.categoriaId || form.categoriaId === 0) {
            setFormError('Debes seleccionar una categoría válida.')
            return
        }

        setIsSaving(true)

        try {
            const requestData: ProductRequest = {
                ...form,
                nombre: nombreLimpio,
                descripcion: form.descripcion?.trim() || undefined,
                imagenUrl: form.imagenUrl?.trim() || null,
            }

            if (editingId) {
                await productService.update(editingId, requestData)
                setFeedback({ texto: `Producto "${nombreLimpio}" actualizado correctamente.`, tipo: 'exito' })
            } else {
                await productService.create(requestData)
                setFeedback({ texto: `Producto "${nombreLimpio}" agregado al catálogo con éxito.`, tipo: 'exito' })
            }
            closeModal()
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible guardar el producto. Revisa los datos ingresados.',
                )
            } else {
                setFormError('Ocurrió un error inesperado al conectar con el servidor.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const confirmarEliminarProducto = async () => {
        if (!productToDelete) return
        const prod = productToDelete
        setIsDeleting(true)

        try {
            await productService.remove(prod.id)
            setFeedback({ texto: `Producto "${prod.nombre}" retirado de la carta.`, tipo: 'exito' })
            setProductToDelete(null)
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                // Mensaje amigable cuando tiene pedidos o recetas asociadas (Error 409)
                if (requestError.response?.status === 409) {
                    setFeedback({
                        texto: 'No se puede eliminar porque tiene pedidos o recetas asociadas.',
                        tipo: 'error',
                        accion: {
                            etiqueta: 'Marcar como Agotado ahora',
                            ejecutar: () => toggleAvailability(prod),
                        },
                    })
                } else {
                    setFeedback({
                        texto: requestError.response?.data.message ?? 'No fue posible eliminar el producto.',
                        tipo: 'error',
                    })
                }
            } else {
                setFeedback({ texto: 'Error inesperado al intentar eliminar el producto.', tipo: 'error' })
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
                texto: `"${product.nombre}" ahora está marcado como ${!product.disponible ? 'Disponible' : 'Agotado'}.`,
                tipo: 'exito',
            })
            await loadData()
        } catch {
            setFeedback({ texto: 'No fue posible cambiar la disponibilidad del producto.', tipo: 'error' })
        }
    }

    return (
        <div className="space-y-6">
            {/* 1. Tarjetas de Auditoría (KPIs) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-[#121215] p-4">
                    <div className="flex items-center justify-between text-white/40">
                        <span className="text-xs font-semibold">Total Carta</span>
                        <Coffee size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-white">{stats.total}</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-center justify-between text-emerald-300/60">
                        <span className="text-xs font-semibold">Disponibles</span>
                        <CheckCircle2 size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-emerald-300">{stats.disponibles}</p>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                    <div className="flex items-center justify-between text-rose-300/60">
                        <span className="text-xs font-semibold">Agotados</span>
                        <AlertCircle size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-rose-300">{stats.agotados}</p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center justify-between text-amber-300/60">
                        <span className="text-xs font-semibold">Bajo Stock (≤5)</span>
                        <AlertTriangle size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-amber-300">{stats.bajoStock}</p>
                </div>

                <div className="col-span-2 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 sm:col-span-1">
                    <div className="flex items-center justify-between text-sky-300/60">
                        <span className="text-xs font-semibold">Categorías</span>
                        <Layers size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-sky-300">{stats.categorias}</p>
                </div>
            </div>

            {/* 2. Tarjeta Principal */}
            <div className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-9 shadow-xl">
                {/* Cabecera */}
                <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                            Catálogo Oficial
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                            Productos de la Carta
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                            Administración de carta, precios, control de inventario y disponibilidad
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={categories.length === 0}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Nuevo Producto</span>
                    </button>
                </div>

                {/* Notificación Toast Flotante Fija (Siempre visible sin importar el scroll) */}
                {feedback && (
                    <div className="fixed bottom-6 right-6 z-[120] flex max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-[#16161a]/95 p-4 text-xs font-bold shadow-2xl backdrop-blur-md transition-all">
                        <div className="mt-0.5">
                            {feedback.tipo === 'exito' ? (
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            ) : (
                                <AlertCircle size={18} className="text-rose-400" />
                            )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <span className={feedback.tipo === 'exito' ? 'text-emerald-300' : 'text-rose-300'}>
                                {feedback.texto}
                            </span>
                            {feedback.accion && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        feedback.accion?.ejecutar()
                                        setFeedback(null)
                                    }}
                                    className="self-start rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-extrabold text-black shadow-md transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                                >
                                    {feedback.accion.etiqueta}
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setFeedback(null)}
                            className="p-1 text-white/40 hover:text-white"
                            aria-label="Cerrar notificación"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {categories.length === 0 && !isLoading && (
                    <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-semibold text-amber-300">
                        ⚠️ Debes registrar al menos una categoría en el módulo de "Categorías" antes de crear productos.
                    </div>
                )}

                {/* Barra de Búsqueda y Filtros */}
                <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, descripción o ID..."
                            className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] pl-11 pr-10 text-sm text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filtro por Categoría */}
                        <div className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-[#16161a] p-1">
                            <button
                                type="button"
                                onClick={() => setSelectedCategoryFilter('TODAS')}
                                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${selectedCategoryFilter === 'TODAS'
                                        ? 'bg-amber-500 text-black shadow-sm'
                                        : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                Todas
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setSelectedCategoryFilter(c.id)}
                                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${selectedCategoryFilter === c.id
                                            ? 'bg-amber-500 text-black shadow-sm'
                                            : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    {c.nombre}
                                </button>
                            ))}
                        </div>

                        {/* Filtro por Disponibilidad */}
                        <div className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-[#16161a] p-1">
                            {(['TODOS', 'DISPONIBLES', 'AGOTADOS'] as const).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedStatusFilter(s)}
                                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${selectedStatusFilter === s
                                            ? 'bg-white/20 text-white shadow-sm'
                                            : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Estado de Carga */}
                {isLoading && (
                    <div className="mt-7 space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/5" />
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
                {!isLoading && !error && filteredProducts.length === 0 && (
                    <div className="py-14 text-center">
                        <ShoppingBag size={32} className="mx-auto text-white/20" />
                        <p className="mt-3 text-sm font-medium text-white/40">
                            No se encontraron productos que coincidan con la búsqueda.
                        </p>
                    </div>
                )}

                {/* Lista de Productos */}
                {!isLoading && !error && filteredProducts.length > 0 && (
                    <div className="mt-7 space-y-3.5">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#18181c]/70 p-5 transition-all hover:border-amber-500/30 hover:bg-[#18181c] sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <ProductThumbnail src={product.imagenUrl} alt={product.nombre} />

                                    <div>
                                        <div className="flex items-center gap-2.5">
                                            <h4 className="text-base font-bold text-white sm:text-lg">
                                                {product.nombre}
                                            </h4>
                                            <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/60">
                                                {product.categoriaNombre}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm font-semibold text-white/50">
                                            Precio: <span className="font-bold text-amber-400">S/ {product.precio.toFixed(2)}</span> • Stock:{' '}
                                            <span className={product.stock <= 5 ? 'font-bold text-rose-400' : 'text-white'}>
                                                {product.stock} unid.
                                                {product.stock <= 5 && ' (Bajo)'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    {/* Toggle de Disponibilidad */}
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

                                    {/* Editar */}
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(product)}
                                        aria-label={`Editar ${product.nombre}`}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/60 transition hover:bg-white/10 hover:text-white"
                                        title="Editar producto"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    {/* Eliminar */}
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
            </div>

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
                                    className="mb-1.5 block text-xs font-bold text-white/80"
                                >
                                    Nombre del Producto *
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    required
                                    minLength={2}
                                    value={form.nombre}
                                    onChange={(event) =>
                                        setForm({ ...form, nombre: event.target.value })
                                    }
                                    placeholder="Ej. Capuccino Vainilla"
                                    disabled={isSaving}
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="precio"
                                        className="mb-1.5 block text-xs font-bold text-white/80"
                                    >
                                        Precio (S/) *
                                    </label>
                                    <input
                                        id="precio"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={form.precio === 0 ? '' : form.precio}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                precio: Number(event.target.value),
                                            })
                                        }
                                        placeholder="0.00"
                                        disabled={isSaving}
                                        className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="stock"
                                        className="mb-1.5 block text-xs font-bold text-white/80"
                                    >
                                        Stock Inicial *
                                    </label>
                                    <input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        required
                                        value={form.stock}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                stock: Number(event.target.value),
                                            })
                                        }
                                        disabled={isSaving}
                                        className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="categoriaId"
                                    className="mb-1.5 block text-xs font-bold text-white/80"
                                >
                                    Categoría *
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
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
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
                                    htmlFor="descripcion"
                                    className="mb-1.5 block text-xs font-bold text-white/80"
                                >
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    id="descripcion"
                                    rows={2}
                                    value={form.descripcion ?? ''}
                                    onChange={(event) =>
                                        setForm({ ...form, descripcion: event.target.value })
                                    }
                                    placeholder="Breve reseña del producto..."
                                    disabled={isSaving}
                                    className="w-full rounded-2xl border border-white/10 bg-[#16161a] p-3 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="imagenUrl"
                                    className="mb-1.5 block text-xs font-bold text-white/80"
                                >
                                    URL de Imagen (Opcional)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="imagenUrl"
                                        type="url"
                                        value={form.imagenUrl ?? ''}
                                        onChange={(event) =>
                                            setForm({ ...form, imagenUrl: event.target.value })
                                        }
                                        placeholder="https://..."
                                        disabled={isSaving}
                                        className="h-11 flex-1 rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                    />
                                    {form.imagenUrl ? (
                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-amber-500/30 bg-[#16161a]">
                                            <img
                                                src={form.imagenUrl}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    ; (e.currentTarget as HTMLElement).style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
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
                                className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Eliminar */}
            <ConfirmModal
                isOpen={productToDelete !== null}
                title="Eliminar Producto"
                message={`¿Estás seguro de retirar "${productToDelete?.nombre}" de la carta? Si tiene recetas o pedidos asociados, el sistema te sugerirá cambiarlo a Agotado.`}
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
