// sessionHandler.ts - Utilidad para manejar la sesión del usuario
import { useAuth } from './API/AuthContext';

// Verificar si el usuario está autenticado
export const isUserAuthenticated = (): boolean => {
  // Verificar si hay un token en localStorage
  const token = localStorage.getItem('token');
  return !!token;
};

// Función para cerrar sesión
export const handleLogout = () => {
  // Eliminar token y datos de usuario del localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirigir a la página de inicio
  window.location.href = '/';
};