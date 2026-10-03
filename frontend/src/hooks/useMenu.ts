import {
    useEffect,
    useState,
} from 'react'

import { useSearchParams } from 'react-router-dom'

import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'

import type { Category } from '../types/category'
import type { Product } from '../types/product'

function parseCategoryId(
    value: string | null,
): number | null {
    if (!value) {
        return null
    }

    const categoryId = Number(value)

    return Number.isNaN(categoryId)
        ? null
        : categoryId
}

export function useMenu() {
    const [searchParams, setSearchParams] =
        useSearchParams()

    const [categories, setCategories] = useState<
        Category[]
    >([])

    const [products, setProducts] = useState<
        Product[]
    >([])

    const [isLoadingCategories, setIsLoadingCategories] =
        useState(true)

    const [isLoadingProducts, setIsLoadingProducts] =
        useState(true)

    const [productsError, setProductsError] = useState('')

    /*
     * Los filtros se obtienen directamente de la URL.
     */
    const selectedCategoryId = parseCategoryId(
        searchParams.get('categoryId'),
    )

    const searchTerm =
        searchParams.get('search') ?? ''

    /*
     * Carga las categorías una sola vez.
     */
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data =
                    await categoryService.getAll()

                setCategories(data)
            } catch {
                setCategories([])
            } finally {
                setIsLoadingCategories(false)
            }
        }

        loadCategories()
    }, [])

    /*
     * Vuelve a consultar los productos cada vez que
     * cambia la categoría o la búsqueda.
     */
    useEffect(() => {
        const timeoutId = window.setTimeout(
            async () => {
                try {
                    setIsLoadingProducts(true)
                    setProductsError('')

                    const data =
                        await productService.getAll({
                            available: true,
                            categoryId:
                                selectedCategoryId ??
                                undefined,
                            search:
                                searchTerm.trim() ||
                                undefined,
                        })

                    setProducts(data)
                } catch {
                    setProducts([])

                    setProductsError(
                        'No fue posible cargar los productos. Verifica que el backend y Redis estén funcionando.',
                    )
                } finally {
                    setIsLoadingProducts(false)
                }
            },
            350,
        )

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [selectedCategoryId, searchTerm])

    const handleCategoryChange = (
        categoryId: number | null,
    ) => {
        const nextParams = new URLSearchParams(
            searchParams,
        )

        if (categoryId === null) {
            nextParams.delete('categoryId')
        } else {
            nextParams.set(
                'categoryId',
                categoryId.toString(),
            )
        }

        setSearchParams(nextParams, {
            replace: true,
        })
    }

    const handleSearchChange = (value: string) => {
        const nextParams = new URLSearchParams(
            searchParams,
        )

        if (value.trim()) {
            nextParams.set('search', value)
        } else {
            nextParams.delete('search')
        }

        setSearchParams(nextParams, {
            replace: true,
        })
    }

    const clearFilters = () => {
        setSearchParams(
            {},
            {
                replace: true,
            },
        )
    }

    const hasActiveFilters =
        selectedCategoryId !== null ||
        searchTerm.trim().length > 0

    return {
        categories,
        products,
        selectedCategoryId,
        searchTerm,
        isLoadingCategories,
        isLoadingProducts,
        productsError,
        hasActiveFilters,
        handleCategoryChange,
        handleSearchChange,
        clearFilters,
    }
}