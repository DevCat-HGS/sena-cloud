/**
 * Servicio para gestionar la autenticación de usuarios
 * Este servicio utiliza el servicio HTTP para realizar peticiones a la API
 */

import { httpService } from './httpService';
import { API_URL } from './apiRoutes';
import { getCookie, setCookie, deleteCookie, COOKIE_NAMES } from '../cookieService';

// Interfaces para los tipos de datos
export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    nombre: string;
    correoInstitucional: string;
    correoPersonal: string;
    rol: string;
    etiquetas: string[];
    estadoInstructor?: string;
  };
  token: string;
}

export class AuthService {
  private static instance: AuthService | null = null;
  private tokenKey = COOKIE_NAMES.AUTH_TOKEN;
  private userKey = 'senacloud_user';

  private constructor() {
    // Constructor privado para implementar el patrón Singleton
    // Cargar token desde cookies si existe
    const token = getCookie(this.tokenKey);
    if (token) {
      httpService.setToken(token);
    }
  }

  /**
   * Obtiene la instancia única del servicio de autenticación
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Inicia sesión con credenciales
   * @param credentials Credenciales de inicio de sesión
   * @returns Respuesta de autenticación
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data: AuthResponse = await response.json();
      
      // Guardar token y usuario en cookies (24 horas de duración)
      setCookie(this.tokenKey, data.token, 1);
      setCookie(COOKIE_NAMES.USER_ID, data.user.id, 1);
      setCookie(COOKIE_NAMES.USER_ROLE, data.user.rol, 1);
      
      // Mantener en localStorage para compatibilidad
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      
      // Configurar token en el servicio HTTP
      httpService.setToken(data.token);
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  /**
   * Obtiene el ID del usuario actual
   * @returns ID del usuario o null si no hay usuario autenticado
   */
  public getCurrentUserId(): string | null {
    return getCookie(COOKIE_NAMES.USER_ID);
  }

  public logout(): void {
    // Eliminar cookies
    deleteCookie(this.tokenKey);
    deleteCookie(COOKIE_NAMES.USER_ID);
    deleteCookie(COOKIE_NAMES.USER_ROLE);
    
    // Eliminar de localStorage para compatibilidad
    localStorage.removeItem(this.userKey);
    
    // Limpiar token en el servicio HTTP
    httpService.clearToken();
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  public isAuthenticated(): boolean {
    return getCookie(this.tokenKey) !== null;
  }

  /**
   * Obtiene el usuario autenticado
   * @returns Usuario autenticado o null si no hay usuario autenticado
   */
  public getAuthenticatedUser(): AuthResponse['user'] | null {
    // Primero intentamos obtener de localStorage para compatibilidad
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      return JSON.parse(userJson);
    }
    
    // Si no hay en localStorage pero hay token en cookies, reconstruimos info básica
    const token = getCookie(this.tokenKey);
    const userId = getCookie(COOKIE_NAMES.USER_ID);
    const userRole = getCookie(COOKIE_NAMES.USER_ROLE);
    
    if (token && userId && userRole) {
      return {
        id: userId,
        rol: userRole,
        nombre: '',
        correoInstitucional: '',
        correoPersonal: '',
        etiquetas: []
      };
    }
    
    return null;
  }

  /**
   * Obtiene el token de autenticación
   * @returns Token de autenticación o null si no hay token
   */
  public getToken(): string | null {
    return getCookie(this.tokenKey);
  }
}

export const authService = AuthService.getInstance();