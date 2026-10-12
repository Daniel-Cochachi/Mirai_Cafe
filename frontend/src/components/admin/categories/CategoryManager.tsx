import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    Pencil,
    Plus,
    Tag,
    Trash2,
    X,
} from 'lucide-react'
import axios from 'axios'
import { categoryService } from '../../../services/categoryService'
import type { ApiError } from '../../../types/auth'
import type {
    Category,
    CategoryRequest,
} from '../../../types/category'
import { ConfirmModal } from '../common/ConfirmModal'

const emptyForm: CategoryRequest = {
    nombre: '',
    descripcion: '',
}

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<CategoryRequest>(emptyForm)
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [feedback, setFeedback] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)

    const loadCategories = async () => {
        try {
            setIsLoading(true)
            setError('')
            const data = await categoryService.getAll()
            setCategories(data)
        } catch {
            setError('No fue posible cargar las categorías.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

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

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError('')
        setIsSaving(true)

        try {
            if (editingId) {
                await categoryService.update(editingId, form)
            } else {
                await categoryService.create(form)
            }

            closeModal()
            await loadCategories()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFormError(
                    requestError.response?.data.message ??
                    'No fue posible guardar la categoría.',
                )
            } else {
                setFormError('Ocurrió un error inesperado.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const confirmarEliminarCategoria = async () => {
        if (!categoryToDelete) return
        setIsDeleting(true)

        try {
            await categoryService.remove(categoryToDelete.id)
            setFeedback({ texto: `Categoría "${categoryToDelete.nombre}" eliminada correctamente.`, tipo: 'exito' })
            setCategoryToDelete(null)
            await loadCategories()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setFeedback({
                    texto: requestError.response?.data.message ?? 'No fue posible eliminar la categoría.',
                    tipo: 'error',
                })
            } else {
                setFeedback({ texto: 'Ocurrió un error inesperado al eliminar la categoría.', tipo: 'error' })
            }
            setCategoryToDelete(null)
        } finally {
            setIsDeleting(false)
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
                        Categorías
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Clasificación general de productos (Bebidas, Comidas, Postres, etc.)
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Nueva Categoría</span>
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
            {!isLoading && !error && categories.length === 0 && (
                <div className="py-14 text-center text-sm font-medium text-white/40">
                    Todavía no hay categorías registradas en la cafetería.
                </div>
            )}

            {/* Lista de Categorías */}
            {!isLoading && !error && categories.length > 0 && (
                <div className="mt-7 space-y-3.5">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#18181c]/70 p-5 transition-all hover:border-amber-500/30 hover:bg-[#18181c]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 font-bold">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white sm:text-lg">
                                        {category.nombre}
                                    </h4>
                                    {category.descripcion && (
                                        <p className="mt-0.5 text-sm text-white/50">
                                            {category.descripcion}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(category)}
                                    aria-label={`Editar ${category.nombre}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/60 transition hover:bg-white/10 hover:text-white"
                                    title="Editar categoría"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCategoryToDelete(category)}
                                    aria-label={`Eliminar ${category.nombre}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20"
                                    title="Eliminar categoría"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="nombre"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Nombre de Categoría
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={form.nombre}
                                    onChange={(event) =>
                                        setForm({ ...form, nombre: event.target.value })
                                    }
                                    placeholder="Ej. Bebidas Calientes"
                                    required
                                    disabled={isSaving}
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="descripcion"
                                    className="mb-2 block text-sm font-bold text-white/80"
                                >
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    id="descripcion"
                                    value={form.descripcion}
                                    onChange={(event) =>
                                        setForm({ ...form, descripcion: event.target.value })
                                    }
                                    placeholder="Breve detalle sobre lo que incluye esta categoría..."
                                    rows={3}
                                    disabled={isSaving}
                                    className="w-full rounded-2xl border border-white/10 bg-[#16161a] p-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Personalizado */}
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
        </div>
    )
}
