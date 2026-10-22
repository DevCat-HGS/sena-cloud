import React, { useState } from 'react';
import { USER_ROUTES, API_URL } from '../../../Service/API/apiRoutes';

interface CoordinadorStatusUpdaterProps {
  coordinadorId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const CoordinadorStatusUpdater: React.FC<CoordinadorStatusUpdaterProps> = ({
  coordinadorId,
  currentStatus,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<string>(currentStatus);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const updateStatus = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setIsUpdating(true);
    
    try {
      // Usar la ruta HTTP para actualizar el estado del coordinador
      const response = await fetch(`${API_URL}/api/users/${coordinadorId}/coordinador-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ estadoCoordinador: newStatus })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error al actualizar el estado del coordinador';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error al parsear respuesta:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      // Actualizar estado local
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      // Aquí se podría mostrar un mensaje de error al usuario
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={isUpdating}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:max-w-xs sm:text-sm sm:leading-6"
      >
        <option value="pendiente">Pendiente</option>
        <option value="aprobado">Aprobado</option>
        <option value="rechazado">Rechazado</option>
      </select>
      {isUpdating && (
        <span className="text-xs text-gray-500 animate-pulse">Actualizando...</span>
      )}
    </div>
  );
};

export default CoordinadorStatusUpdater;