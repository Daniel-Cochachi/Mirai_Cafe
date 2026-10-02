import {
    useEffect,
    useState,
} from 'react'

import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { categoryService } from '../../services/categoryService'
import type { Category } from '../../types/category'

const categoryThemes = [
    {
        cardClass: 'bg-[#171717] text-white',
        labelClass: 'text-mirai-accent',
        descriptionClass: 'text-white/55',
        numberClass: 'text-white/15',
        buttonClass: 'bg-white text-black',
    },
    {
        cardClass: 'bg-[#efe2d5] text-[#241b16]',
        labelClass: 'text-mirai-accent-dark',
        descriptionClass: 'text-[#241b16]/60',
        numberClass: 'text-[#241b16]/10',
        buttonClass: 'bg-[#241b16] text-white',
    },
    {
        cardClass: 'bg-mirai-accent text-white',
        labelClass: 'text-white/70',
        descriptionClass: 'text-white/75',
        numberClass: 'text-white/15',
        buttonClass: 'bg-white text-mirai-accent-dark',
    },
    {
        cardClass: 'bg-[#dedbd6] text-[#1c1a18]',
        labelClass: 'text-mirai-accent-dark',
        descriptionClass: 'text-[#1c1a18]/60',
        numberClass: 'text-[#1c1a18]/10',
        buttonClass: 'bg-[#1c1a18] text-white',
    },
]

function normalizeName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}

function getCategoryDescription(
    name: string,
): string {
    const normalizedName = normalizeName(name)

    if (normalizedName.includes('bebida')) {
        return 'Cafés, infusiones y bebidas refrescantes.'
    }

    if (normalizedName.includes('comida')) {
        return 'Opciones preparadas para cualquier momento.'
    }

    if (normalizedName.includes('postre')) {
        return 'Dulces especiales para acompañar tu café.'
    }

    if (normalizedName.includes('snack')) {
        return 'Opciones rápidas, ligeras y deliciosas.'
    }

    return 'Descubre los productos disponibles en esta categoría.'
}

export function CategorySection() {
    const [categories, setCategories] =
        useState<Category[]>([])

    const [isLoading, setIsLoading] =
        useState(true)

    const [error, setError] = useState('')

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setError('')

                const data =
                    await categoryService.getAll()

                setCategories(data)
            } catch {
                setError(
                    'No fue posible cargar las categorías.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadCategories()
    }, [])

    return (
        <section className="bg-[#f4f4f2] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                {/* Encabezado */}
                <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mirai-accent">
                            Nuestro menú
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-mirai-text sm:text-4xl">
                            Explora por categoría
                        </h2>

                        <p className="mt-3 max-w-xl text-base leading-7 text-mirai-muted">
                            Encuentra lo que deseas y descubre nuevas
                            opciones preparadas para ti.
                        </p>
                    </div>

                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-mirai-text transition hover:text-mirai-accent"
                    >
                        Ver todo el menú

                        <ArrowUpRight size={18} />
                    </Link>
                </div>

                {/* Cargando */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="min-h-52 animate-pulse rounded-3xl bg-black/8"
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* Sin categorías */}
                {!isLoading &&
                    !error &&
                    categories.length === 0 && (
                        <div className="rounded-2xl border border-black/10 bg-white px-5 py-10 text-center text-mirai-muted">
                            No hay categorías disponibles.
                        </div>
                    )}

                {/* Categorías */}
                {!isLoading &&
                    !error &&
                    categories.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {categories.map((category, index) => {
                                const theme =
                                    categoryThemes[
                                    index % categoryThemes.length
                                    ]

                                const categoryNumber = String(
                                    index + 1,
                                ).padStart(2, '0')

                                return (
                                    <Link
                                        key={category.id}
                                        to={`/menu?categoryId=${category.id}`}
                                        className={[
                                            'group relative flex min-h-52 flex-col overflow-hidden rounded-3xl p-7',
                                            'transition duration-300 hover:-translate-y-1',
                                            'hover:shadow-[0_18px_45px_rgba(0,0,0,0.16)]',
                                            theme.cardClass,
                                        ].join(' ')}
                                    >
                                        {/* Parte superior */}
                                        <div className="relative z-10 flex items-start justify-between">
                                            <p
                                                className={[
                                                    'text-xs font-bold uppercase tracking-[0.2em]',
                                                    theme.labelClass,
                                                ].join(' ')}
                                            >
                                                Categoría
                                            </p>

                                            <span
                                                className={[
                                                    'text-5xl font-bold leading-none',
                                                    theme.numberClass,
                                                ].join(' ')}
                                            >
                                                {categoryNumber}
                                            </span>
                                        </div>

                                        {/* Información */}
                                        <div className="relative z-10 mt-auto max-w-md pt-8">
                                            <h3 className="text-2xl font-bold">
                                                {category.nombre}
                                            </h3>

                                            <p
                                                className={[
                                                    'mt-3 max-w-sm text-sm leading-6',
                                                    theme.descriptionClass,
                                                ].join(' ')}
                                            >
                                                {getCategoryDescription(
                                                    category.nombre,
                                                )}
                                            </p>
                                        </div>

                                        {/* Botón */}
                                        <span
                                            className={[
                                                'absolute bottom-7 right-7 flex h-11 w-11 items-center justify-center rounded-full',
                                                'transition duration-300',
                                                'group-hover:rotate-45 group-hover:scale-105',
                                                theme.buttonClass,
                                            ].join(' ')}
                                        >
                                            <ArrowUpRight size={19} />
                                        </span>

                                        {/* Línea decorativa */}
                                        <span className="absolute bottom-0 left-7 h-1 w-0 rounded-t-full bg-current opacity-25 transition-all duration-500 group-hover:w-24" />
                                    </Link>
                                )
                            })}
                        </div>
                    )}
            </div>
        </section>
    )
}