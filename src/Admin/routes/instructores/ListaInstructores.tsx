import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import InstructorStatusUpdater from '../../../Admin/components/InstructorStatusUpdater';
import PromoteToEquipoPedagogico from '../../../Admin/components/PromoteToEquipoPedagogico';
import { USER_ROUTES, API_URL } from '../../../Service/API/apiRoutes';

interface Instructor {
  id: string;
  nombre: string;
  correoInstitucional: string;
  correoPersonal: string;
  documento: string;
  tipoDocumento: string;
  etiquetas: string[];
  estadoInstructor: 'pendiente' | 'aprobado';
}

const ListaInstructores: React.FC = () => {
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'aprobado'>('todos');
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar instructores cuando el componente se monta
    fetchInstructores();
  }, []);

  // Función para cargar instructores desde la API
  const fetchInstructores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await fetchInstructoresHttp();
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar instructores');
      setLoading(false);
    }
  };
  
  // Función para cargar instructores usando HTTP
  const fetchInstructoresHttp = async () => {
    try {
      const response = await fetch(`${API_URL}${USER_ROUTES.GET_ALL}?rol=Instructor`);
      if (!response.ok) {
        throw new Error('Error al cargar instructores');
      }
      const data = await response.json();
      console.log('Instructores recibidos:', data);
      const mappedInstructors = data.map(mapUserToInstructor);
      setInstructores(mappedInstructors);
      setLoading(false);
    } catch (err) {
      console.error('Error HTTP:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar instructores');
      setLoading(false);
    }
  };

  // Función para mapear un usuario de la API al formato local
  const mapUserToInstructor = (user: any): Instructor => ({
    id: user._id,
    nombre: user.nombre,
    correoInstitucional: user.correoInstitucional,
    correoPersonal: user.correoPersonal,
    documento: user.documento,
    tipoDocumento: user.tipoDocumento,
    etiquetas: user.etiquetas || [],
    estadoInstructor: user.estadoInstructor || 'pendiente'
  });

  // Función para eliminar un instructor
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este instructor?')) {
      try {
        await deleteInstructor(id);
        // Actualizar estado local inmediatamente para mejor UX
        setInstructores(instructores.filter(instructor => instructor.id !== id));
        console.log('Instructor eliminado correctamente');
      } catch (err) {
        console.error('Error al eliminar instructor:', err);
        setError(err instanceof Error ? err.message : 'Error al eliminar el instructor');
      }
    }
  };
  
  // Función para eliminar un instructor usando la API
  const deleteInstructor = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}${USER_ROUTES.DELETE(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Asegura que las cookies se envíen con la solicitud
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al eliminar el instructor' }));
        throw new Error(errorData.message || 'Error al eliminar el instructor');
      }
      
      return await response.json().catch(() => ({}));
    } catch (err) {
      console.error('Error al eliminar instructor:', err);
      throw err; // Propagar el error para manejarlo en handleDelete
    }
  };

  // Filtrar instructores según término de búsqueda y filtro de estado
  const filteredInstructores = instructores.filter(instructor => {
    const matchesSearch = 
      instructor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.correoInstitucional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.documento.includes(searchTerm);
    
    const matchesFilter = 
      filtroEstado === 'todos' || 
      instructor.estadoInstructor === filtroEstado;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Instructores</h1>
        <Link
          to="/Admin/usuarios/instructores/crear"
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={20} />
          Agregar Instructor
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'pendiente' | 'aprobado')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
          </select>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        /* Tabla de instructores */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredInstructores.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || filtroEstado !== 'todos' 
                ? 'No se encontraron instructores con los filtros aplicados' 
                : 'No hay instructores registrados'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Institucional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstructores.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {instructor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instructor.correoInstitucional}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instructor.tipoDocumento} {instructor.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <InstructorStatusUpdater 
                        instructorId={instructor.id} 
                        initialStatus={instructor.estadoInstructor}
                        onStatusChange={(newStatus) => {
                          // Actualizar el estado localmente
                          setInstructores(prev => 
                            prev.map(i => 
                              i.id === instructor.id 
                                ? { ...i, estadoInstructor: newStatus }
                                : i
                            )
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/Admin/usuarios/instructores/${instructor.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/Admin/usuarios/instructores/${instructor.id}/editar`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(instructor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                        {instructor.estadoInstructor === 'aprobado' && (
                          <PromoteToEquipoPedagogico 
                            instructorId={instructor.id}
                            onPromote={() => {
                              // Eliminar el instructor de la lista cuando es promovido
                              setInstructores(prev => prev.filter(i => i.id !== instructor.id));
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ListaInstructores;