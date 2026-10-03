import {
    Clock3,
    MapPin,
    Navigation,
} from 'lucide-react'

const location = {
    address: 'Av. Mirai 245, Miraflores, Lima',
    reference:
        'A dos cuadras del parque central de Miraflores',
    coordinates: '-12.1219,-77.0305',
}

export function LocationSection() {
    const mapUrl =
        `https://www.google.com/maps?q=${location.coordinates}&z=16&output=embed`

    const directionsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates}`

    return (
        <section className="bg-[#f4f4f2] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
                {/* Encabezado */}
                <div className="mb-10">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-mirai-accent">
                        Visítanos
                    </p>

                    <h2 className="mt-3 text-4xl font-bold tracking-tight text-mirai-text sm:text-5xl">
                        Encuentra Mirai Café
                    </h2>

                    <p className="mt-4 max-w-xl text-base leading-7 text-mirai-muted">
                        Revisa nuestra ubicación y utiliza el mapa para
                        obtener indicaciones desde donde te encuentres.
                    </p>
                </div>

                {/* Mapa e información */}
                <div className="grid overflow-hidden rounded-3xl bg-mirai-primary-dark shadow-[0_20px_50px_rgba(0,0,0,0.16)] lg:grid-cols-[1.5fr_0.5fr]">
                    {/* Mapa */}
                    <div className="relative min-h-[420px] bg-[#dedbd6] lg:min-h-[520px]">
                        <iframe
                            src={mapUrl}
                            title="Ubicación demostrativa de Mirai Café"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 h-full w-full border-0"
                        />
                    </div>

                    {/* Información */}
                    <aside className="flex flex-col justify-between p-7 text-white sm:p-9 lg:p-10">
                        <div>
                            <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-mirai-accent">
                                <MapPin
                                    size={27}
                                    strokeWidth={1.8}
                                />
                            </span>

                            <h3 className="mt-6 text-2xl font-bold text-white">
                                Mirai Café
                            </h3>

                            <p className="mt-3 text-base leading-7 text-white/70">
                                {location.address}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-white/45">
                                {location.reference}
                            </p>

                            <div className="my-8 border-t border-white/10" />

                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={20}
                                    className="mt-0.5 shrink-0 text-mirai-accent"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Horario de atención
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-white/55">
                                        Lunes a viernes: 7:00 a. m. – 8:00 p. m.
                                    </p>

                                    <p className="text-sm leading-6 text-white/55">
                                        Sábados: 8:00 a. m. – 6:00 p. m.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-mirai-accent px-6 py-3 font-semibold text-white transition hover:bg-mirai-accent-dark"
                        >
                            <Navigation size={19} />

                            Cómo llegar
                        </a>
                    </aside>
                </div>

                <p className="mt-4 text-xs text-mirai-muted">
                    La dirección y el horario mostrados son datos
                    ficticios utilizados únicamente para la demostración
                    del proyecto.
                </p>
            </div>
        </section>
    )
}