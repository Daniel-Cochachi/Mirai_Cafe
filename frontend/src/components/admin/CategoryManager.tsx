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

import { categoryService } from '../../services/categoryService'

import type { ApiError } from '../../types/auth'

import type {
    Category,
    CategoryRequest,
} from '../../types/category'

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

    const handleDelete = async (category: Category) => {
        const confirmed = window.confirm(
            `¿Eliminar la categoría "${category.nombre}"? Esta acción no se puede deshacer.`,
        )

        if (!confirmed) {
            return
        }

        try {
            await categoryService.remove(category.id)
            await loadCategories()
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                window.alert(
                    requestError.response?.data.message ??
                    'No fue posible eliminar la categoría.',
                )
            } else {
                window.alert('Ocurrió un error inesperado.')
            }
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
                        Categorías
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-xl bg-mirai-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark"
                >
                    <Plus size={17} />
                    Nueva categoría
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

            {!isLoading && !error && categories.length === 0 && (
                <p className="mt-7 text-sm text-white/40">
                    Todavía no hay categorías registradas.
                </p>
            )}

            {!isLoading && !error && categories.length > 0 && (
                <div className="mt-7 space-y-3">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-5"
                        >
                            <div>
                                <p className="font-semibold text-white">
                                    {category.nombre}
                                </p>

                                {category.descripcion && (
                                    <p className="mt-1 text-sm text-white/40">
                                        {category.descripcion}
                                    </p>
                                )}
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(category)}
                                    aria-label={`Editar ${category.nombre}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(category)}
                                    aria-label={`Eliminar ${category.nombre}`}
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-7">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editingId ? 'Editar categoría' : 'Nueva categoría'}
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
                                    rows={3}
                                    disabled={isSaving}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

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