import {
    useEffect,
    useState,
} from 'react'

import {
    ArrowRight,
    PackageOpen,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { ProductCard } from '../products/ProductCard'
import { productService } from '../../services/productService'

import type { Product } from '../../types/product'

export function PopularProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setError('')

                const data =
                    await productService.getAvailable()

                const featuredProducts = [...data]
                    .sort((firstProduct, secondProduct) => {
                        return (
                            new Date(
                                secondProduct.fechaCreacion,
                            ).getTime() -
                            new Date(
                                firstProduct.fechaCreacion,
                            ).getTime()
                        )
                    })
                    .slice(0, 4)

                setProducts(featuredProducts)
            } catch {
                setError(
                    'No fue posible cargar los productos.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [])

    return (
        <section className="bg-[#111111] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                {/* Encabezado */}
                <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mirai-accent">
                            Recién agregados
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Productos destacados
                        </h2>

                        <p className="mt-3 max-w-xl text-base leading-7 text-white/55">
                            Descubre algunas de las opciones disponibles
                            actualmente en Mirai Café.
                        </p>
                    </div>

                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-mirai-accent"
                    >
                        Ver todos los productos

                        <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Cargando */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                            >
                                <div className="aspect-[4/3] animate-pulse bg-white/10" />

                                <div className="space-y-3 p-5">
                                    <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />

                                    <div className="h-4 w-full animate-pulse rounded bg-white/10" />

                                    <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                {/* Sin productos */}
                {!isLoading &&
                    !error &&
                    products.length === 0 && (
                        <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-5 py-14 text-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-mirai-accent">
                                <PackageOpen size={29} />
                            </span>

                            <h3 className="mt-5 text-lg font-bold text-white">
                                No hay productos disponibles
                            </h3>

                            <p className="mt-2 text-sm text-white/50">
                                Vuelve a consultar más adelante.
                            </p>
                        </div>
                    )}

                {/* Productos */}
                {!isLoading &&
                    !error &&
                    products.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
            </div>
        </section>
    )
}