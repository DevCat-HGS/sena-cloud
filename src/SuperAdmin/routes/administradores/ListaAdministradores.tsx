import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../../Service/API/apiRoutes';

interface Administrador {
  id: string;
  nombre: string;
  correoInstitucional: string;
  documento: string;
  tipoDocumento: string;
  etiquetas: string[];
}

const ListaAdministradores: React.FC = () => {
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar administradores cuando el componente se monta
    fetchAdministradores();
  }, []);

  // Función para cargar administradores desde la API
  const fetchAdministradores = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar HTTP para obtener la lista de administradores
      const response = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}?rol=Admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar administradores: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Administradores recibidos:', data);
      setAdministradores(data.map(mapUserToAdmin));
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      setError('Error al cargar los administradores. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para mapear datos de usuario a formato de administrador
  const mapUserToAdmin = (user: any): Administrador => ({
    id: user._id || user.id,
    nombre: user.nombre,
    correoInstitucional: user.correoInstitucional,
    documento: user.documento,
    tipoDocumento: user.tipoDocumento,
    etiquetas: user.etiquetas || []
  });
  
  // Función para eliminar un administrador
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este administrador?')) {
      return;
    }
    
    try {
      console.log('Intentando eliminar administrador con ID:', id);
      
      // Usar HTTP para eliminar el administrador
      const response = await fetch(`${API_URL}${USER_ROUTES.DELETE(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el administrador');
      }
      
      console.log('Administrador eliminado correctamente');
      
      // Actualizar estado local
      setAdministradores(prev => prev.filter(admin => admin.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el administrador. Por favor, intente nuevamente.');
    }
  };
  
  // Filtrar administradores según término de búsqueda
  const filteredAdministradores = administradores.filter(admin => 
    admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.correoInstitucional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.documento.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administradores</h1>
        <Link
          to="/SuperAdmin/usuarios/administradores/crear"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Nuevo Administrador
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por nombre, correo o documento..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-500">Cargando administradores...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchAdministradores}
              className="mt-2 text-green-600 hover:text-green-800 underline"
            >
              Reintentar
            </button>
          </div>
        ) : filteredAdministradores.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No se encontraron administradores.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Institucional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdministradores.map((admin, index) => (
                  <tr key={admin.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {admin.tipoDocumento} {admin.documento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{admin.correoInstitucional}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {admin.etiquetas.map((tag, index) => (
                          <span
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/SuperAdmin/usuarios/administradores/${admin.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/SuperAdmin/usuarios/administradores/${admin.id}/editar`} 
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
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
};

export default ListaAdministradores;