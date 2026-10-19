import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'
import {
    AlertCircle,
    Check,
    FolderCheck,
    FolderX,
    Layers,
    Pencil,
    Plus,
    Search,
    Tag,
    Trash2,
    X,
} from 'lucide-react'
import axios from 'axios'
import { categoryService } from '../../../services/categoryService'
import { productService } from '../../../services/productService'
import type { ApiError } from '../../../types/auth'
import type {
    Category,
    CategoryRequest,
} from '../../../types/category'
import type { Product } from '../../../types/product'
import { ConfirmModal } from '../common/ConfirmModal'

interface ToastNotification {
    tipo: 'exito' | 'error' | 'advertencia'
    mensaje: string
}

type CategoryFilter = 'todas' | 'con-productos' | 'vacias'

const emptyForm: CategoryRequest = {
    nombre: '',
    descripcion: '',
}

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // Filtros y Búsqueda
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<CategoryFilter>('todas')

    // Modal Crear/Editar
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<CategoryRequest>(emptyForm)
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Modal Eliminar
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Toast flotante
    const [toast, setToast] = useState<ToastNotification | null>(null)

    // Auto-dismiss del toast
    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => setToast(null), 4500)
        return () => clearTimeout(timer)
    }, [toast])

    // Carga de datos
    const loadData = async () => {
        try {
            setIsLoading(true)
            setError('')
            const [categoriesData, productsData] = await Promise.all([
                categoryService.getAll(),
                productService.getAll(),
            ])
            setCategories(categoriesData)
            setProducts(productsData)
        } catch {
            setError('No fue posible cargar las categorías y productos asociados.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Mapeo de conteo de productos por categoría
    const productCountByCategory = useMemo(() => {
        const counts: Record<number, number> = {}
        products.forEach((p) => {
            counts[p.categoriaId] = (counts[p.categoriaId] || 0) + 1
        })
        return counts
    }, [products])

    // KPIs Audit Cards
    const kpis = useMemo(() => {
        const total = categories.length
        let conProductos = 0
        let vacias = 0
        let mayorOferta = { nombre: 'Ninguna', count: 0 }

        categories.forEach((cat) => {
            const count = productCountByCategory[cat.id] || 0
            if (count > 0) {
                conProductos++
                if (count > mayorOferta.count) {
                    mayorOferta = { nombre: cat.nombre, count }
                }
            } else {
                vacias++
            }
        })

        return {
            total,
            conProductos,
            vacias,
            mayorOferta,
        }
    }, [categories, productCountByCategory])

    // Filtrado en vivo
    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return categories.filter((cat) => {
            const count = productCountByCategory[cat.id] || 0

            // Filtro por estado
            if (statusFilter === 'con-productos' && count === 0) return false
            if (statusFilter === 'vacias' && count > 0) return false

            // Filtro por texto
            if (!query) return true
            const matchesNombre = cat.nombre.toLowerCase().includes(query)
            const matchesDesc = (cat.descripcion ?? '').toLowerCase().includes(query)

            return matchesNombre || matchesDesc
        })
    }, [categories, productCountByCategory, searchQuery, statusFilter])

    // Handlers de Modales
    const openCreateModal = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormError('')
        setIsModalOpen(true)
    }

    const openEditModal = (category: Category) => {
        setEditingId(category.id)
        setForm({
            nombre: category.nombre,
            descripcion: category.descripcion ?? '',
        })
        setFormError('')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    // Submit Crear / Editar
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')

        const cleanNombre = form.nombre.trim()
        const cleanDesc = form.descripcion?.trim() || ''

        if (cleanNombre.length < 2) {
            setFormError('El nombre de la categoría debe tener al menos 2 caracteres.')
            return
        }

        if (cleanNombre.length > 80) {
            setFormError('El nombre no puede exceder los 80 caracteres.')
            return
        }

        if (cleanDesc.length > 200) {
            setFormError('La descripción no puede exceder los 200 caracteres.')
            return
        }

        // Validación de duplicados en el cliente
        const yaExiste = categories.some(
            (c) =>
                c.id !== editingId &&
                c.nombre.trim().toLowerCase() === cleanNombre.toLowerCase()
        )

        if (yaExiste) {
            setFormError(`Ya existe una categoría registrada con el nombre "${cleanNombre}".`)
            return
        }

        setIsSaving(true)

        try {
            const payload: CategoryRequest = {
                nombre: cleanNombre,
                descripcion: cleanDesc || undefined,
            }

            if (editingId) {
                await categoryService.update(editingId, payload)
                setToast({
                    tipo: 'exito',
                    mensaje: `Categoría "${cleanNombre}" actualizada exitosamente.`,
                })
            } else {
                await categoryService.create(payload)
                setToast({
                    tipo: 'exito',
                    mensaje: `Categoría "${cleanNombre}" creada exitosamente.`,
                })
            }

            closeModal()
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible guardar la categoría.',
                )
            } else {
                setFormError('Ocurrió un error inesperado al procesar la categoría.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    // Intentar eliminar
    const handleTryDelete = (category: Category) => {
        const count = productCountByCategory[category.id] || 0
        if (count > 0) {
            setToast({
                tipo: 'advertencia',
                mensaje: `No se puede eliminar "${category.nombre}" porque tiene ${count} ${
                    count === 1 ? 'producto asociado' : 'productos asociados'
                }. Reasigna o elimina los productos primero.`,
            })
            return
        }

        setCategoryToDelete(category)
    }

    // Confirmar eliminación
    const confirmarEliminarCategoria = async () => {
        if (!categoryToDelete) return
        setIsDeleting(true)

        try {
            await categoryService.remove(categoryToDelete.id)
            setToast({
                tipo: 'exito',
                mensaje: `Categoría "${categoryToDelete.nombre}" eliminada exitosamente.`,
            })
            setCategoryToDelete(null)
            await loadData()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setToast({
                    tipo: 'error',
                    mensaje:
                        requestError.response?.data.message ??
                        'No fue posible eliminar la categoría.',
                })
            } else {
                setToast({
                    tipo: 'error',
                    mensaje: 'Ocurrió un error inesperado al eliminar la categoría.',
                })
            }
            setCategoryToDelete(null)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-7">
            {/* KPI Cards Audit */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Categorías */}
                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Total Categorías
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                            <Layers size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-white">{kpis.total}</p>
                    <p className="mt-1 text-xs text-white/40">Registradas en el catálogo</p>
                </div>

                {/* Con Productos */}
                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Con Productos
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                            <FolderCheck size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-emerald-400">{kpis.conProductos}</p>
                    <p className="mt-1 text-xs text-white/40">Visibles con oferta en carta</p>
                </div>

                {/* Categorías Vacías */}
                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Categorías Vacías
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                            <FolderX size={18} />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-black text-rose-400">{kpis.vacias}</p>
                    <p className="mt-1 text-xs text-white/40">Sin productos asignados</p>
                </div>

                {/* Mayor Oferta */}
                <div className="rounded-3xl border border-white/10 bg-[#141418] p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Mayor Oferta
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                            <Tag size={18} />
                        </div>
                    </div>
                    <p className="mt-3 truncate text-xl font-black text-white" title={kpis.mayorOferta.nombre}>
                        {kpis.mayorOferta.nombre}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                        {kpis.mayorOferta.count > 0
                            ? `${kpis.mayorOferta.count} productos registrados`
                            : 'Sin productos registrados'}
                    </p>
                </div>
            </div>

            {/* Panel Principal */}
            <div className="rounded-3xl border border-white/10 bg-[#121215] p-7 sm:p-9 shadow-xl">
                {/* Cabecera y Acciones */}
                <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                            Catálogo de Menú
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                            Categorías
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                            Clasificación de comidas, bebidas y postres de Mirai Café
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Nueva Categoría</span>
                    </button>
                </div>

                {/* Barra de Filtros y Búsqueda */}
                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Buscador */}
                    <div className="relative w-full max-w-md">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar categoría por nombre o descripción..."
                            className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] pl-11 pr-10 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Pills de Filtrado */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('todas')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                statusFilter === 'todas'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            Todas ({categories.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('con-productos')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                statusFilter === 'con-productos'
                                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            Con Productos ({kpis.conProductos})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('vacias')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                statusFilter === 'vacias'
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            Vacías ({kpis.vacias})
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="mt-7 space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-24 animate-pulse rounded-2xl bg-white/5"
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

                {/* Vacío Total */}
                {!isLoading && !error && categories.length === 0 && (
                    <div className="py-16 text-center text-sm font-medium text-white/40">
                        Todavía no hay categorías registradas en la cafetería.
                    </div>
                )}

                {/* Sin Resultados de Búsqueda */}
                {!isLoading && !error && categories.length > 0 && filteredCategories.length === 0 && (
                    <div className="py-16 text-center text-sm font-medium text-white/40">
                        No se encontraron categorías que coincidan con los filtros aplicados.
                    </div>
                )}

                {/* Lista de Categorías */}
                {!isLoading && !error && filteredCategories.length > 0 && (
                    <div className="mt-7 space-y-3.5">
                        {filteredCategories.map((category) => {
                            const count = productCountByCategory[category.id] || 0
                            const hasProducts = count > 0

                            return (
                                <div
                                    key={category.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#18181c]/70 p-5 transition-all hover:border-amber-500/30 hover:bg-[#18181c] sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 font-bold">
                                            <Tag size={20} />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h4 className="text-base font-bold text-white sm:text-lg">
                                                    {category.nombre}
                                                </h4>

                                                {/* Badge de Productos */}
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        hasProducts
                                                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                            : 'border border-white/10 bg-white/5 text-white/45'
                                                    }`}
                                                >
                                                    {count} {count === 1 ? 'producto' : 'productos'}
                                                </span>
                                            </div>

                                            {category.descripcion ? (
                                                <p className="mt-1 text-sm text-white/50 leading-relaxed">
                                                    {category.descripcion}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs italic text-white/25">
                                                    Sin descripción especificada
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(category)}
                                            aria-label={`Editar ${category.nombre}`}
                                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/70 transition hover:bg-white/10 hover:text-white"
                                            title="Editar categoría"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleTryDelete(category)}
                                            aria-label={`Eliminar ${category.nombre}`}
                                            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${
                                                hasProducts
                                                    ? 'border-white/5 bg-white/5 text-white/30 hover:border-amber-500/30 hover:text-amber-400'
                                                    : 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                            }`}
                                            title={
                                                hasProducts
                                                    ? `Protegida: contiene ${count} productos asociados`
                                                    : 'Eliminar categoría'
                                            }
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Crear / Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">
                                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Cerrar"
                                className="cursor-pointer rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white transition"
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

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                            {/* Nombre */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="nombre"
                                        className="text-xs font-bold uppercase tracking-wider text-white/70"
                                    >
                                        Nombre de Categoría
                                    </label>
                                    <span className={`text-[11px] ${form.nombre.length > 70 ? 'text-amber-400' : 'text-white/35'}`}>
                                        {form.nombre.length}/80
                                    </span>
                                </div>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={form.nombre}
                                    maxLength={80}
                                    onChange={(event) =>
                                        setForm({ ...form, nombre: event.target.value })
                                    }
                                    placeholder="Ej. Bebidas Calientes"
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="descripcion"
                                        className="text-xs font-bold uppercase tracking-wider text-white/70"
                                    >
                                        Descripción (Opcional)
                                    </label>
                                    <span className={`text-[11px] ${(form.descripcion?.length || 0) > 180 ? 'text-amber-400' : 'text-white/35'}`}>
                                        {form.descripcion?.length || 0}/200
                                    </span>
                                </div>
                                <textarea
                                    id="descripcion"
                                    value={form.descripcion}
                                    maxLength={200}
                                    onChange={(event) =>
                                        setForm({ ...form, descripcion: event.target.value })
                                    }
                                    placeholder="Breve detalle sobre lo que incluye esta categoría..."
                                    rows={3}
                                    disabled={isSaving}
                                    className="w-full rounded-2xl border border-white/10 bg-[#16161a] p-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSaving}
                                    className="flex-1 cursor-pointer rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white/70 hover:bg-white/10 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 cursor-pointer rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Eliminar */}
            <ConfirmModal
                isOpen={categoryToDelete !== null}
                title="Eliminar Categoría"
                message={`¿Estás seguro de eliminar la categoría "${categoryToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar categoría"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={confirmarEliminarCategoria}
                onCancel={() => setCategoryToDelete(null)}
            />

            {/* Floating Toast Notification */}
            {toast && (
                <div
                    role="alert"
                    className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${
                        toast.tipo === 'exito'
                            ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
                            : toast.tipo === 'advertencia'
                            ? 'border-amber-500/30 bg-amber-950/80 text-amber-200'
                            : 'border-rose-500/30 bg-rose-950/80 text-rose-200'
                    }`}
                >
                    {toast.tipo === 'exito' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check size={16} />
                        </div>
                    ) : toast.tipo === 'advertencia' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                            <AlertCircle size={16} />
                        </div>
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                            <X size={16} />
                        </div>
                    )}
                    <span className="text-sm font-medium">{toast.mensaje}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 cursor-pointer text-white/40 hover:text-white"
                        aria-label="Cerrar notificación"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
