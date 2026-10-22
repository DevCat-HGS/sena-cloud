/**
 * sessionManager.ts - Servicio para gestionar la sesión del usuario
 * 
 * Este servicio maneja la detección de inactividad, cambio de pestañas
 * y cierre automático de sesión después de un tiempo determinado.
 */

import { getCookie, deleteCookie, COOKIE_NAMES } from './cookieService';
import { AuthService } from './API/authService';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos
const WARNING_TIMEOUT = 30 * 1000; // 30 segundos de advertencia antes de cerrar sesión

export class SessionManager {
  private static instance: SessionManager | null = null;
  private inactivityTimer: number | null = null;
  private warningTimer: number | null = null;
  private isWarningVisible = false;
  private authService = AuthService.getInstance();
  private warningCallback: (() => void) | null = null;
  private logoutCallback: (() => void) | null = null;

  private constructor() {
    // Inicializar los event listeners
    this.initEventListeners();
  }

  /**
   * Obtiene la instancia única del gestor de sesiones
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Inicializa los event listeners para detectar actividad del usuario
   */
  private initEventListeners(): void {
    // Eventos para resetear el temporizador de inactividad
    const resetEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    resetEvents.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });

    // Detectar cambio de pestaña
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Usuario cambió a otra pestaña
        this.startInactivityTimer();
      } else {
        // Usuario volvió a esta pestaña
        this.resetInactivityTimer();
      }
    });

    // Detectar cierre de ventana/pestaña
    window.addEventListener('beforeunload', () => {
      // No cerramos sesión al cerrar la pestaña, solo registramos el evento
      localStorage.setItem('senacloud_last_active', Date.now().toString());
    });

    // Al cargar la página, verificar si hay una sesión activa
    window.addEventListener('load', () => {
      this.checkSession();
    });
  }

  /**
   * Verifica si hay una sesión activa y si ha expirado por inactividad
   */
  private checkSession(): void {
    const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
    if (!token) return; // No hay sesión activa

    const lastActive = localStorage.getItem('senacloud_last_active');
    if (lastActive) {
      const inactiveTime = Date.now() - parseInt(lastActive);
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        // La sesión ha estado inactiva por más del tiempo permitido
        this.logout();
        return;
      }
    }

    // Actualizar timestamp de última actividad
    localStorage.setItem('senacloud_last_active', Date.now().toString());
    this.resetInactivityTimer();
  }

  /**
   * Inicia el temporizador de inactividad
   */
  private startInactivityTimer(): void {
    // Limpiar temporizadores existentes
    this.clearTimers();

    // Iniciar nuevo temporizador de inactividad
    this.inactivityTimer = window.setTimeout(() => {
      // Mostrar advertencia antes de cerrar sesión
      this.showWarning();
    }, INACTIVITY_TIMEOUT - WARNING_TIMEOUT);
  }

  /**
   * Reinicia el temporizador de inactividad
   */
  private resetInactivityTimer(): void {
    // Actualizar timestamp de última actividad
    localStorage.setItem('senacloud_last_active', Date.now().toString());
    
    // Ocultar advertencia si está visible
    if (this.isWarningVisible) {
      this.hideWarning();
    }

    // Reiniciar temporizadores
    this.clearTimers();
    this.startInactivityTimer();
  }

  /**
   * Limpia los temporizadores existentes
   */
  private clearTimers(): void {
    if (this.inactivityTimer !== null) {
      window.clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    if (this.warningTimer !== null) {
      window.clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  /**
   * Muestra la advertencia de cierre de sesión
   */
  private showWarning(): void {
    this.isWarningVisible = true;
    
    // Ejecutar callback de advertencia si existe
    if (this.warningCallback) {
      this.warningCallback();
    }

    // Iniciar temporizador para cerrar sesión después de la advertencia
    this.warningTimer = window.setTimeout(() => {
      this.logout();
    }, WARNING_TIMEOUT);
  }

  /**
   * Oculta la advertencia de cierre de sesión
   */
  private hideWarning(): void {
    this.isWarningVisible = false;
    
    // Aquí se podría implementar la lógica para ocultar el componente de advertencia
  }

  /**
   * Cierra la sesión del usuario
   */
  private logout(): void {
    // Cerrar sesión usando el servicio de autenticación
    this.authService.logout();
    
    // Ejecutar callback de cierre de sesión si existe
    if (this.logoutCallback) {
      this.logoutCallback();
    }
  }

  /**
   * Establece el callback para mostrar la advertencia
   * @param callback Función a ejecutar cuando se muestra la advertencia
   */
  public setWarningCallback(callback: () => void): void {
    this.warningCallback = callback;
  }

  /**
   * Establece el callback para el cierre de sesión
   * @param callback Función a ejecutar cuando se cierra la sesión
   */
  public setLogoutCallback(callback: () => void): void {
    this.logoutCallback = callback;
  }
}

export default SessionManager.getInstance();