import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AdminLayout } from '../components/admin/Layout/AdminLayout'
import type { AdminTab } from '../components/admin/Layout/AdminSidebar'

import { DashboardOverview } from '../components/admin/dashboard/DashboardOverview'
import { OrderManager } from '../components/admin/orders/OrderManager'
import { ProductManager } from '../components/admin/products/ProductManager'
import { CategoryManager } from '../components/admin/categories/CategoryManager'
import { InsumoManager } from '../components/admin/inventory/InsumoManager'
import { MovementManager } from '../components/admin/inventory/MovementManager'
import { RecipeManager } from '../components/admin/inventory/RecipeManager'
import { UserManager } from '../components/admin/users/UserManager'


export function AdminPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)

    const esAdmin = user?.rol === 'ADMIN'
    const esCajero = user?.rol === 'CAJERO'

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true })
            return
        }

        if (!esAdmin && !esCajero) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, esAdmin, esCajero, navigate])

    if (!isAuthenticated || (!esAdmin && !esCajero)) {
        return null
    }

    // El cajero solo puede entrar al dashboard y a pedidos/ventas
    const cambiarTab = (tab: AdminTab) => {
        const permitido = esAdmin || tab === 'dashboard' || tab === 'orders'

        if (permitido) {
            setActiveTab(tab)
        }
    }

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={cambiarTab}
            onActionClick={() => {
                if (activeTab === 'dashboard') cambiarTab('orders')
                if (activeTab === 'orders') setIsCreateOrderOpen(true)
            }}
        >
            {activeTab === 'dashboard' && <DashboardOverview onNavigateTab={cambiarTab} />}

            {activeTab === 'orders' && (
                <OrderManager
                    isCreateOpen={isCreateOrderOpen}
                    onCloseCreate={() => setIsCreateOrderOpen(false)}
                />
            )}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'ingredients' && <InsumoManager />}
            {activeTab === 'movements' && <MovementManager />}
            {activeTab === 'recipes' && <RecipeManager />}
            {activeTab === 'users' && <UserManager />}
        </AdminLayout>
    )
}