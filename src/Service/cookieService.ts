/**
 * cookieService.ts - Servicio para gestionar cookies en la aplicación
 * 
 * Este archivo contiene funciones para establecer, obtener y eliminar cookies,
 * permitiendo la persistencia de datos entre sesiones del navegador.
 */

// Tipo para las opciones de configuración de cookies
export type CookieOptions = {
  days?: number;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  partitioned?: boolean;
};

// Función para establecer una cookie con opciones configurables
export const setCookie = (
  name: string, 
  value: string, 
  options: number | CookieOptions = 7
): void => {
  // Convertir número de días a objeto de opciones
  const opts: CookieOptions = typeof options === 'number' 
    ? { days: options } 
    : options;
  
  // Valores por defecto
  const days = opts.days ?? 7;
  const sameSite = opts.sameSite ?? 'Lax';
  const secure = opts.secure ?? (sameSite === 'None' ? true : window.location.protocol === 'https:');
  // Establecer partitioned=true por defecto para cookies de terceros (cuando SameSite=None)
  const partitioned = opts.partitioned ?? (sameSite === 'None');
  
  // Configurar fecha de expiración
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  
  // Construir string de cookie con todas las opciones
  let cookieString = `${name}=${value};${expires};path=/;SameSite=${sameSite}`;
  
  if (secure) {
    cookieString += ';Secure';
  }
  
  if (partitioned) {
    cookieString += ';Partitioned';
  }
  
  document.cookie = cookieString;
};

// Función para obtener el valor de una cookie por su nombre
export const getCookie = (name: string): string | null => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  
  return null;
};

// Función para eliminar una cookie estableciendo su fecha de expiración en el pasado
export const deleteCookie = (name: string, options: CookieOptions = {}): void => {
  const sameSite = options.sameSite ?? 'Lax';
  const secure = options.secure ?? (sameSite === 'None' ? true : window.location.protocol === 'https:');
  // Establecer partitioned=true por defecto para cookies de terceros (cuando SameSite=None)
  const partitioned = options.partitioned ?? (sameSite === 'None');
  
  let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=${sameSite}`;
  
  if (secure) {
    cookieString += ';Secure';
  }
  
  if (partitioned) {
    cookieString += ';Partitioned';
  }
  
  document.cookie = cookieString;
};

// Función para verificar si una cookie existe
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

// Constantes para nombres de cookies utilizadas en la aplicación
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'senacloud_auth_token',
  USER_ID: 'senacloud_user_id',
  USER_ROLE: 'senacloud_user_role',
  COOKIES_ACCEPTED: 'cookies_accepted',
  COOKIES_PREFERENCES: 'cookies_preferences',
};

// Exportación por defecto para facilitar la importación
export default {
  setCookie,
  getCookie,
  deleteCookie,
  hasCookie,
  COOKIE_NAMES,
};