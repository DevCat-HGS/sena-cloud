import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCookie, COOKIE_NAMES } from '../../Service/cookieService';

interface DegradeToInstructorProps {
  userId: string;
  onSuccess?: () => void;
}

const DegradeToInstructor: React.FC<DegradeToInstructorProps> = ({ userId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDegrade = async () => {
    // Confirmación antes de degradar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción degradará al miembro del equipo pedagógico a instructor',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, degradar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        // Obtener el token de autenticación
        const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
        
        const response = await fetch(`http://localhost:3001/api/users/${userId}/degrade-to-instructor`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          let errorMessage = 'Error al degradar miembro';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Error al parsear respuesta de error:', parseError);
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Error al parsear respuesta:', parseError);
          data = { message: 'Operación completada, pero hubo un error al procesar la respuesta' };
        }
        
        Swal.fire({
          title: '¡Éxito!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });

        // Llamar al callback de éxito si existe
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error al degradar miembro',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleDegrade}
      disabled={isLoading}
      className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-2 rounded-md text-xs transition-colors duration-200 shadow-sm"
      title="Degradar a Instructor"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando
        </>
      ) : (
        'Degradar'
      )}
    </button>
  );
};

export default DegradeToInstructor;