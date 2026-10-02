import {
    Clock3,
    Leaf,
    ReceiptText,
    ShieldCheck,
} from 'lucide-react'

const benefits = [
    {
        number: '01',
        title: 'Atención rápida',
        description: 'Evita largas filas y recibe tu pedido más rápido.',
        icon: Clock3,
        cardClass: 'bg-[#efe2d5] text-[#241b16]',
        iconClass: 'bg-[#241b16] text-mirai-accent',
        descriptionClass: 'text-[#241b16]/60',
        numberClass: 'text-[#241b16]/30',
    },
    {
        number: '02',
        title: 'Preparación fresca',
        description: 'Bebidas y comidas preparadas al momento.',
        icon: Leaf,
        cardClass: 'bg-mirai-accent text-white',
        iconClass: 'bg-black/15 text-white',
        descriptionClass: 'text-white/75',
        numberClass: 'text-white/35',
    },
    {
        number: '03',
        title: 'Pedido seguro',
        description: 'Tus datos y tu compra están protegidos.',
        icon: ShieldCheck,
        cardClass: 'bg-[#171717] text-white',
        iconClass: 'bg-white/10 text-mirai-accent',
        descriptionClass: 'text-white/60',
        numberClass: 'text-white/25',
    },
    {
        number: '04',
        title: 'Sigue tu pedido',
        description: 'Consulta fácilmente el estado de tu pedido.',
        icon: ReceiptText,
        cardClass: 'bg-[#d8d2cb] text-[#1c1a18]',
        iconClass: 'bg-white/70 text-[#1c1a18]',
        descriptionClass: 'text-[#1c1a18]/60',
        numberClass: 'text-[#1c1a18]/25',
    },
]

export function BenefitsBar() {
    return (
        <section
            className="relative z-20 px-4 py-12 sm:px-6 lg:px-8"
            style={{
                background:
                    'linear-gradient(to bottom, #000000 0%, #000000 45%, #f4f4f2 45%, #f4f4f2 100%)',
            }}
        >
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit) => {
                    const Icon = benefit.icon

                    return (
                        <article
                            key={benefit.title}
                            className={[
                                'group relative flex min-h-52 flex-col overflow-hidden rounded-3xl p-6',
                                'shadow-[0_14px_35px_rgba(0,0,0,0.15)]',
                                'transition duration-300 hover:-translate-y-2',
                                'hover:shadow-[0_22px_45px_rgba(0,0,0,0.22)]',
                                benefit.cardClass,
                            ].join(' ')}
                        >
                            {/* Número */}
                            <span
                                className={[
                                    'absolute right-6 top-6 text-sm font-bold tracking-widest',
                                    benefit.numberClass,
                                ].join(' ')}
                            >
                                {benefit.number}
                            </span>

                            {/* Icono principal */}
                            <span
                                className={[
                                    'relative flex h-14 w-14 items-center justify-center rounded-2xl',
                                    'transition duration-300 group-hover:scale-105',
                                    benefit.iconClass,
                                ].join(' ')}
                            >
                                <Icon
                                    size={26}
                                    strokeWidth={1.8}
                                />
                            </span>

                            {/* Icono decorativo */}
                            <Icon
                                aria-hidden="true"
                                strokeWidth={1}
                                className="absolute -bottom-7 -right-7 h-32 w-32 opacity-[0.06] transition duration-500 group-hover:rotate-6 group-hover:scale-110"
                            />

                            {/* Información */}
                            <div className="relative z-10 mt-auto pt-8">
                                <h2 className="text-lg font-bold">
                                    {benefit.title}
                                </h2>

                                <p
                                    className={[
                                        'mt-2 max-w-[220px] text-sm leading-5',
                                        benefit.descriptionClass,
                                    ].join(' ')}
                                >
                                    {benefit.description}
                                </p>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}