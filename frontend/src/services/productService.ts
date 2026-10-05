import api from './api'

import type {
    Product,
    ProductFilters,
    ProductRequest,
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

    async create(
        data: ProductRequest,
    ): Promise<Product> {
        const response = await api.post<Product>(
            '/products',
            data,
        )

        return response.data
    },

    async update(
        id: number,
        data: ProductRequest,
    ): Promise<Product> {
        const response = await api.put<Product>(
            `/products/${id}`,
            data,
        )

        return response.data
    },

    async updateAvailability(
        id: number,
        disponible: boolean,
    ): Promise<Product> {
        const response = await api.patch<Product>(
            `/products/${id}/availability`,
            {
                disponible,
            },
        )

        return response.data
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/products/${id}`)
    },
}