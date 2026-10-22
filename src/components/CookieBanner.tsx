import React, { useState, useEffect } from 'react';
import { getCookie, setCookie, COOKIE_NAMES } from '../Service/cookieService';

interface CookieBannerProps {
  onCookiesAccepted?: () => void;
  isHumanVerified?: boolean;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ 
  onCookiesAccepted, 
  isHumanVerified = false 
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    // Mostrar el banner solo si el usuario no ha aceptado las cookies
    // Y ha sido verificado como humano
    const hasAccepted = getCookie(COOKIE_NAMES.COOKIES_ACCEPTED);
    setShowBanner(!hasAccepted && isHumanVerified);
  }, [isHumanVerified]);

  const acceptCookies = () => {
    // Guardar la aceptación por 30 días con configuración para cookies de terceros
    setCookie(COOKIE_NAMES.COOKIES_ACCEPTED, 'true', {
      days: 30,
      sameSite: 'Lax',
      secure: true,
      partitioned: true
    });
    
    // Guardar preferencias detalladas
    const preferences = JSON.stringify({
      essential: true,
      analytics: true,
      thirdParty: true,
      lastUpdated: new Date().toISOString()
    });
    
    setCookie(COOKIE_NAMES.COOKIES_PREFERENCES, preferences, {
      days: 30,
      sameSite: 'Lax',
      secure: true
    });
    
    setShowBanner(false);
    
    // Notificar que las cookies han sido aceptadas
    if (onCookiesAccepted) {
      onCookiesAccepted();
    }
  };

  // Ya no permitimos solo cookies esenciales, todas son obligatorias
  // Eliminamos la función acceptEssentialOnly

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white shadow-lg rounded-lg px-6 py-4 mx-4 w-full max-w-3xl">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-800">Política de Cookies - Obligatorio</h3>
            <button 
              onClick={toggleDetails}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
          </div>
          
          <p className="text-gray-600 text-sm">
            <strong>Este sitio requiere el uso de cookies para funcionar correctamente y protegerse contra ataques.</strong> 
            Las cookies son necesarias para el funcionamiento del sitio y para garantizar la seguridad.
            No es posible utilizar este sitio sin aceptar las cookies.
          </p>
          
          {showDetails && (
            <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 mt-2">
              <h4 className="font-medium mb-2">Tipos de cookies que utilizamos:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-medium">Cookies esenciales:</span> Necesarias para el funcionamiento básico del sitio.</li>
                <li><span className="font-medium">Cookies de seguridad:</span> Protegen contra ataques DDoS y DoS.</li>
                <li><span className="font-medium">Cookies de terceros:</span> Utilizadas por servicios externos como PowerBI para mostrar informes y análisis.</li>
                <li><span className="font-medium">Cookies de sesión:</span> Mantienen tu sesión activa mientras navegas por el sitio.</li>
              </ul>
              <p className="mt-2">
                Las cookies son obligatorias para el uso de este sitio. Esto es necesario para garantizar 
                la seguridad y el correcto funcionamiento de la plataforma. Al aceptar, confirmas que eres 
                un usuario humano y no un bot malicioso.
              </p>
            </div>
          )}
          
          <div className="flex justify-center pt-2">
            <button
              onClick={acceptCookies}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-6 rounded transition-colors"
            >
              Aceptar y continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;