// userSessionService.ts
import { useState, useEffect } from 'react';

// Interfaz para el usuario autenticado
export interface AuthUser {
  id: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
}

// Estado inicial del usuario (no autenticado)
const initialUser: AuthUser = {
  id: '',
  name: '',
  role: '',
  isAuthenticated: false
};

// Verificar si hay un usuario en localStorage al iniciar
const getUserFromStorage = (): AuthUser => {
  const storedUser = localStorage.getItem('authUser');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return initialUser;
    }
  }
  return initialUser;
};

// Hook personalizado para manejar la sesión del usuario
export const useUserSession = () => {
  const [user, setUser] = useState<AuthUser>(getUserFromStorage);

  // Actualizar localStorage cuando cambia el usuario
  useEffect(() => {
    if (user.isAuthenticated) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  // Función para iniciar sesión
  const login = (userData: Omit<AuthUser, 'isAuthenticated'>) => {
    setUser({
      ...userData,
      isAuthenticated: true
    });
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(initialUser);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: user.isAuthenticated
  };
};

// Función para verificar si el usuario está autenticado (para uso sin hooks)
export const isUserAuthenticated = (): boolean => {
  const storedUser = localStorage.getItem('authUser');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return user.isAuthenticated === true;
    } catch (error) {
      return false;
    }
  }
  return false;
};