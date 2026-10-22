import React, { createContext, useContext, ReactNode } from 'react';

// Definimos un tipo para un socket simulado
interface MockSocket {
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string) => void;
  emit: (event: string, data?: any) => void;
  disconnect: () => void;
}

// Creamos un socket simulado
const createMockSocket = (): MockSocket => ({
  on: (event, callback) => {
    console.log(`[Mock Socket] Registrado evento: ${event}`);
    // No hacemos nada con el callback
  },
  off: (event) => {
    console.log(`[Mock Socket] Eliminado evento: ${event}`);
  },
  emit: (event, data) => {
    console.log(`[Mock Socket] Emitido evento: ${event}`, data);
  },
  disconnect: () => {
    console.log('[Mock Socket] Desconectado');
  }
});

// Creamos un mock socket
const mockSocket = createMockSocket();

interface SocketContextType {
  socket: MockSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string) => void;
  connectToNamespace: (namespace: string) => MockSocket;
}

// Valor por defecto del contexto
const defaultValue: SocketContextType = {
  socket: mockSocket,
  isConnected: false,
  connect: () => console.log('[Mock Socket] Conectado'),
  disconnect: () => console.log('[Mock Socket] Desconectado'),
  emit: (event, data) => console.log(`[Mock Socket] Emitido evento: ${event}`, data),
  on: (event, callback) => console.log(`[Mock Socket] Registrado evento: ${event}`),
  off: (event) => console.log(`[Mock Socket] Eliminado evento: ${event}`),
  connectToNamespace: (namespace) => {
    console.log(`[Mock Socket] Conectado a namespace: ${namespace}`);
    return mockSocket;
  }
};

const SocketContext = createContext<SocketContextType>(defaultValue);

// Hook para usar el socket
export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

// Proveedor del contexto
export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children
}) => {
  return (
    <SocketContext.Provider value={defaultValue}>
      {children}
    </SocketContext.Provider>
  );
};