import axios, { AxiosInstance } from 'axios';
import { Transaction, TransactionInput, Summary, Category, CategoryInput, ChartData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// ===== HealthCheck =====
export const healthCheck = async (): Promise<void> => {
  await apiClient.get('/health');
};

// ===== Transactions API =====
export const transactionApi = {
  getList: (month?: string): Promise<Transaction[]> =>
    apiClient.get('/api/transactions', { params: { month } }).then(r => r.data),

  create: (data: TransactionInput): Promise<Transaction> =>
    apiClient.post('/api/transactions', data).then(r => r.data),

  update: (id: number, data: Partial<TransactionInput>): Promise<Transaction> =>
    apiClient.put(`/api/transactions/${id}`, data).then(r => r.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/transactions/${id}`),
};

// ===== Summary API =====
export const summaryApi = {
  get: (yearMonth: string): Promise<Summary> =>
    apiClient.get(`/api/summary/${yearMonth}`).then(r => r.data),
};

// ===== Chart API =====
export const chartApi = {
  getData: (): Promise<ChartData[]> =>
    apiClient.get('/api/chart-data').then(r => r.data),
};

// ===== Categories API =====
export const categoriesApi = {
  getList: (): Promise<Category[]> =>
    apiClient.get('/api/categories').then(r => r.data),

  create: (data: CategoryInput): Promise<Category> =>
    apiClient.post('/api/categories', data).then(r => r.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/api/categories/${id}`),
};
