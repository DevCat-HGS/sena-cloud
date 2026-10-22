import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sessionManager from '../Service/sessionManager';

/**
 * Componente que muestra una advertencia cuando la sesión está por expirar
 */
const SessionWarning: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Registrar callback para mostrar la advertencia
    sessionManager.setWarningCallback(() => {
      setVisible(true);
      setCountdown(30);
    });
    
    // Iniciar contador regresivo cuando la advertencia es visible
    let interval: number | null = null;
    
    if (visible) {
      interval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval!);
            // Cuando el contador llega a 0, cerrar sesión y redirigir a /login
            sessionManager.setLogoutCallback(() => {
              navigate('/');
            });
            // Ocultar el componente de advertencia antes de cerrar sesión
            setVisible(false);
            
            // Ejecutar el cierre de sesión inmediatamente
            setTimeout(() => {
              // Cerrar sesión manualmente
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('authUser');
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });
              // Redirigir a login
              window.location.href = '/';
            }, 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, navigate]);
  
  // Función para continuar la sesión
  const continueSession = () => {
    // Simular actividad del usuario para resetear el temporizador
    document.dispatchEvent(new MouseEvent('mousedown'));
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-4">¡Advertencia de sesión!</h2>
        <p className="mb-4">
          Su sesión está a punto de expirar por inactividad. 
          La sesión se cerrará automáticamente en <span className="font-bold">{countdown}</span> segundos.
        </p>
        <p className="mb-6">
          ¿Desea continuar con la sesión?
        </p>
        <div className="flex justify-end">
          <button
            onClick={continueSession}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Continuar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;