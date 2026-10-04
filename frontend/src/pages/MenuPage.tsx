import { Footer } from '../components/layout/footer'
import { Navbar } from '../components/layout/Navbar'
import { MenuFilters } from '../components/menu/MenuFilters'
import { MenuHeader } from '../components/menu/MenuHeader'
import { ProductGrid } from '../components/menu/ProductGrid'

import { useMenu } from '../hooks/useMenu'

export function MenuPage() {
    const {
        categories,
        products,
        selectedCategoryId,
        searchTerm,
        isLoadingCategories,
        isLoadingProducts,
        productsError,
        hasActiveFilters,
        handleCategoryChange,
        handleSearchChange,
        clearFilters,
    } = useMenu()

    return (
        <>
            <Navbar />

            <main className="bg-[#0a0a0a]">
                <MenuHeader />

                <MenuFilters
                    categories={categories}
                    selectedCategoryId={
                        selectedCategoryId
                    }
                    search={searchTerm}
                    isLoadingCategories={
                        isLoadingCategories
                    }
                    onCategoryChange={
                        handleCategoryChange
                    }
                    onSearchChange={
                        handleSearchChange
                    }
                />

                <section className="border-t border-white/5 px-4 pb-20 pt-10 sm:px-6 sm:pb-24 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {/* Encabezado de productos */}
                        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-mirai-accent">
                                    Carta disponible
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                                    Elige algo para disfrutar
                                </h2>

                                <p className="mt-2 text-sm text-white/40">
                                    {isLoadingProducts
                                        ? 'Buscando productos...'
                                        : `${products.length} ${products.length === 1
                                            ? 'producto encontrado'
                                            : 'productos encontrados'
                                        }`}
                                </p>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="w-fit border-b border-mirai-accent/40 pb-1 text-sm font-semibold text-mirai-accent transition hover:border-mirai-accent hover:text-white"
                                >
                                    Mostrar todos
                                </button>
                            )}
                        </div>

                        <ProductGrid
                            products={products}
                            isLoading={
                                isLoadingProducts
                            }
                            error={productsError}
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}