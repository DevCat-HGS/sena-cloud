import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../../Service/API/apiRoutes';
import { useAuth } from '../../../../Service/API/AuthContext';
import { userService } from '../../../../Service/API/userService';

interface ExcelShare {
  _id: string;
  fileId: string;
  fileName: string;
  senderId: string | { _id: string; name: string; email: string };
  recipientId: string;
  isRead: boolean;
  sentAt: string;
}

// Componente para mostrar el nombre del remitente
const SenderName = ({ senderId }: { senderId: string | { _id: string; name: string; email: string } }) => {
  const [senderName, setSenderName] = useState<string>('Cargando...');

  useEffect(() => {
    const fetchSenderName = async () => {
      try {
        console.log('Datos del remitente recibidos:', JSON.stringify(senderId));
        
        // Si ya tenemos un objeto con la información del remitente
        if (senderId && typeof senderId === 'object') {
          // Verificar todas las posibles propiedades de nombre
          const name = (senderId as any).name || (senderId as any).nombre;
          const email = (senderId as any).email || (senderId as any).correoInstitucional || (senderId as any).correoPersonal;
          const id = (senderId as any)._id || (senderId as any).id;
          
          console.log('Propiedades encontradas:', { name, email, id });
          
          if (name) {
            setSenderName(name);
            console.log('Nombre establecido desde la propiedad name/nombre:', name);
          } else if (email) {
            setSenderName(email);
            console.log('Nombre establecido desde la propiedad email/correo:', email);
          } else if (id) {
            // Si solo tenemos el ID en el objeto, intentamos buscar el usuario
            console.log('Buscando usuario con ID desde objeto:', id);
            try {
              const user = await userService.getUserById(id);
              console.log('Usuario encontrado por ID desde objeto:', JSON.stringify(user));
              
              if (user && typeof user === 'object') {
                // Intentar obtener el nombre o email del usuario usando las propiedades correctas
                if ((user as any).nombre) {
                  setSenderName((user as any).nombre);
                  console.log('Nombre establecido desde API (nombre):', (user as any).nombre);
                } else if (user.name) {
                  setSenderName(user.name);
                  console.log('Nombre establecido desde API (name):', user.name);
                } else if ((user as any).correoInstitucional) {
                  setSenderName((user as any).correoInstitucional);
                  console.log('Nombre establecido desde API (correoInstitucional):', (user as any).correoInstitucional);
                } else if ((user as any).correoPersonal) {
                  setSenderName((user as any).correoPersonal);
                  console.log('Nombre establecido desde API (correoPersonal):', (user as any).correoPersonal);
                } else if (user.email) {
                  setSenderName(user.email);
                  console.log('Nombre establecido desde API (email):', user.email);
                } else {
                  setSenderName(id);
                  console.log('Usando ID como nombre porque no se encontraron otras propiedades:', id);
                }
              } else {
                setSenderName(id);
                console.log('Usando ID como nombre porque el usuario no es un objeto válido:', id);
              }
            } catch (error) {
              console.error('Error al obtener información del remitente por ID en objeto:', error);
              setSenderName(id); // Mostrar al menos el ID
            }
          } else {
            setSenderName('Nombre no disponible');
            console.log('No se encontraron propiedades de nombre, email o ID en el objeto remitente');
          }
          return;
        }
        
        // Si solo tenemos el ID como string, buscamos la información del usuario
        if (senderId && typeof senderId === 'string') {
          try {
            console.log('Buscando usuario con ID:', senderId);
            console.log('URL de la API:', `${API_URL}/api/users/${senderId}`);
            
            // Intentar obtener el token para depuración
            const getCookieValue = (name: string): string | null => {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) {
                const lastPart = parts.pop();
                return lastPart ? lastPart.split(';').shift() || null : null;
              }
              return null;
            };
            
            const token = 
              localStorage.getItem('token') || 
              getCookieValue('senacloud_auth_token') || 
              getCookieValue('auth_token') || 
              localStorage.getItem('auth_token');
            
            console.log('Token disponible para la petición:', token ? 'Sí' : 'No');
            
            const user = await userService.getUserById(senderId);
            console.log('Usuario encontrado (respuesta completa):', JSON.stringify(user));
            
            if (user) {
              // Verificar si tenemos un objeto de usuario válido
              if (typeof user === 'object') {
                // Intentar obtener el nombre o email del usuario usando las propiedades correctas
                if ((user as any).nombre) {
                  setSenderName((user as any).nombre);
                } else if (user.name) {
                  setSenderName(user.name);
                } else if ((user as any).correoInstitucional) {
                  setSenderName((user as any).correoInstitucional);
                } else if ((user as any).correoPersonal) {
                  setSenderName((user as any).correoPersonal);
                } else if (user.email) {
                  setSenderName(user.email);
                } else if ((user as any)._id) {
                  setSenderName((user as any)._id); // Usar _id si está disponible
                } else if ((user as any).id) {
                  setSenderName((user as any).id); // Usar id si está disponible
                } else {
                  setSenderName(senderId); // Mostrar al menos el ID
                }
              } else {
                setSenderName(senderId); // Mostrar al menos el ID
              }
            } else {
              setSenderName(senderId); // Mostrar al menos el ID
            }
          } catch (error) {
            console.error('Error al obtener información del remitente:', error);
            setSenderName(senderId); // Mostrar al menos el ID
          }
        } else {
          setSenderName('Remitente desconocido');
        }
      } catch (error) {
        console.error('Error en el componente SenderName:', error);
        setSenderName('Error al cargar nombre');
      }
    };

    fetchSenderName();
  }, [senderId]);

  return <span>{senderName}</span>;
};

export default function InstructorReportesPage() {
  const [excelFiles, setExcelFiles] = useState<ExcelShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Función para obtener el ID del usuario desde localStorage si no está disponible en el contexto
  const getUserId = () => {
    try {
      // Intentar obtener el ID directamente del localStorage (formato senacloud_user)
      const userStr = localStorage.getItem('senacloud_user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log('Datos de usuario encontrados en localStorage:', userData);
          
          // Verificar el formato correcto según authService.ts
          if (userData && userData.id) {
            console.log('ID de usuario obtenido de localStorage.senacloud_user:', userData.id);
            return userData.id;
          }
          
          // Verificar formato alternativo
          if (userData && userData._id) {
            console.log('ID de usuario obtenido de localStorage.senacloud_user:', userData._id);
            return userData._id;
          }
        } catch (parseError) {
          console.error('Error al parsear usuario de localStorage:', parseError);
        }
      }
      
      // Intentar obtener el ID de las cookies (según authService.ts)
      const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const lastPart = parts.pop();
          return lastPart ? lastPart.split(';').shift() || null : null;
        }
        return null;
      };
      
      const userIdFromCookie = getCookieValue('senacloud_user_id');
      if (userIdFromCookie) {
        console.log('ID de usuario obtenido de cookie senacloud_user_id:', userIdFromCookie);
        return userIdFromCookie;
      }
      
      // Intentar obtener el ID del token decodificado (si está en formato JWT)
      const token = localStorage.getItem('token') || getCookieValue('senacloud_auth_token');
      if (token) {
        try {
          // Intentar extraer el ID del usuario del token JWT (si está en ese formato)
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Payload del token JWT:', payload);
            
            if (payload && payload.id) {
              console.log('ID de usuario obtenido del token JWT:', payload.id);
              return payload.id;
            }
            if (payload && payload.userId) {
              console.log('ID de usuario obtenido del token JWT:', payload.userId);
              return payload.userId;
            }
            if (payload && payload._id) {
              console.log('ID de usuario obtenido del token JWT:', payload._id);
              return payload._id;
            }
            if (payload && payload.sub) {
              console.log('ID de usuario obtenido del token JWT (sub):', payload.sub);
              return payload.sub;
            }
          }
        } catch (tokenError) {
          console.error('Error al decodificar token:', tokenError);
        }
      }
      
      // Intentar obtener el ID de otras posibles fuentes en localStorage
      const userId = localStorage.getItem('userId');
      if (userId) {
        console.log('ID de usuario obtenido de localStorage.userId:', userId);
        return userId;
      }
      
      // Mostrar todas las cookies y localStorage para debugging
      console.log('Todas las cookies disponibles:', document.cookie);
      console.log('Todas las claves en localStorage:', Object.keys(localStorage));
      
      console.error('No se pudo obtener el ID del usuario de ninguna fuente');
      return null;
    } catch (error) {
      console.error('Error al obtener el ID del usuario:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchExcelFiles = async () => {
      try {
        // Intentar obtener el ID del usuario del contexto o del localStorage
        const userId = user?._id || getUserId();
        
        if (!userId) {
          console.error('No se pudo obtener el ID del usuario');
          setError('No se pudo obtener el ID del usuario. Por favor, inicie sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        // Obtener el token de varias fuentes posibles
        const getCookieValue = (name: string): string | null => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) {
            const lastPart = parts.pop();
            return lastPart ? lastPart.split(';').shift() || null : null;
          }
          return null;
        };
        
        // Intentar obtener el token de diferentes fuentes
        const token = 
          localStorage.getItem('token') || 
          getCookieValue('senacloud_auth_token') || 
          getCookieValue('auth_token') || 
          localStorage.getItem('auth_token');
        
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token) {
          // Si no hay token, intentar hacer la petición sin token
          console.log('No se encontró token de autenticación. Intentando petición sin token...');
        }
        
        console.log('Obteniendo archivos Excel para el usuario:', userId);
        
        // Preparar headers con o sin token
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        console.log('Headers de la petición:', headers);
        
        // Usar la ruta correcta con guiones
        const response = await fetch(`${API_URL}/api/excel-shares/received/${userId}`, {
          method: 'GET',
          headers: headers
        });

        console.log('Respuesta de la API (received):', response.status);
        
        if (!response.ok) {
          // Si es 404, mostrar un mensaje más amigable
          if (response.status === 404) {
            console.log('No se encontraron archivos Excel compartidos');
            setExcelFiles([]);
            setLoading(false);
            return;
          }
          throw new Error(`Error al cargar los archivos Excel. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', JSON.stringify(data));
        
        // Asegurarse de que excelFiles siempre sea un array
        let files = [];
        if (Array.isArray(data)) {
          files = data;
        } else if (data && Array.isArray(data.files)) {
          files = data.files;
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          files = [data]; // Si es un solo objeto, convertirlo en array
        }
        
        console.log('Archivos procesados:', files.length);
        setExcelFiles(files);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los archivos Excel:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido al cargar los archivos Excel');
        setLoading(false);
      }
    };

    fetchExcelFiles();
  }, [user]);

  const handleDownload = async (fileId: string) => {
    try {
      console.log('Descargando archivo:', fileId);
      
      // Obtener el token de varias fuentes posibles
      const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const lastPart = parts.pop();
          return lastPart ? lastPart.split(';').shift() || null : null;
        }
        return null;
      };
      
      // Intentar obtener el token de diferentes fuentes
      const token = 
        localStorage.getItem('token') || 
        getCookieValue('senacloud_auth_token') || 
        getCookieValue('auth_token') || 
        localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      // Usando la ruta de reports para descargar, con el formato correcto
      window.open(`${API_URL}/api/reports/download/${fileId}?token=${token}`, '_blank');
    } catch (error) {
      console.error('Error al descargar:', error);
      setError('Error al descargar el archivo Excel. Por favor, intente de nuevo más tarde.');
    }
  };
  
  const markAsRead = async (shareId: string) => {
    try {
      console.log('Marcando como leído:', shareId);
      
      // Obtener el token de varias fuentes posibles
      const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const lastPart = parts.pop();
          return lastPart ? lastPart.split(';').shift() || null : null;
        }
        return null;
      };
      
      // Intentar obtener el token de diferentes fuentes
      const token = 
        localStorage.getItem('token') || 
        getCookieValue('senacloud_auth_token') || 
        getCookieValue('auth_token') || 
        localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/api/excel-shares/read/${shareId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al marcar el archivo como leído. Status: ${response.status}`);
      }
      
      console.log('Archivo marcado como leído correctamente');
      
      // Actualizar el estado local
      setExcelFiles(prevFiles => 
        prevFiles.map(file => 
          file._id === shareId ? {...file, isRead: true} : file
        )
      );
    } catch (error) {
      console.error('Error al marcar como leído:', error);
      setError('Error al marcar el archivo como leído');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Mis Reportes</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : excelFiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay archivos Excel compartidos disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Remitente</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Tamaño</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Fecha de recepción</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {excelFiles.map((file) => (
                  <tr key={file._id} className={!file.isRead ? "bg-blue-50" : ""}>
                    <td className="py-3 px-4 text-sm text-gray-800">{file.fileName}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <SenderName senderId={file.senderId} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">-</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{formatDate(file.sentAt)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${file.isRead ? 'bg-gray-200 text-gray-800' : 'bg-blue-200 text-blue-800'}`}>
                        {file.isRead ? 'Leído' : 'No leído'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleDownload(file.fileId);
                            if (!file.isRead) markAsRead(file._id);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                        >
                          Descargar
                        </button>
                        {!file.isRead && (
                          <button
                            onClick={() => markAsRead(file._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}