import {
    ArrowRight,
    Sparkles,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import promoCafe from '../../assets/promo-cafe.avif'

export function PromoSection() {
    return (
        <section className="bg-white px-3 py-16 sm:px-4 sm:py-20 lg:px-6">
            <div className="mx-auto w-full max-w-[1800px]">
                <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                    {/* Imagen */}
                    <img
                        src={promoCafe}
                        alt="Taza de café con granos tostados"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover object-left"
                    />

                    {/* Oscurecimiento general */}
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Degradado para el texto de la derecha */}
                    <div className="absolute inset-0 bg-gradient-to-l from-black via-black/80 to-transparent" />

                    {/* Oscurecimiento adicional en celular */}
                    <div className="absolute inset-0 bg-black/60 lg:hidden" />

                    {/* Contenido */}
                    <div className="relative z-10 flex min-h-[420px] items-center px-6 py-12 sm:px-10 lg:justify-end lg:px-20 xl:px-28">
                        <div className="max-w-xl lg:text-right">
                            <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-mirai-accent lg:justify-end">
                                <Sparkles size={17} />

                                Una pausa para ti
                            </div>

                            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                                Haz de cada momento algo especial.
                            </h2>

                            <p className="mt-5 text-base leading-7 text-white/65 sm:text-lg">
                                Descubre cafés, bebidas y acompañamientos
                                preparados para disfrutar en cualquier momento
                                del día.
                            </p>

                            <div className="mt-8 flex lg:justify-end">
                                <Link
                                    to="/menu"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mirai-accent px-6 py-3 font-semibold text-white transition hover:bg-mirai-accent-dark focus:outline-none focus:ring-3 focus:ring-mirai-accent/30"
                                >
                                    Descubrir el menú

                                    <ArrowRight size={19} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Línea decorativa inferior */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-mirai-accent to-transparent" />
                </div>
            </div>
        </section>
    )
}