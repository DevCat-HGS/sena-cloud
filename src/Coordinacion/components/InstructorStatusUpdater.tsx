import React, { useState } from 'react';
import { USER_ROUTES, API_URL } from '../../Service/API/apiRoutes';

interface InstructorStatusUpdaterProps {
  instructorId: string;
  initialStatus: 'pendiente' | 'aprobado';
  onStatusChange?: (newStatus: 'pendiente' | 'aprobado') => void;
}

const InstructorStatusUpdater: React.FC<InstructorStatusUpdaterProps> = ({
  instructorId,
  initialStatus,
  onStatusChange
}) => {
  const [status, setStatus] = useState<'pendiente' | 'aprobado'>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: 'pendiente' | 'aprobado') => {
    if (newStatus === status) return;
    
    setIsUpdating(true);
    
    try {
      // Usar la ruta HTTP para actualizar el estado del instructor
      const response = await fetch(`${API_URL}${USER_ROUTES.UPDATE_INSTRUCTOR_STATUS(instructorId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ estadoInstructor: newStatus })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error al actualizar el estado del instructor';
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
      <span className="text-sm font-medium">Estado:</span>
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value as 'pendiente' | 'aprobado')}
          disabled={isUpdating}
          className={`
            appearance-none
            pl-3 pr-8 py-1 rounded-md text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-green-500
            ${status === 'aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isUpdating && (
        <div className="animate-spin h-4 w-4 border-2 border-green-500 rounded-full border-t-transparent"></div>
      )}
    </div>
  );
};

export default InstructorStatusUpdater;