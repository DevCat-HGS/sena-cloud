import React, { useEffect } from 'react';
import { getCookie, COOKIE_NAMES } from '../Service/cookieService';
import HumanVerification from './HumanVerification';
import CookieBanner from './CookieBanner';

/**
 * Componente que se puede importar en cualquier parte de la aplicación
 * para implementar la verificación de humano y aceptación obligatoria de cookies
 */
const SecurityCheck: React.FC = () => {
  // Verificar si ya se han aceptado las cookies
  const hasAcceptedCookies = getCookie(COOKIE_NAMES.COOKIES_ACCEPTED);
  
  // Estado para controlar si el usuario ha sido verificado como humano
  const [isHumanVerified, setIsHumanVerified] = React.useState(false);
  // Estado para controlar si el usuario ha aceptado las cookies
  const [isCookiesAccepted, setIsCookiesAccepted] = React.useState(!!hasAcceptedCookies);
  
  // Función para manejar la verificación de humano
  const handleVerificationComplete = (isHuman: boolean) => {
    setIsHumanVerified(isHuman);
  };
  
  // Función para manejar la aceptación de cookies
  const handleCookiesAccepted = () => {
    setIsCookiesAccepted(true);
  };
  
  // Si el usuario ya ha aceptado las cookies, no mostrar nada
  if (isCookiesAccepted) {
    return null;
  }
  
  // Si el usuario no ha sido verificado como humano, mostrar la verificación
  if (!isHumanVerified) {
    return <HumanVerification onVerificationComplete={handleVerificationComplete} />;
  }
  
  // Si el usuario ha sido verificado como humano pero no ha aceptado cookies, mostrar el banner
  return <CookieBanner isHumanVerified={isHumanVerified} onCookiesAccepted={handleCookiesAccepted} />;
};

export default SecurityCheck;