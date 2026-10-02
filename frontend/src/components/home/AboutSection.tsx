import {
    ArrowRight,
    Coffee,
    HeartHandshake,
    Leaf,
} from 'lucide-react'

import { Link } from 'react-router-dom'

export function AboutSection() {
    return (
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                {/* Introducción */}
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-mirai-accent">
                        Sobre nosotros
                    </p>

                    <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-tight text-mirai-text sm:text-5xl">
                        Más que café, creamos momentos.
                    </h2>

                    <p className="mt-6 max-w-xl text-base leading-7 text-mirai-muted">
                        Mirai Café nace para ofrecer una experiencia
                        sencilla, rápida y agradable. Reunimos bebidas,
                        comidas y postres en un espacio pensado para
                        acompañar cada parte de tu día.
                    </p>

                    <p className="mt-4 max-w-xl text-base leading-7 text-mirai-muted">
                        Nuestra plataforma facilita la consulta del menú,
                        la realización de pedidos y el seguimiento de cada
                        compra desde un solo lugar.
                    </p>

                    <Link
                        to="/menu"
                        className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mirai-primary-dark px-6 py-3 font-semibold text-white transition hover:bg-mirai-accent"
                    >
                        Conocer el menú

                        <ArrowRight size={19} />
                    </Link>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Tarjeta principal */}
                    <article className="relative min-h-64 overflow-hidden rounded-3xl bg-[#171717] p-7 text-white sm:col-span-2">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-mirai-accent">
                            <Coffee
                                size={27}
                                strokeWidth={1.7}
                            />
                        </span>

                        <div className="mt-12 max-w-lg">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                                Nuestra esencia
                            </p>

                            <h3 className="mt-3 text-2xl font-bold">
                                Una experiencia simple y cercana
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-white/55">
                                Desde la elección del producto hasta la entrega
                                del pedido, buscamos que cada paso sea claro y
                                agradable.
                            </p>
                        </div>

                        <Coffee
                            aria-hidden="true"
                            strokeWidth={0.8}
                            className="absolute -bottom-12 -right-10 h-52 w-52 text-white/5"
                        />
                    </article>

                    {/* Calidad */}
                    <article className="min-h-52 rounded-3xl bg-[#efe2d5] p-6 text-[#241b16]">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#241b16] text-mirai-accent">
                            <Leaf
                                size={23}
                                strokeWidth={1.8}
                            />
                        </span>

                        <h3 className="mt-8 text-xl font-bold">
                            Calidad
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-[#241b16]/60">
                            Productos seleccionados y preparados para
                            brindar una experiencia consistente.
                        </p>
                    </article>

                    {/* Cercanía */}
                    <article className="min-h-52 rounded-3xl bg-mirai-accent p-6 text-white">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/15 text-white">
                            <HeartHandshake
                                size={23}
                                strokeWidth={1.8}
                            />
                        </span>

                        <h3 className="mt-8 text-xl font-bold">
                            Cercanía
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-white/75">
                            Diseñamos cada interacción pensando en las
                            necesidades de nuestros clientes.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    )
}