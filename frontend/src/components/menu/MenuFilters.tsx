import {
    Search,
    X,
} from 'lucide-react'

import type { Category } from '../../types/category'

interface MenuFiltersProps {
    categories: Category[]
    selectedCategoryId: number | null
    search: string
    isLoadingCategories?: boolean
    onCategoryChange: (categoryId: number | null) => void
    onSearchChange: (value: string) => void
}

export function MenuFilters({
    categories,
    selectedCategoryId,
    search,
    isLoadingCategories = false,
    onCategoryChange,
    onSearchChange,
}: MenuFiltersProps) {
    const hasSearch = search.trim().length > 0

    return (
        <section className="relative z-20 -mt-44 bg-transparent px-4 pb-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                {/* Buscador flotante */}
                <div className="relative rounded-2xl border border-mirai-accent/35 bg-[#121212] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
                    <Search
                        size={21}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-mirai-accent"
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder="Buscar cafés, comidas, bebidas o postres..."
                        aria-label="Buscar productos"
                        className="h-14 w-full rounded-xl bg-transparent pl-14 pr-14 text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
                    />

                    {hasSearch && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            aria-label="Limpiar búsqueda"
                            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/5 text-white/45 transition hover:bg-white/10 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Encabezado */}
                <div className="mb-5 mt-8 flex items-end justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-mirai-accent">
                            Explorar
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-white">
                            Categorías
                        </h2>
                    </div>

                    <p className="hidden text-xs text-white/35 sm:block">
                        Filtra los productos de la carta
                    </p>
                </div>

                {/* Categorías sin iconos */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    <button
                        type="button"
                        onClick={() => onCategoryChange(null)}
                        className={[
                            'h-12 shrink-0 rounded-xl border px-6 text-sm font-semibold transition duration-300',
                            selectedCategoryId === null
                                ? 'border-mirai-accent bg-mirai-accent text-white'
                                : 'border-white/10 bg-[#171717] text-white/55 hover:border-mirai-accent/60 hover:text-white',
                        ].join(' ')}
                    >
                        Todos los productos
                    </button>

                    {isLoadingCategories
                        ? [1, 2, 3, 4].map((item) => (
                            <span
                                key={item}
                                className="h-12 w-28 shrink-0 animate-pulse rounded-xl bg-white/5"
                            />
                        ))
                        : categories.map((category) => {
                            const isSelected =
                                selectedCategoryId === category.id

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        onCategoryChange(category.id)
                                    }
                                    className={[
                                        'h-12 shrink-0 rounded-xl border px-6 text-sm font-semibold transition duration-300',
                                        isSelected
                                            ? 'border-mirai-accent bg-mirai-accent text-white'
                                            : 'border-white/10 bg-[#171717] text-white/55 hover:border-mirai-accent/60 hover:text-white',
                                    ].join(' ')}
                                >
                                    {category.nombre}
                                </button>
                            )
                        })}
                </div>
            </div>
        </section>
    )
}