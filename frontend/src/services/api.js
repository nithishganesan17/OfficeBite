import axios from 'axios';

// Vite environment variable with local default fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token if present in client storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('officebite_token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized (expired token or invalid session)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      // Don't auto-clear on failed login credentials attempt
      if (!requestUrl.includes('/api/auth/login')) {
        clearStoredAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('officebite:session-expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Registers a new customer account
 * POST /api/auth/register
 * @param {{name: string, email: string, password: string, employeeId?: string}} userData
 * @returns {Promise<{token: string, tokenType: string, expiresIn: number, user: Object}>}
 */
export const register = async (userData) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

/**
 * Authenticates user credentials with Spring Boot backend
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, tokenType: string, expiresIn: number, user: Object}>}
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Retrieves safe profile of current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

/**
 * Helper to retrieve stored JWT token from existing storage keys
 */
export const getStoredToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('officebite_token') ||
    sessionStorage.getItem('token')
  );
};

/**
 * Helper to retrieve stored user profile from localStorage
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('officebite_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Persists token and user profile into client storage
 */
export const setStoredAuth = (token, user) => {
  localStorage.setItem('officebite_token', token);
  if (user) {
    localStorage.setItem('officebite_user', JSON.stringify(user));
  }
};

/**
 * Clears all authentication tokens and cached user data
 */
export const clearStoredAuth = () => {
  localStorage.removeItem('officebite_token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('officebite_user');
};


/**
 * Fetches the complete food menu catalog from Spring Boot REST API
 * GET /api/menu
 */
export const getMenuCatalog = async (category = null) => {
  const params = category && category !== 'all' ? { category } : {};
  const response = await apiClient.get('/api/menu', { params });
  return response.data;
};

/**
 * Checks backend API health status
 * GET /api/health
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

/**
 * Creates a new canteen order in the backend
 * POST /api/orders
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/api/orders', orderData);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('officebite:order-created', { detail: response.data }));
  }
  return response.data;
};

/**
 * Retrieves an order by ID or order number
 * GET /api/orders/{id}
 */
export const getOrderById = async (id) => {
  const response = await apiClient.get(`/api/orders/${id}`);
  return response.data;
};

/**
 * Lists all orders (optionally filtered by status) for the canteen dashboard
 * GET /api/orders
 */
export const getOrders = async (status = null) => {
  const params = status && status !== 'ALL' ? { status } : {};
  const response = await apiClient.get('/api/orders', { params });
  return response.data;
};

/**
 * Updates an order status with backend transition validation
 * PATCH /api/orders/{id}/status
 */
export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.patch(`/api/orders/${id}/status`, { status });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('officebite:order-status-updated', { detail: response.data }));
  }
  return response.data;
};

/**
 * Lists users, optionally filtered by role (CUSTOMER, STAFF, ADMIN)
 * GET /api/admin/users
 * Restricted to ADMIN role.
 * @param {string} [role]
 * @returns {Promise<Array<{id: number, name: string, email: string, role: string, employeeId: string, createdAt: string}>>}
 */
export const getAdminUsers = async (role = null) => {
  const params = role && role !== 'ALL' ? { role } : {};
  const response = await apiClient.get('/api/admin/users', { params });
  return response.data;
};

/**
 * Provisions a privileged user account (STAFF or ADMIN)
 * POST /api/admin/users
 * Restricted to ADMIN role.
 * @param {{name: string, email: string, password: string, employeeId?: string, role: string}} userData
 * @returns {Promise<{id: number, name: string, email: string, role: string, employeeId: string, createdAt: string}>}
 */
export const createAdminUser = async (userData) => {
  const response = await apiClient.post('/api/admin/users', userData);
  return response.data;
};

/**
 * Creates a new dish in the canteen menu catalog
 * POST /api/menu
 * Restricted to ADMIN role.
 * @param {Object} itemData
 * @returns {Promise<Object>}
 */
export const createMenuItem = async (itemData) => {
  const response = await apiClient.post('/api/menu', itemData);
  return response.data;
};

/**
 * Updates an existing dish in the canteen menu catalog
 * PUT /api/menu/{id}
 * Restricted to ADMIN role.
 * @param {string} id
 * @param {Object} itemData
 * @returns {Promise<Object>}
 */
export const updateMenuItem = async (id, itemData) => {
  const response = await apiClient.put(`/api/menu/${id}`, itemData);
  return response.data;
};

/**
 * Toggles or updates the availability/stock status of a dish
 * PATCH /api/menu/{id}/availability
 * Restricted to ADMIN role.
 * @param {string} id
 * @param {boolean} available
 * @returns {Promise<Object>}
 */
export const toggleMenuItemAvailability = async (id, available) => {
  const response = await apiClient.patch(`/api/menu/${id}/availability`, { available });
  return response.data;
};

/**
 * Deletes a dish if not referenced in any existing order history
 * DELETE /api/menu/{id}
 * Restricted to ADMIN role.
 * @param {string} id
 * @returns {Promise<{message: string, id: string}>}
 */
export const deleteMenuItem = async (id) => {
  const response = await apiClient.delete(`/api/menu/${id}`);
  return response.data;
};

export default apiClient;

