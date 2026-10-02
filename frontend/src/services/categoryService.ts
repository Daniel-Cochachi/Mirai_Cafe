import api from './api'
import type { Category } from '../types/category'

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const response = await api.get<Category[]>(
            '/categories',
        )

        return response.data
    },
}