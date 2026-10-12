import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AdminLayout } from '../components/admin/Layout/AdminLayout'
import type { AdminTab } from '../components/admin/Layout/AdminSidebar'

// Módulos organizados
import { DashboardOverview } from '../components/admin/dashboard/DashboardOverview'
import { OrderManager } from '../components/admin/orders/OrderManager'
import { ProductManager } from '../components/admin/products/ProductManager'
import { CategoryManager } from '../components/admin/categories/CategoryManager'
import { InsumoManager } from '../components/admin/inventory/InsumoManager'
import { MovementManager } from '../components/admin/inventory/MovementManager'
import { RecipeManager } from '../components/admin/inventory/RecipeManager'

export function AdminPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

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

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onActionClick={() => {
                if (activeTab === 'dashboard') setActiveTab('orders')
            }}
        >
            {activeTab === 'dashboard' && <DashboardOverview onNavigateTab={setActiveTab} />}
            {activeTab === 'orders' && <OrderManager />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'ingredients' && <InsumoManager />}
            {activeTab === 'movements' && <MovementManager />}
            {activeTab === 'recipes' && <RecipeManager />}
        </AdminLayout>
    )
}
