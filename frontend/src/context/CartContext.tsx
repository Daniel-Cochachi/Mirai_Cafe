import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

import type { Product } from '../types/product'

export interface CartItem {
    product: Product
    cantidad: number
}

interface CartContextType {
    items: CartItem[]
    isCartOpen: boolean
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
    addToCart: (product: Product, cantidad?: number) => boolean
    removeFromCart: (productoId: number) => void
    updateCantidad: (productoId: number, cantidad: number) => void
    clearCart: () => void
    totalItems: number
    totalPrecio: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'mirai_cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY)
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    const [isCartOpen, setIsCartOpen] = useState(false)

    // Sincronizar con localStorage
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        } catch {
            // Ignorar errores de cuota de storage
        }
    }, [items])

    const openCart = () => setIsCartOpen(true)
    const closeCart = () => setIsCartOpen(false)
    const toggleCart = () => setIsCartOpen((prev) => !prev)

    const addToCart = (product: Product, cantidad: number = 1): boolean => {
        if (!product || product.stock <= 0) return false

        let agregado = false

        setItems((prevItems) => {
            const index = prevItems.findIndex((it) => it.product.id === product.id)

            if (index > -1) {
                const itemExistente = prevItems[index]
                const nuevaCantidad = itemExistente.cantidad + cantidad

                // Validar tope de stock
                if (nuevaCantidad > product.stock) {
                    agregado = false
                    return prevItems
                }

                const copia = [...prevItems]
                copia[index] = {
                    ...itemExistente,
                    cantidad: nuevaCantidad,
                }
                agregado = true
                return copia
            }

            if (cantidad > product.stock) {
                agregado = false
                return prevItems
            }

            agregado = true
            return [...prevItems, { product, cantidad }]
        })

        return agregado
    }

    const removeFromCart = (productoId: number) => {
        setItems((prev) => prev.filter((it) => it.product.id !== productoId))
    }

    const updateCantidad = (productoId: number, cantidad: number) => {
        if (cantidad <= 0) {
            removeFromCart(productoId)
            return
        }

        setItems((prev) =>
            prev.map((it) => {
                if (it.product.id !== productoId) return it
                // Tope de stock
                const cantidadAjustada = Math.min(cantidad, it.product.stock)
                return {
                    ...it,
                    cantidad: cantidadAjustada,
                }
            })
        )
    }

    const clearCart = () => {
        setItems([])
        try {
            localStorage.removeItem(CART_STORAGE_KEY)
        } catch {
            // Ignore
        }
    }

    const totalItems = useMemo(
        () => items.reduce((acc, it) => acc + it.cantidad, 0),
        [items]
    )

    const totalPrecio = useMemo(
        () => items.reduce((acc, it) => acc + it.product.precio * it.cantidad, 0),
        [items]
    )

    const value = useMemo(
        () => ({
            items,
            isCartOpen,
            openCart,
            closeCart,
            toggleCart,
            addToCart,
            removeFromCart,
            updateCantidad,
            clearCart,
            totalItems,
            totalPrecio,
        }),
        [items, isCartOpen, totalItems, totalPrecio]
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart debe ser utilizado dentro de un CartProvider')
    }
    return context
}
