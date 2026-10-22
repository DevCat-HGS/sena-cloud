import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../Service/API/SocketContext';
import { Socket } from 'socket.io-client';

interface EquipoPedagogicoStatusUpdaterProps {
  miembroEquipoId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const EquipoPedagogicoStatusUpdater: React.FC<EquipoPedagogicoStatusUpdaterProps> = ({
  miembroEquipoId,
  currentStatus,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<string>(currentStatus);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { socket, connectToNamespace } = useSocket();
  const [equipoPedagogicoSocket, setEquipoPedagogicoSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Conectar al namespace de usuarios
    const userSocket = connectToNamespace('/users');
    //setEquipoPedagogicoSocket(userSocket);

    userSocket.on('connect', () => {
      console.log('Conectado al namespace de usuarios para actualizar estado');
    });

    userSocket.on('equipopedagogico-status-updated', (data: { miembroEquipoId: string; status: string }) => {
      if (data.miembroEquipoId === miembroEquipoId) {
        setStatus(data.status);
        setIsUpdating(false);
        if (onStatusChange) {
          onStatusChange(data.status);
        }
      }
    });

    return () => {
      userSocket.off('equipopedagogico-status-updated');
      userSocket.disconnect();
    };
  }, [miembroEquipoId, connectToNamespace, onStatusChange]);

  const updateStatus = (newStatus: string) => {
    if (equipoPedagogicoSocket && equipoPedagogicoSocket.connected) {
      setIsUpdating(true);
      
      // Emitir evento para actualizar estado
      equipoPedagogicoSocket.emit('update-equipopedagogico-status', {
        miembroEquipoId,
        status: newStatus
      });

      // Configurar timeout para fallback
      const timeout = setTimeout(() => {
        setIsUpdating(false);
        console.warn('Timeout al actualizar estado, intente nuevamente');
      }, 5000);

      // Escuchar respuesta
      equipoPedagogicoSocket.once('equipopedagogico-status-updated', () => {
        clearTimeout(timeout);
      });

      // Escuchar error
      equipoPedagogicoSocket.once('error', (error) => {
        clearTimeout(timeout);
        setIsUpdating(false);
        console.error('Error al actualizar estado:', error);
      });
    } else {
      console.error('No hay conexión con el servidor de sockets');
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

export default EquipoPedagogicoStatusUpdater;