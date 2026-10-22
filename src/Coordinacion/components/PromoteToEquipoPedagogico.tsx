import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../Service/API/apiRoutes';
import { authService } from '../../Service/API/authService';

interface PromoteToEquipoPedagogicoProps {
  instructorId: string;
  onPromote: () => void;
}

const PromoteToEquipoPedagogico: React.FC<PromoteToEquipoPedagogicoProps> = ({ 
  instructorId, 
  onPromote 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esta función ha sido reemplazada por promoteInstructor

  // Añadimos un log para depurar cuando se renderiza el componente
  console.log('Renderizando componente PromoteToEquipoPedagogico para instructor:', instructorId);
  
  // Función directa para manejar la promoción sin confirmación
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Botón de promoción clickeado');
    
    // Ejecutar directamente sin confirmación para depurar
    promoteInstructor();
  };
  
  // Función que realiza la promoción sin la confirmación
  const promoteInstructor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando proceso de promoción para instructor:', instructorId);

      // Obtener el token de autenticación
      const token = authService.getToken();
      const userId = authService.getCurrentUserId();
      const isAuthenticated = authService.isAuthenticated();
      
      console.log('Estado de autenticación:', { 
        isAuthenticated, 
        userId,
        tokenExists: !!token,
        tokenLength: token ? token.length : 0
      });
      
      if (!token) {
        console.error('No hay token de autenticación');
        window.alert('No estás autenticado. Serás redirigido a la página de inicio de sesión.');
        window.location.href = '/login';
        return;
      }

      console.log('Intentando promover instructor con ID:', instructorId);
      console.log('URL de la API:', `${API_URL}${USER_ROUTES.PROMOTE_TO_EQUIPO_PEDAGOGICO(instructorId)}`);
      
      const response = await fetch(`${API_URL}${USER_ROUTES.PROMOTE_TO_EQUIPO_PEDAGOGICO(instructorId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Esto asegura que las cookies se envíen con la solicitud
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (response.status === 401) {
        console.error('Error 401: No autenticado');
        authService.logout(); // Limpiar la sesión actual
        window.alert('Tu sesión ha expirado. Serás redirigido a la página de inicio de sesión.');
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        const errorMsg = 'No tienes permisos suficientes para realizar esta acción. Se requiere rol de Admin, SuperAdmin o Coordinación.';
        setError(errorMsg);
        console.error(errorMsg);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al promover al instructor' }));
        console.error('Datos de error:', errorData);
        throw new Error(errorData.message || 'Error al promover al instructor');
      }

      const successData = await response.json();
      console.log('Promoción exitosa:', successData);
      
      // Mostrar mensaje de éxito
      window.alert('Instructor promovido a equipo pedagógico exitosamente');
      
      // Llamar al callback para actualizar la UI
      onPromote();
    } catch (err) {
      console.error('Error al promover instructor:', err);
      setError(err instanceof Error ? err.message : 'Error al promover al instructor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-purple-600 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded"
        title="Promover a Equipo Pedagógico"
        type="button"
      >
        <ArrowUpRight size={18} />
        <span className="text-xs">Promover</span>
      </button>
      
      {loading && <span className="text-xs text-gray-500 ml-2">Procesando...</span>}
      
      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
    </>
  );
};

export default PromoteToEquipoPedagogico;