import React, { useState, useEffect } from 'react';
import { getCookie, COOKIE_NAMES } from '../Service/cookieService';
import HumanVerification from './HumanVerification';
import CookieBanner from './CookieBanner';

interface SecurityGatewayProps {
  children: React.ReactNode;
}

const SecurityGateway: React.FC<SecurityGatewayProps> = ({ children }) => {
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [isCookiesAccepted, setIsCookiesAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si las cookies ya han sido aceptadas
    const hasAcceptedCookies = getCookie(COOKIE_NAMES.COOKIES_ACCEPTED);
    if (hasAcceptedCookies) {
      setIsCookiesAccepted(true);
      // Si ya aceptó cookies, asumimos que ya pasó la verificación humana
      setIsHumanVerified(true);
    }
    setIsLoading(false);
  }, []);

  const handleVerificationComplete = (isHuman: boolean) => {
    setIsHumanVerified(isHuman);
  };

  const handleCookiesAccepted = () => {
    setIsCookiesAccepted(true);
  };

  // Mostrar pantalla de carga mientras verificamos el estado
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no ha sido verificado como humano, mostrar la verificación
  if (!isHumanVerified) {
    return <HumanVerification onVerificationComplete={handleVerificationComplete} />;
  }

  // Si ha sido verificado como humano pero no ha aceptado cookies, mostrar el banner
  if (!isCookiesAccepted) {
    return <CookieBanner isHumanVerified={isHumanVerified} onCookiesAccepted={handleCookiesAccepted} />;
  }

  // Si ha sido verificado y ha aceptado cookies, mostrar el contenido de la aplicación
  return <>{children}</>;
};

export default SecurityGateway;