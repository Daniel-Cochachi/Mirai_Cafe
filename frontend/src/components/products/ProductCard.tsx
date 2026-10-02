import {
    ArrowUpRight,
    Coffee,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import type { Product } from '../../types/product'

interface ProductCardProps {
    product: Product
}

const priceFormatter = new Intl.NumberFormat(
    'es-PE',
    {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
    },
)

export function ProductCard({
    product,
}: ProductCardProps) {
    const hasStock = product.stock > 0

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/8 bg-white transition duration-300 hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
            {/* Imagen */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#efefed]">
                {product.imagenUrl ? (
                    <img
                        src={product.imagenUrl}
                        alt={product.nombre}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-mirai-accent shadow-sm">
                            <Coffee
                                size={37}
                                strokeWidth={1.5}
                            />
                        </span>
                    </div>
                )}

                {/* Categoría */}
                <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    {product.categoriaNombre}
                </span>

                {/* Estado del stock */}
                {!hasStock && (
                    <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                        Sin stock
                    </span>
                )}
            </div>

            {/* Información */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-mirai-text">
                    {product.nombre}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-mirai-muted">
                    {product.descripcion ||
                        'Producto preparado especialmente para ti.'}
                </p>

                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-mirai-muted">
                            Precio
                        </p>

                        <p className="mt-1 text-xl font-bold text-mirai-text">
                            {priceFormatter.format(product.precio)}
                        </p>
                    </div>

                    <Link
                        to={`/menu?productId=${product.id}`}
                        aria-label={`Ver ${product.nombre}`}
                        className={[
                            'flex h-11 w-11 items-center justify-center rounded-full transition',
                            hasStock
                                ? 'bg-mirai-primary-dark text-white hover:bg-mirai-accent'
                                : 'pointer-events-none bg-black/10 text-black/30',
                        ].join(' ')}
                    >
                        <ArrowUpRight size={19} />
                    </Link>
                </div>
            </div>
        </article>
    )
}