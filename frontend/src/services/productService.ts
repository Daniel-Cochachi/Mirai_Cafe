import api from './api'

import type {
    Product,
    ProductFilters,
} from '../types/product'

export const productService = {
    async getAll(
        filters: ProductFilters = {},
    ): Promise<Product[]> {
        const response = await api.get<Product[]>(
            '/products',
            {
                params: filters,
            },
        )

        return response.data
    },

    async getAvailable(): Promise<Product[]> {
        return productService.getAll({
            available: true,
        })
    },

    async getById(id: number): Promise<Product> {
        const response = await api.get<Product>(
            `/products/${id}`,
        )

        return response.data
    },
}