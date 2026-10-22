import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../Service/API/AuthContext';
import { API_URL } from '../../../Service/API/apiRoutes';
import { Check, AlertCircle, Upload, File, FileText, Trash2, Download, Share, X, Edit, Loader2, Users } from 'lucide-react';
// Eliminando importaciones de componentes UI que no existen en este proyecto
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { formatDate } from '@/lib/utils';

const GuidesPage = () => {
  const { user, getToken } = useAuth();
  const token = getToken();
  const [sentDocs, setSentDocs] = useState<any[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSent, setLoadingSent] = useState<boolean>(false);
  const [loadingUploaded, setLoadingUploaded] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [shareFile, setShareFile] = useState<string | null>(null);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar documentos
  useEffect(() => {
    if (token && user?.id) {
      fetchAllFiles();
      fetchUploadedDocs();
    }
  }, [token, user?.id]);
  
  const fetchUploadedDocs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/doc-shares/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadedDocs(response.data.documents);
    } catch (error) {
      console.error('Error al cargar documentos subidos:', error);
      setMessage({ text: 'Error al cargar documentos subidos', type: 'error' });
    }
  };

  // Función para manejar la carga de archivos
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar que el archivo sea PDF o Word
      const fileType = file.type;
      if (!fileType.includes('pdf') && !fileType.includes('word') && !fileType.includes('msword') && !fileType.includes('openxmlformats-officedocument')) {
        setMessage({ text: 'Solo se permiten archivos PDF o Word', type: 'error' });
        return;
      }
      
      setLoading(true);
      
      try {
        // Obtener token fresco
        const freshToken = getToken();
        if (!freshToken) {
          setMessage({ text: 'Sesión expirada. Por favor, inicie sesión nuevamente', type: 'error' });
          setLoading(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('document', file);
        
        const response = await axios.post(`${API_URL}/api/doc-shares/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${freshToken}`
          }
        });
        
        setMessage({ text: 'Documento subido correctamente', type: 'success' });
        
        // Actualizar la lista de documentos
        fetchAllFiles();
        
      } catch (error) {
        console.error('Error al subir documento:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setMessage({ text: 'Error de autenticación. Por favor, inicie sesión nuevamente', type: 'error' });
        } else {
          setMessage({ text: 'Error al subir documento', type: 'error' });
        }
      } finally {
        setLoading(false);
        // Limpiar el input de archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Función para renombrar archivos
  const handleRenameFile = async (oldName: string) => {
    if (!newFileName || newFileName === oldName) {
      setEditingId(null);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/api/doc-shares/rename`, 
        { oldName, newName: newFileName },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setMessage({ text: 'Archivo renombrado correctamente', type: 'success' });
      fetchAllFiles();
    } catch (error) {
      console.error('Error al renombrar archivo:', error);
      setMessage({ text: 'Error al renombrar el archivo', type: 'error' });
    } finally {
      setLoading(false);
      setEditingId(null);
    }
  };

  // Función para eliminar archivos
  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el archivo "${fileName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/api/doc-shares/delete/${encodeURIComponent(fileName)}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setMessage({ text: 'Archivo eliminado correctamente', type: 'success' });
      fetchAllFiles();
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      setMessage({ text: 'Error al eliminar el archivo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Función para compartir archivos
  const handleShareFile = (fileName: string) => {
    setShareFile(fileName);
    fetchInstructors();
  };
  
  // Función para obtener instructores aprobados
  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      // Volvemos a la URL original que sí existe en el backend
      const response = await axios.get(`${API_URL}/api/users/instructors/approved`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      // La respuesta ahora es directamente el array de instructores
      console.log('Datos de instructores recibidos:', response.data);
      
      // Si los instructores solo tienen _id, intentamos obtener más información
      if (response.data && response.data.length > 0 && response.data[0]._id && !response.data[0].nombre) {
        // Obtenemos detalles adicionales para cada instructor
        const instructorsWithDetails = await Promise.all(
          response.data.map(async (instructor: { _id: string }) => {
            try {
              const detailsResponse = await axios.get(`${API_URL}/api/users/${instructor._id}`, {
                headers: {
                  Authorization: `Bearer ${getToken()}`
                }
              });
              return detailsResponse.data;
            } catch (err) {
              console.error(`Error al obtener detalles del instructor ${instructor._id}:`, err);
              return instructor; // Devolvemos el instructor original si hay error
            }
          })
        );
        console.log('Instructores con detalles:', instructorsWithDetails);
        setInstructors(instructorsWithDetails || []);
      } else {
        setInstructors(response.data || []);
      }
    } catch (error) {
      console.error('Error al obtener instructores:', error);
      setMessage({ text: 'Error al cargar instructores', type: 'error' });
    } finally {
      setLoadingInstructors(false);
    }
  };

  // Función para enviar archivo a un instructor
  const handleSendFileToInstructor = async (instructorId: string) => {
    if (!shareFile) return;
    
    try {
      setLoading(true);
      // Buscar el archivo en la lista de archivos
      const fileToShare = sentDocs.find((file: any) => file.name === shareFile);
      if (!fileToShare) {
        setMessage({ text: 'Archivo no encontrado', type: 'error' });
        return;
      }
      
      console.log('Compartiendo archivo:', fileToShare);
      
      // Usar el endpoint específico para compartir por nombre de archivo
      // Asegurarse de que instructorIds sea un array
      const shareResponse = await axios.post(`${API_URL}/api/doc-shares/send/${fileToShare.name}`, 
        {
          instructorIds: [instructorId]
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Archivo compartido:', shareResponse.data);
      setMessage({ text: 'Archivo compartido exitosamente', type: 'success' });
      setLoading(false);
      setShareFile(''); // Cerrar el modal después de compartir
    } catch (error) {
      console.error('Error al compartir archivo:', error);
      setMessage({ text: 'Error al compartir el archivo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para obtener todos los archivos
  const fetchAllFiles = async () => {
    try {
      setLoadingSent(true);
      const response = await axios.get(`${API_URL}/api/doc-shares/files`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      setSentDocs(response.data.files || []);
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      setMessage({ text: 'Error al cargar archivos', type: 'error' });
    } finally {
      setLoadingSent(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">
        Gestión de Guías para Instructores
      </h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <Check size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8">
        {/* Componente de carga de archivos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Subir Documento</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Documento (PDF/Word)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, DOC (MAX. 10MB)</p>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {loading && (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin h-5 w-5 text-green-600 border-2 border-t-transparent rounded-full"></div>
              </div>
            )}
            {message.text && (
              <div className={`mt-4 p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="flex items-center">
                  {message.type === 'success' ? <Check size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Lista de documentos enviados */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Guías Subidas</h2>
          
          <div className="overflow-y-auto max-h-96">
            {loadingSent ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : sentDocs.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sentDocs.map((doc, index) => {
                  const isEditing = editingId === doc.name;
                  const fileExtension = doc.name.split('.').pop()?.toLowerCase();
                  const isPreviewable = fileExtension === 'pdf';
                  
                  return (
                    <li key={doc.id || doc.name || index} className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {fileExtension === 'pdf' ? (
                              <FileText className="h-6 w-6 text-red-400" />
                            ) : ['doc', 'docx'].includes(fileExtension || '') ? (
                              <FileText className="h-6 w-6 text-blue-400" />
                            ) : (
                              <File className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            {isEditing ? (
                              <input
                                type="text"
                                className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRenameFile(doc.name);
                                  } else if (e.key === 'Escape') {
                                    setEditingId(null);
                                  }
                                }}
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            )}
                            <div className="mt-1 flex items-center">
                              <p className="text-sm text-gray-500">
                                {doc.modifiedAt ? new Date(doc.modifiedAt).toLocaleDateString() : 'Fecha desconocida'}
                              </p>
                              <span className="mx-1 text-gray-500">•</span>
                              <p className="text-xs text-gray-500">
                                {(doc.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleRenameFile(doc.name)}
                                className="text-green-600 hover:text-green-800"
                                title="Guardar"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-red-600 hover:text-red-800"
                                title="Cancelar"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {isPreviewable && (
                                <button
                                  onClick={() => handleShareFile(doc.name)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Compartir"
                                >
                                  <Share className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingId(doc.name);
                                  setNewFileName(doc.name);
                                }}
                                className="text-gray-600 hover:text-gray-800"
                                title="Editar nombre"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFile(doc.name)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm py-4">No hay documentos disponibles</p>
            )}
          </div>
          
          {/* Modal de compartir */}
          {shareFile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-4/5 max-w-md flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-medium">Enviar archivo a</h3>
                  <button onClick={() => setShareFile(null)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-auto max-h-96">
                  {loadingInstructors ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  ) : instructors.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {instructors.map((instructor, index) => {
                        // Log para depuración
                        console.log('Instructor individual:', instructor);
                        return (
                        <li key={instructor.id || instructor._id || index} className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{instructor.name || `${instructor.nombre || ''} ${instructor.apellido || ''}`}</p>
                                <p className="text-xs text-gray-500">{instructor.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendFileToInstructor(instructor._id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Enviar
                            </button>
                          </div>
                        </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm py-4">No hay instructores disponibles</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default GuidesPage;