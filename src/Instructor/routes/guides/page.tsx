import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaEye, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../Service/API/AuthContext';
import { API_URL } from '../../../Service/API/apiRoutes';

interface DocShare {
  _id: string;
  fileName: string;
  fileType: string;
  senderId: {
    name: string;
    email: string;
  };
  isRead: boolean;
  sentAt: string;
}

const GuidesPage = () => {
  const [receivedDocs, setReceivedDocs] = useState<DocShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReceivedDocs();
    } else {
      setError('No se encontró información de usuario. Por favor, inicie sesión nuevamente.');
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchReceivedDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id) {
        setError('No se encontró información de usuario. Por favor, inicie sesión nuevamente.');
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/doc-shares/received/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Respuesta completa:', response);
      console.log('Tipo de response.data:', typeof response.data);
      console.log('Contenido de response.data:', response.data);
      
      // Asegurarse de que receivedDocs siempre sea un array
      let docsData = [];
      
      // Intentar extraer los datos correctamente según la estructura de la respuesta
      if (Array.isArray(response.data)) {
        docsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto, buscar propiedades que puedan contener los documentos
        const possibleArrayProps = ['docs', 'documents', 'data', 'result', 'shares'];
        
        for (const prop of possibleArrayProps) {
          if (Array.isArray(response.data[prop])) {
            docsData = response.data[prop];
            break;
          }
        }
      }
      
      console.log('Datos procesados para usar:', docsData);
      setReceivedDocs(docsData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener documentos recibidos:', error);
      setError('Error al cargar los documentos. Por favor, intente nuevamente.');
      setLoading(false);
      setReceivedDocs([]);
    }
  };

  const handleMarkAsRead = async (docId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        return;
      }

      await axios.put(`${API_URL}/api/doc-shares/read/${docId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Actualizar el estado local para reflejar el cambio
      setReceivedDocs(prevDocs => 
        prevDocs.map(doc => 
          doc._id === docId ? { ...doc, isRead: true } : doc
        )
      );
    } catch (error) {
      console.error('Error al marcar documento como leído:', error);
      setError('Error al marcar el documento como leído. Por favor, intente nuevamente.');
    }
  };

  const handleDownloadDoc = async (fileId: string, fileName: string) => {
    try {
      const token = getToken();
      
      if (!token) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        return;
      }

      const response = await axios.get(`${API_URL}/api/doc-shares/download/${fileId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear un elemento <a> para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Añadir el elemento al DOM, hacer clic y luego eliminarlo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      setError('Error al descargar el documento. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700">
        Guías del Instructor
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-green-600 text-3xl" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : receivedDocs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No tienes documentos recibidos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receivedDocs.map((doc) => (
            <div key={doc._id} className={`border rounded-lg shadow-sm overflow-hidden ${doc.isRead ? 'border-gray-200' : 'border-green-500'}`}>
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{doc.fileName}</h3>
                  {!doc.isRead && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Nuevo
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">De:</span> {doc.senderId.name}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Fecha:</span> {new Date(doc.sentAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Estado:</span>{' '}
                  {doc.isRead ? (
                    <span className="text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" /> Leído
                    </span>
                  ) : (
                    <span className="text-yellow-600">No leído</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 flex justify-between">
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => handleDownloadDoc(doc._id, doc.fileName)}
                >
                  <FaDownload className="mr-2" /> Descargar
                </button>
                {!doc.isRead && (
                  <button 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => handleMarkAsRead(doc._id)}
                  >
                    <FaEye className="mr-2" /> Marcar como leído
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuidesPage;