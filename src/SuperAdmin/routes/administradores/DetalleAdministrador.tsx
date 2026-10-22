import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../../Service/API/apiRoutes';

interface Administrador {
  id: string;
  nombre: string;
  tipoDocumento: string;
  documento: string;
  correoInstitucional: string;
  correoPersonal: string;
  etiquetas: string[];
  createdAt: string;
  updatedAt: string;
}

const DetalleAdministrador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [administrador, setAdministrador] = useState<Administrador | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdministrador = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Usar HTTP API
        const response = await fetch(`${API_URL}${USER_ROUTES.GET_BY_ID(id as string)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener detalles del administrador');
        }
        
        const data = await response.json();
        
        if (data.rol !== 'Admin') {
          throw new Error('El usuario no es un administrador');
        }
        
        setAdministrador({
          id: data._id || data.id,
          nombre: data.nombre,
          tipoDocumento: data.tipoDocumento,
          documento: data.documento,
          correoInstitucional: data.correoInstitucional,
          correoPersonal: data.correoPersonal || '',
          etiquetas: data.etiquetas || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'Error al obtener detalles del administrador');
        
        // Si el error es porque el usuario no es un administrador, redirigir a la lista
        if (error.message === 'El usuario no es un administrador') {
          navigate('/SuperAdmin/usuarios/administradores');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdministrador();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
          <Link
            to="/SuperAdmin/usuarios/administradores"
            className="inline-flex items-center text-green-600 hover:text-green-800"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver a la lista de administradores
          </Link>
        </div>
      </div>
    );
  }

  if (!administrador) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">No se encontró el administrador.</p>
          <Link
            to="/SuperAdmin/usuarios/administradores"
            className="inline-flex items-center text-green-600 hover:text-green-800 mt-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver a la lista de administradores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">Detalles del Administrador</h1>
          <div className="flex space-x-2">
            <Link
              to={`/SuperAdmin/usuarios/administradores/${id}/editar`}
              className="bg-white text-green-600 p-2 rounded-full hover:bg-green-50"
              title="Editar"
            >
              <Edit size={18} />
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <Link
              to="/SuperAdmin/usuarios/administradores"
              className="inline-flex items-center text-green-600 hover:text-green-800"
            >
              <ArrowLeft size={16} className="mr-1" />
              Volver a la lista de administradores
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Información Personal</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="text-base font-medium">{administrador.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documento</p>
                    <p className="text-base font-medium">
                      {administrador.tipoDocumento} {administrador.documento}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Información de Contacto</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Correo Institucional</p>
                    <p className="text-base font-medium">{administrador.correoInstitucional}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Correo Personal</p>
                    <p className="text-base font-medium">{administrador.correoPersonal || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Etiquetas</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {administrador.etiquetas.length > 0 ? (
                      administrador.etiquetas.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay etiquetas asignadas</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Información del Sistema</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="text-base font-medium">
                      {new Date(administrador.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última Actualización</p>
                    <p className="text-base font-medium">
                      {new Date(administrador.updatedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleAdministrador;