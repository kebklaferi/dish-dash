// API configuration and helper functions
import { User, UserRole } from '@/types';

export const API_BASE_URL = 'http://localhost:8088/api';

export const API_ENDPOINTS = {
  identity: {
    login: `${API_BASE_URL}/identity/auth/login`,
    register: `${API_BASE_URL}/identity/auth/register`,
  },
  catalog: `${API_BASE_URL}/catalog`,
  delivery: `${API_BASE_URL}/delivery`,
  orders: `${API_BASE_URL}/orders`,
  payment: `${API_BASE_URL}/payment`,
  restaurant: `${API_BASE_URL}/restaurant`,
  notification: `${API_BASE_URL}/notification`,
};

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
}

// Helper function to decode JWT payload
function decodeJWT(token: string): Record<string, any> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return {};
  }
}

// Helper function to create user object from JWT payload
function createUserFromJWT(token: string, email: string): User {
  const payload = decodeJWT(token);
  
  // Extract role from JWT, default to CUSTOMER if not found or invalid
  let role = UserRole.CUSTOMER;
  if (payload.role) {
    const roleValue = payload.role.toLowerCase();
    if (Object.values(UserRole).includes(roleValue as UserRole)) {
      role = roleValue as UserRole;
    }
  }
  
  return {
    id: payload.userId || payload.id,
    name: payload.username || email.split('@')[0],
    email: payload.email || email,
    role: role,
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export async function login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
  try {
    const response = await fetch(API_ENDPOINTS.identity.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    const token = data.token;
    const user = createUserFromJWT(token, credentials.email);

    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (err: any) {
    console.error('Login error:', err);
    throw err;
  }
}

export async function register(credentials: RegisterCredentials): Promise<{ token: string; user: User }> {
  try {
    const response = await fetch(API_ENDPOINTS.identity.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Check for duplicate key error
      if (error.message && error.message.includes('duplicate key value')) {
        throw new Error('This email is already in use');
      }
      
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    const token = data.token;
    const user = createUserFromJWT(token, credentials.email);

    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (err: any) {
    console.error('Registration error:', err);
    throw err;
  }
}

export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

// Catalog API functions
export async function getMenuItems(restaurantId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_ENDPOINTS.catalog}?restaurantId=${restaurantId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch menu items');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error fetching menu items:', err);
    throw err;
  }
}

export async function getAllMenuItems(): Promise<any[]> {
  try {
    const response = await fetch(`${API_ENDPOINTS.catalog}/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch menu items');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error fetching menu items:', err);
    throw err;
  }
}

// Restaurant API functions
export async function getAllRestaurants(): Promise<any[]> {
  try {
    const response = await fetch(`${API_ENDPOINTS.restaurant}/restaurants`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    return data.data || [];
  } catch (err: any) {
    console.error('Error fetching restaurants:', err);
    throw err;
  }
}

export async function getRestaurantById(id: string): Promise<any> {
  try {
    const response = await fetch(`${API_ENDPOINTS.restaurant}/restaurants/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurant');
    }

    const data = await response.json();
    return data.data || data;
  } catch (err: any) {
    console.error('Error fetching restaurant:', err);
    throw err;
  }
}

// Orders API functions
export async function getUserOrders(): Promise<any[]> {
  try {
    const response = await fetchWithAuth(`${API_ENDPOINTS.orders}/orders`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    throw err;
  }
}

export async function createOrder(orderData: {
  restaurantId: string;
  deliveryAddress: string;
  items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
  deliveryFee: number;
  notes?: string;
  payment: {
    method: 'CREDIT_CARD' | 'CASH_ON_DELIVERY';
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    cardholderName?: string;
  };
}): Promise<any> {
  try {
    const response = await fetchWithAuth(`${API_ENDPOINTS.orders}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error creating order:', err);
    throw err;
  }
}
