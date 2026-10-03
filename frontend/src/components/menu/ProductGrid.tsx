import { PackageOpen } from 'lucide-react'

import { ProductCard } from '../products/ProductCard'

import type { Product } from '../../types/product'

interface ProductGridProps {
    products: Product[]
    isLoading: boolean
    error: string
}

export function ProductGrid({
    products,
    isLoading,
    error,
}: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div
                        key={item}
                        className="overflow-hidden rounded-2xl border border-white/8 bg-[#171717]"
                    >
                        <div className="aspect-[4/3] animate-pulse bg-white/5" />

                        <div className="space-y-3 p-5">
                            <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
                            <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                            <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />

                            <div className="mt-5 flex items-end justify-between border-t border-white/5 pt-4">
                                <div className="h-7 w-24 animate-pulse rounded bg-white/5" />
                                <div className="h-8 w-20 animate-pulse rounded bg-white/5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div
                role="alert"
                className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-sm text-red-300"
            >
                {error}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#121212] px-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-mirai-accent">
                    <PackageOpen
                        size={26}
                        strokeWidth={1.7}
                    />
                </span>

                <h3 className="mt-5 text-xl font-bold text-white">
                    No encontramos productos
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
                    Prueba utilizando otro nombre o seleccionando una
                    categoría diferente.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    variant="dark"
                />
            ))}
        </div>
    )
}