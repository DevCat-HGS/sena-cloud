import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../Service/API/SocketContext';

interface AdministradorStatusUpdaterProps {
  administradorId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const AdministradorStatusUpdater: React.FC<AdministradorStatusUpdaterProps> = ({
  administradorId,
  currentStatus,
  onStatusChange
}) => {
  const [status, setStatus] = useState<string>(currentStatus || 'Activo');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { connectToNamespace, isConnected } = useSocket();
  const [administradorSocket, setAdministradorSocket] = useState<any>(null);

  useEffect(() => {
    if (isConnected) {
      const socket = connectToNamespace('/users');
      setAdministradorSocket(socket);

      socket.on('status-updated', (data: any) => {
        if (data.id === administradorId) {
          setStatus(data.status);
          setIsUpdating(false);
          if (onStatusChange) {
            onStatusChange(data.status);
          }
        }
      });

      socket.on('error', (error: any) => {
        console.error('Error al actualizar estado:', error);
        setIsUpdating(false);
      });

      return () => {
        socket.off('status-updated');
        socket.off('error');
      };
    }
  }, [administradorId, isConnected, onStatusChange]);

  const updateStatus = (newStatus: string) => {
    if (newStatus === status || isUpdating) return;

    setIsUpdating(true);

    if (administradorSocket) {
      // Emitir evento para actualizar estado
      administradorSocket.emit('update-user-status', {
        id: administradorId,
        status: newStatus
      });

      // No necesitamos configurar timeout, los eventos de socket manejarán la respuesta
    } else {
      // Fallback a HTTP si no hay conexión de socket
      fetch(`http://localhost:3001/api/users/${administradorId}/Coordinacion-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al actualizar estado');
          }
          return response.json();
        })
        .then(data => {
          setStatus(data.status);
          setIsUpdating(false);
          if (onStatusChange) {
            onStatusChange(data.status);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setIsUpdating(false);
        });
    }
  };

  return (
    <div className="flex items-center">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={isUpdating}
        className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
          isUpdating ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          status === 'Activo'
            ? 'text-green-700 bg-green-50 border-green-200'
            : status === 'Inactivo'
            ? 'text-red-700 bg-red-50 border-red-200'
            : status === 'Suspendido'
            ? 'text-orange-700 bg-orange-50 border-orange-200'
            : 'text-gray-700 bg-white border-gray-300'
        }`}
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
        <option value="Suspendido">Suspendido</option>
      </select>
      {isUpdating && (
        <div className="ml-2">
          <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default AdministradorStatusUpdater;