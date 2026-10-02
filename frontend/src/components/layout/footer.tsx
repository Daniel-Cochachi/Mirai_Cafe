import { ArrowUpRight } from 'lucide-react'

import { Link } from 'react-router-dom'

import { MiraiLogo } from '../brand/MiraiLogo'

function GithubIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
        </svg>
    )
}

const currentYear = new Date().getFullYear()

export function Footer() {
    return (
        <footer className="bg-mirai-primary-dark text-white">
            {/* Contenido principal */}
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-10">
                {/* Marca */}
                <div>
                    <Link
                        to="/"
                        className="flex w-fit items-center gap-3"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mirai-accent text-white">
                            <MiraiLogo size={31} />
                        </span>

                        <div>
                            <p className="text-xl font-bold text-white">
                                Mirai Café
                            </p>

                            <p className="mt-1 text-xs text-white/45">
                                Fresco y delicioso
                            </p>
                        </div>
                    </Link>

                    <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">
                        Una experiencia pensada para disfrutar cafés,
                        comidas y postres preparados especialmente para
                        cada momento.
                    </p>

                    <a
                        href="https://github.com/Daniel-Cochachi/Mirai_Cafe"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white/60 transition hover:border-mirai-accent hover:bg-mirai-accent hover:text-white"
                        aria-label="Repositorio de Mirai Café en GitHub"
                    >
                        <GithubIcon size={20} />
                    </a>
                </div>

                {/* Navegación */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                        Explorar
                    </h2>

                    <nav className="mt-5 flex flex-col gap-3">
                        <Link
                            to="/"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Inicio
                        </Link>

                        <Link
                            to="/menu"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Menú
                        </Link>

                        <Link
                            to="/mis-pedidos"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Mis pedidos
                        </Link>
                    </nav>
                </div>

                {/* Categorías */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                        Categorías
                    </h2>

                    <nav className="mt-5 flex flex-col gap-3">
                        <Link
                            to="/menu?search=bebidas"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Bebidas
                        </Link>

                        <Link
                            to="/menu?search=comidas"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Comidas
                        </Link>

                        <Link
                            to="/menu?search=postres"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Postres
                        </Link>

                        <Link
                            to="/menu?search=snacks"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Snacks
                        </Link>
                    </nav>
                </div>

                {/* Cuenta */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                        Mi cuenta
                    </h2>

                    <nav className="mt-5 flex flex-col gap-3">
                        <Link
                            to="/login"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Iniciar sesión
                        </Link>

                        <Link
                            to="/register"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Crear cuenta
                        </Link>

                        <Link
                            to="/perfil"
                            className="w-fit text-sm text-white/55 transition hover:text-mirai-accent"
                        >
                            Mi perfil
                        </Link>
                    </nav>

                    <Link
                        to="/menu"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mirai-accent transition hover:text-white"
                    >
                        Ver el menú

                        <ArrowUpRight size={17} />
                    </Link>
                </div>
            </div>

            {/* Parte inferior */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
                    <p>
                        © {currentYear} Mirai Café. Todos los derechos
                        reservados.
                    </p>

                    <p>
                        Desarrollado como sistema de gestión de cafetería.
                    </p>
                </div>
            </div>
        </footer>
    )
}