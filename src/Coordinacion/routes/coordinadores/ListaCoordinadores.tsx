import { useState, useEffect, FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { USER_ROUTES, API_URL } from '../../../Service/API/apiRoutes';
interface Coordinador {
  id: string;
  nombre: string;
  correoInstitucional: string;
  documento: string;
  tipoDocumento: string;
  etiquetas: string[];
  estadoCoordinador: string;
}

const ListaCoordinadores: FC = () => {
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Función para filtrar coordinadores según el término de búsqueda
  const filteredCoordinadores = coordinadores.filter(coordinador => 
    coordinador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinador.correoInstitucional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinador.documento.includes(searchTerm)
  );

  useEffect(() => {
    // Cargar coordinadores al montar el componente
    fetchCoordinadores();
  }, []);

  // Función para cargar coordinadores desde la API
  const fetchCoordinadores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar HTTP para obtener la lista de coordinadores usando USER_ROUTES
      const response = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}?rol=Coordinacion`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar coordinadores: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Coordinadores recibidos:', data);
      const mappedCoordinadores = data.map(mapUserToCoordinador);
      setCoordinadores(mappedCoordinadores);
    } catch (err) {
      console.error('Error al cargar coordinadores:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar coordinadores');
    } finally {
      setLoading(false);
    }
  };

  // Función para mapear un usuario de la API al formato local
  const mapUserToCoordinador = (user: any): Coordinador => ({
    id: user._id,
    nombre: user.nombre,
    correoInstitucional: user.correoInstitucional,
    documento: user.documento,
    tipoDocumento: user.tipoDocumento,
    etiquetas: user.etiquetas || [],
    estadoCoordinador: user.estadoCoordinador || 'pendiente'
  });

  // Función para eliminar un coordinador
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este coordinador?')) {
      try {
        // Usar HTTP para eliminar el coordinador
        const response = await fetch(`${API_URL}/api/users/${id}`, {
          method: 'DELETE'
        });
          
        if (!response.ok) {
          throw new Error('Error al eliminar el coordinador');
        }
          
        // Actualizar estado local
        setCoordinadores(coordinadores.filter(coordinador => coordinador.id !== id));
      } catch (err) {
        console.error('Error al eliminar:', err);
        alert(err instanceof Error ? err.message : 'Error al eliminar el coordinador');
      }
    }
  };

  // Esta función ya está definida arriba, así que eliminamos esta duplicada

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coordinadores</h1>
        <Link
          to="/Coordinacion/usuarios/coordinadores/crear"
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Coordinador
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar coordinador..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de coordinadores */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Institucional</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiquetas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCoordinadores.length > 0 ? (
                filteredCoordinadores.map((coordinador) => (
                  <tr key={coordinador.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coordinador.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{coordinador.correoInstitucional}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {coordinador.tipoDocumento} {coordinador.documento}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {coordinador.etiquetas.map((etiqueta, index) => (
                          <span
                            key={`${coordinador.id}-etiqueta-${index}`}
                            className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                          >
                            {etiqueta}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${coordinador.estadoCoordinador === 'aprobado' ? 'bg-green-100 text-green-800' : coordinador.estadoCoordinador === 'rechazado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {coordinador.estadoCoordinador === 'aprobado' ? 'Aprobado' : 
                         coordinador.estadoCoordinador === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {coordinador.id && coordinador.id !== 'undefined' && coordinador.id !== 'null' ? (
                          <Link
                            to={`/Coordinacion/usuarios/coordinadores/${coordinador.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        ) : (
                          <span className="text-gray-400 cursor-not-allowed" title="ID no válido">
                            <Eye className="h-5 w-5" />
                          </span>
                        )}
                        {coordinador.id && coordinador.id !== 'undefined' && coordinador.id !== 'null' ? (
                          <Link
                            to={`/Coordinacion/usuarios/coordinadores/${coordinador.id}/editar`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                        ) : (
                          <span className="text-gray-400 cursor-not-allowed" title="ID no válido">
                            <Edit className="h-5 w-5" />
                          </span>
                        )}
                        {coordinador.id && coordinador.id !== 'undefined' && coordinador.id !== 'null' ? (
                          <button
                            onClick={() => handleDelete(coordinador.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        ) : (
                          <span className="text-gray-400 cursor-not-allowed" title="ID no válido">
                            <Trash2 className="h-5 w-5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                [
                  <tr key="no-coordinadores-row">
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron coordinadores
                    </td>
                  </tr>
                ]
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaCoordinadores;