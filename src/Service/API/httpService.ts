/**
 * Servicio HTTP para realizar peticiones a la API
 * Este servicio centraliza todas las peticiones HTTP a la API
 */

import axios from 'axios';
import { API_URL } from './apiRoutes';
import { getCookie, COOKIE_NAMES } from '../cookieService';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para añadir token a cada solicitud
axiosInstance.interceptors.request.use(
  config => {
    // Obtener token fresco de las cookies en cada solicitud
    const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Manejar errores comunes aquí
    if (error.response) {
      // Error de respuesta del servidor
      console.error('Error de respuesta:', error.response.status, error.response.data);
      
      // Redirigir a login si hay error de autenticación
      if (error.response.status === 401) {
        console.warn('Sesión expirada o token inválido');
        // Aquí podríamos redirigir al login o mostrar un mensaje
      }
    } else if (error.request) {
      // Error de red (no se recibió respuesta)
      console.error('Error de red:', error.request);
    } else {
      // Error en la configuración de la solicitud
      console.error('Error de configuración:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Servicio HTTP
export const httpService = {
  // Configurar token de autenticación
  setToken: (token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  // Limpiar token de autenticación
  clearToken: () => {
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
  
  // Métodos HTTP
  get: async <T>(url: string, config = {}): Promise<T> => {
    const response = await axiosInstance.get(url, config);
    return response.data;
  },
  post: async <T>(url: string, data = {}, config = {}): Promise<T> => {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },
  put: async <T>(url: string, data = {}, config = {}): Promise<T> => {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  },
  patch: async <T>(url: string, data = {}, config = {}): Promise<T> => {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config = {}): Promise<T> => {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  },
  
  // Acceso a la instancia de axios para casos especiales
  getInstance: () => axiosInstance
};