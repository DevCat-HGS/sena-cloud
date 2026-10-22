import React, { useState, useEffect } from 'react';

/**
 * Componente que detecta si la resolución de pantalla es demasiado pequeña
 * y muestra un mensaje indicando que la aplicación debe ser accedida desde un computador.
 */
const ResolutionCheck: React.FC = () => {
  const [isMobileResolution, setIsMobileResolution] = useState<boolean>(false);
  
  useEffect(() => {
    // Función para verificar el tamaño de la pantalla
    const checkScreenSize = () => {
      // Consideramos resolución móvil si el ancho es menor a 768px
      setIsMobileResolution(window.innerWidth < 768);
    };
    
    // Verificar al cargar el componente
    checkScreenSize();
    
    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', checkScreenSize);
    
    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // Si no es resolución móvil, no mostramos nada
  if (!isMobileResolution) {
    return null;
  }
  
  // Si es resolución móvil, mostramos el mensaje de advertencia
  return (
    <div className="fixed inset-0 bg-green-600 z-50 flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <img 
          src="https://api-img-hgs.netlify.app/img/senacloud-logo.svg" 
          alt="SenaCloud" 
          className="h-20 w-auto mx-auto mb-6"
        />
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso no disponible
        </h2>
        
        <p className="text-gray-600 mb-6">
          No se puede acceder a esta aplicación desde un dispositivo móvil. 
          Por favor, ingresa desde tu computadora para una experiencia completa.
        </p>
        
        <div className="flex justify-center">
          <svg 
            className="w-16 h-16 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ResolutionCheck;