import {
    useEffect,
    useState,
} from 'react'

import {
    LayoutGrid,
    Tag,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { CategoryManager } from '../components/admin/CategoryManager'
import { ProductManager } from '../components/admin/ProductManager'
import { Footer } from '../components/layout/footer'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

type AdminTab = 'products' | 'categories'

export function AdminPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [activeTab, setActiveTab] = useState<AdminTab>('products')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true })
            return
        }

        if (user?.rol !== 'ADMIN') {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, user, navigate])

    if (!isAuthenticated || user?.rol !== 'ADMIN') {
        return null
    }

    const tabs: { id: AdminTab; label: string; icon: typeof Tag }[] = [
        { id: 'products', label: 'Productos', icon: LayoutGrid },
        { id: 'categories', label: 'Categorías', icon: Tag },
    ]

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#0a0a0a] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    <header className="border-b border-white/10 pb-9">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-mirai-accent">
                            Panel interno
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                            Administración
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                            Gestiona las categorías y productos de la carta de Mirai Café.
                        </p>
                    </header>

                    <div className="mt-8 flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        'flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition',
                                        isActive
                                            ? 'border-mirai-accent bg-mirai-accent text-white'
                                            : 'border-white/10 bg-[#151515] text-white/55 hover:border-mirai-accent/50 hover:text-white',
                                    ].join(' ')}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-8">
                        {activeTab === 'products' ? (
                            <ProductManager />
                        ) : (
                            <CategoryManager />
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}