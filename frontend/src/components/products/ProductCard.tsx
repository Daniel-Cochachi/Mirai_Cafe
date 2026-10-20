import { useState } from 'react'
import {
    Check,
    Coffee,
    ShoppingBag,
} from 'lucide-react'

import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/product'

interface ProductCardProps {
    product: Product
    variant?: 'light' | 'dark'
}

const priceFormatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
})

export function ProductCard({
    product,
    variant = 'light',
}: ProductCardProps) {
    const isDark = variant === 'dark'
    const hasStock = product.stock > 0
    const [imageError, setImageError] = useState(false)
    const [justAdded, setJustAdded] = useState(false)
    const [maxStockReached, setMaxStockReached] = useState(false)
    const { addToCart } = useCart()

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!hasStock) return

        const success = addToCart(product, 1)
        if (success) {
            setJustAdded(true)
            setMaxStockReached(false)
            setTimeout(() => setJustAdded(false), 1200)
        } else {
            setMaxStockReached(true)
            setTimeout(() => setMaxStockReached(false), 1500)
        }
    }

    return (
        <article
            className={[
                'group flex h-full flex-col overflow-hidden rounded-2xl border transition duration-300',
                'hover:-translate-y-1',
                isDark
                    ? 'border-white/10 bg-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:border-mirai-accent/45'
                    : 'border-black/8 bg-white hover:border-black/15 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]',
            ].join(' ')}
        >
            {/* Imagen */}
            <div
                className={[
                    'relative aspect-[4/3] overflow-hidden',
                    isDark
                        ? 'bg-[#202020]'
                        : 'bg-[#efefed]',
                ].join(' ')}
            >
                {product.imagenUrl && !imageError ? (
                    <img
                        src={product.imagenUrl}
                        alt={product.nombre}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span
                            className={[
                                'flex h-20 w-20 items-center justify-center rounded-full',
                                isDark
                                    ? 'border border-mirai-accent/25 bg-black/20 text-mirai-accent'
                                    : 'bg-white text-mirai-accent shadow-sm',
                            ].join(' ')}
                        >
                            <Coffee
                                size={37}
                                strokeWidth={1.5}
                            />
                        </span>
                    </div>
                )}

                {/* Oscurecimiento inferior */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Categoría */}
                <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    {product.categoriaNombre}
                </span>

                {/* Estado */}
                {!hasStock && (
                    <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                        Sin stock
                    </span>
                )}
            </div>

            {/* Información */}
            <div className="flex flex-1 flex-col p-5">
                <h3
                    className={[
                        'text-lg font-bold',
                        isDark
                            ? 'text-white'
                            : 'text-mirai-text',
                    ].join(' ')}
                >
                    {product.nombre}
                </h3>

                <p
                    className={[
                        'mt-2 line-clamp-2 text-sm leading-6',
                        isDark
                            ? 'text-white/45'
                            : 'text-mirai-muted',
                    ].join(' ')}
                >
                    {product.descripcion ||
                        'Producto preparado especialmente para ti.'}
                </p>

                <div
                    className={[
                        'mt-auto flex items-end justify-between gap-4 border-t pt-5',
                        isDark
                            ? 'border-white/8'
                            : 'border-black/8',
                    ].join(' ')}
                >
                    <div>
                        <p
                            className={[
                                'text-xs font-medium uppercase tracking-wider',
                                isDark
                                    ? 'text-white/30'
                                    : 'text-mirai-muted',
                            ].join(' ')}
                        >
                            Precio
                        </p>

                        <p
                            className={[
                                'mt-1 text-xl font-bold',
                                isDark
                                    ? 'text-mirai-accent'
                                    : 'text-mirai-text',
                            ].join(' ')}
                        >
                            {priceFormatter.format(product.precio)}
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={!hasStock}
                        onClick={handleAddToCart}
                        aria-label={`Agregar ${product.nombre} al pedido`}
                        className={[
                            'flex h-11 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition active:scale-95 cursor-pointer',
                            justAdded
                                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                : hasStock
                                ? isDark
                                    ? 'bg-mirai-accent text-white hover:bg-mirai-accent-dark'
                                    : 'bg-mirai-primary-dark text-white hover:bg-mirai-accent'
                                : 'pointer-events-none bg-white/5 text-white/20',
                        ].join(' ')}
                    >
                        {justAdded ? (
                            <>
                                <Check size={16} />
                                <span>¡Listo!</span>
                            </>
                        ) : maxStockReached ? (
                            <span className="text-amber-400 font-extrabold">¡Stock máx!</span>
                        ) : hasStock ? (
                            <>
                                <ShoppingBag size={15} />
                                <span>Agregar</span>
                            </>
                        ) : (
                            <span>Agotado</span>
                        )}
                    </button>
                </div>
            </div>
        </article>
    )
}