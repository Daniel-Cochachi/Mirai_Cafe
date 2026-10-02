import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import heroCafe from '../../assets/hero-cafe.webp'

export function HeroBanner() {
    return (
        <section className="relative min-h-[580px] w-full overflow-hidden bg-mirai-primary-dark text-white sm:min-h-[620px] lg:min-h-[600px]">
            {/* Imagen de fondo */}
            <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
                <img
                    src={heroCafe}
                    alt="Café especial preparado en Mirai Café"
                    className="h-full w-full object-cover object-center"
                />

                {/* Oscurecimiento móvil */}
                <div className="absolute inset-0 bg-black/75 lg:hidden" />

                {/* Transición horizontal en escritorio */}
                <div className="absolute inset-0 hidden bg-gradient-to-r from-mirai-primary-dark via-mirai-primary-dark/50 to-transparent lg:block" />

                {/* Oscurecimiento general */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Oscurecimiento superior para el Navbar */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

                {/* Oscurecimiento fuerte en la parte inferior */}
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/90 to-transparent" />
            </div>

            {/* Oscurecimiento inferior de todo el Hero */}
            <div className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-black to-transparent" />

            {/* Contenido principal */}
            <div className="relative z-10 flex min-h-[580px] w-full items-center px-6 pb-24 pt-28 sm:min-h-[620px] sm:px-10 sm:pb-28 sm:pt-30 lg:min-h-[600px] lg:w-[55%] lg:px-16 lg:pb-28 lg:pt-28 xl:px-24 2xl:px-32">
                <div className="max-w-2xl">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-mirai-accent">
                        Una experiencia en cada taza
                    </p>

                    <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-6xl xl:text-7xl">
                        Momentos que empiezan con un buen café
                    </h1>

                    <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                        Descubre bebidas, postres y comidas preparados
                        al momento para acompañar tu día
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Link
                            to="/menu"
                            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-mirai-accent px-7 py-3 font-semibold text-white transition hover:bg-mirai-accent-dark focus:outline-none focus:ring-3 focus:ring-mirai-accent/30"
                        >
                            Explorar el menú

                            <ArrowRight size={19} />
                        </Link>

                        <Link
                            to="/login"
                            className="inline-flex min-h-13 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-7 py-3 font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}