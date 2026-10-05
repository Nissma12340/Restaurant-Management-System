import axios from 'axios';

// Create Axios instance with base URL fallback
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const MenuService = {
  async getAll() {
    const res = await api.get('/menu');
    return res.data;
  },
  async create(item) {
    const res = await api.post('/menu', item);
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  }
};

export const OrderService = {
  async getAll() {
    const res = await api.get('/orders');
    return res.data;
  },
  async create(orderData) {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  }
};

export const DashboardService = {
  async getStats() {
    const res = await api.get('/dashboard');
    return res.data;
  }
};

export const HealthService = {
  async check() {
    const res = await api.get('/health');
    return res.data;
  }
};

export default api;
