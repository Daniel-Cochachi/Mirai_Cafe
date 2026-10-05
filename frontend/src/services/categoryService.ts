import api from './api'
import type {
    Category,
    CategoryRequest,
} from '../types/category'

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const response = await api.get<Category[]>(
            '/categories',
        )

        return response.data
    },

    async create(
        data: CategoryRequest,
    ): Promise<Category> {
        const response = await api.post<Category>(
            '/categories',
            data,
        )

        return response.data
    },

    async update(
        id: number,
        data: CategoryRequest,
    ): Promise<Category> {
        const response = await api.put<Category>(
            `/categories/${id}`,
            data,
        )

        return response.data
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/categories/${id}`)
    },
}