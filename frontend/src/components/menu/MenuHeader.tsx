import headerMenu from '../../assets/header_menu.webp'

export function MenuHeader() {
    return (
        <section className="relative min-h-[680px] overflow-hidden bg-[#0a0a0a] text-white sm:min-h-[720px]">
            {/* Imagen completa */}
            <img
                src={headerMenu}
                alt="Café preparado en Mirai Café"
                className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Oscurecimiento horizontal */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/5" />

            {/* Oscurecimiento superior para el Navbar */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 to-transparent" />

            {/* Degradado inferior hasta negro sólido */}
            <div
                className="absolute inset-x-0 bottom-0 h-[380px]"
                style={{
                    background:
                        'linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.35) 30%, rgba(10, 10, 10, 0.82) 65%, #0a0a0a 88%, #0a0a0a 100%)',
                }}
            />

            {/* Contenido */}
            <div className="relative z-10 mx-auto flex min-h-[680px] w-full max-w-7xl items-center px-5 pb-48 pt-28 sm:min-h-[720px] sm:px-8 sm:pt-32 lg:px-10">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-mirai-accent sm:text-sm">
                        Menú Mirai
                    </p>

                    <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Café, comida
                        <span className="block text-mirai-accent">
                            y algo dulce.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-lg text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                        Consulta nuestra carta, encuentra tus
                        productos favoritos y revisa las opciones
                        disponibles.
                    </p>

                    <div className="mt-7 flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-mirai-accent" />

                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                            Preparado al momento
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}