import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../../Service/API/apiRoutes';
import DegradeToInstructor from '../../../Coordinacion/components/DegradeToInstructor';

interface MiembroEquipoPedagogico {
  id: string;
  nombre: string;
  correoInstitucional: string;
  documento: string;
  tipoDocumento: string;
  etiquetas: string[];
  estadoEquipoPedagogico: string;
}

const ListaEquipoPedagogico: React.FC = () => {
  const [miembrosEquipo, setMiembrosEquipo] = useState<MiembroEquipoPedagogico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar miembros del equipo pedagógico al montar el componente
    fetchMiembrosEquipo();
  }, []);
  


  const fetchMiembrosEquipo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar HTTP para obtener la lista de miembros usando USER_ROUTES
      const response = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}?rol=EquipoPedagogico`, {
        credentials: 'include' // Asegura que las cookies se envíen con la solicitud
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar la lista del equipo pedagógico');
      }
      
      const data = await response.json();
      console.log('Lista de miembros del equipo pedagógico recibida:', data);
      
      // Mapear datos recibidos al formato esperado
      const miembros = data.map((miembro: any) => ({
        id: miembro._id,
        nombre: miembro.nombre || 'Sin nombre',
        correoInstitucional: miembro.correoInstitucional || 'Sin correo',
        documento: miembro.documento || 'Sin documento',
        tipoDocumento: miembro.tipoDocumento || 'Sin tipo',
        etiquetas: miembro.etiquetas || [],
        estadoEquipoPedagogico: miembro.estadoEquipoPedagogico || 'pendiente'
      }));
      
      setMiembrosEquipo(miembros);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la lista del equipo pedagógico');
    } finally {
      setLoading(false);
    }
  };
  




  // Función para eliminar un miembro del equipo pedagógico
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este miembro del equipo pedagógico?')) {
      try {
        setLoading(true);
        setError(null);
        
        // Usar HTTP para eliminar el miembro usando USER_ROUTES
        const response = await fetch(`${API_URL}${USER_ROUTES.DELETE(id)}`, {
          method: 'DELETE',
          credentials: 'include', // Asegura que las cookies se envíen con la solicitud
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al eliminar el miembro del equipo pedagógico');
        }
        
        console.log('Miembro eliminado con éxito');
        // Actualizar la lista después de eliminar
        setMiembrosEquipo(prev => prev.filter(miembro => miembro.id !== id));
      } catch (err) {
        console.error('Error al eliminar:', err);
        setError(err instanceof Error ? err.message : 'Error al eliminar el miembro del equipo pedagógico');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // La función handleDelete ya implementa la eliminación vía HTTP

  // Filtrar miembros del equipo pedagógico según término de búsqueda
  const filteredMiembros = miembrosEquipo.filter(miembro => {
    const searchLower = searchTerm.toLowerCase();
    return (
      miembro.nombre.toLowerCase().includes(searchLower) ||
      miembro.correoInstitucional.toLowerCase().includes(searchLower) ||
      miembro.documento.toLowerCase().includes(searchLower) ||
      miembro.etiquetas.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Equipo Pedagógico</h1>
        {/* <Link
          to="/Coordinacion/usuarios/equipo-pedagogico/crear"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Nuevo Miembro
        </Link> */}
      </div>
      
      {/* Barra de búsqueda */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, correo, documento o etiquetas..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabla de miembros del equipo pedagógico */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : filteredMiembros.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo Institucional
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etiquetas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMiembros.map((miembro) => (
                <tr key={miembro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{miembro.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{miembro.correoInstitucional}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {miembro.tipoDocumento}: {miembro.documento}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {miembro.etiquetas.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      miembro.estadoEquipoPedagogico === 'aprobado' 
                        ? 'bg-green-100 text-green-800' 
                        : miembro.estadoEquipoPedagogico === 'rechazado' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {miembro.estadoEquipoPedagogico.charAt(0).toUpperCase() + miembro.estadoEquipoPedagogico.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        to={`/Coordinacion/usuarios/equipo-pedagogico/${miembro.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link 
                        to={`/Coordinacion/usuarios/equipo-pedagogico/${miembro.id}/editar`} 
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(miembro.id)} 
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                      <DegradeToInstructor 
                        userId={miembro.id} 
                        onSuccess={fetchMiembrosEquipo}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No se encontraron miembros del equipo pedagógico.</p>
          {/* <Link 
            to="/Coordinacion/usuarios/equipo-pedagogico/crear" 
            className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            Crear nuevo miembro
          </Link> */}
        </div>
      )}
    </div>
  );
};

export default ListaEquipoPedagogico;