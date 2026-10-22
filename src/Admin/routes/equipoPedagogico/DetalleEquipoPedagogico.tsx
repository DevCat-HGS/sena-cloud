import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../../Service/API/apiRoutes';
import EquipoPedagogicoStatusUpdater from './EquipoPedagogicoStatusUpdater';

interface MiembroEquipoPedagogico {
  id: string;
  nombre: string;
  correoInstitucional: string;
  correoPersonal: string;
  documento: string;
  tipoDocumento: string;
  telefono: string;
  direccion: string;
  etiquetas: string[];
  estadoEquipoPedagogico: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

const DetalleEquipoPedagogico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [miembroEquipo, setMiembroEquipo] = useState<MiembroEquipoPedagogico | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiembroEquipo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si el ID existe y es válido
        if (!id || id === 'undefined' || id === 'null') {
          console.error('ID inválido detectado:', id);
          setError('ID de miembro del equipo pedagógico no válido o no proporcionado');
          setLoading(false);
          return;
        }

        console.log('Obteniendo detalles del miembro del equipo pedagógico con ID:', id);
        
        // Usar HTTP para obtener los detalles del miembro usando USER_ROUTES
        const response = await fetch(`${API_URL}${USER_ROUTES.GET_BY_ID(id)}`, {
          credentials: 'include' // Asegura que las cookies se envíen con la solicitud
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los detalles del miembro del equipo pedagógico');
        }
        
        const userData = await response.json();
        console.log('Detalles del miembro del equipo pedagógico recibidos:', userData);
        
        // Mapear datos del miembro
        setMiembroEquipo({
          id: userData._id,
          nombre: userData.nombre || 'Sin nombre',
          correoInstitucional: userData.correoInstitucional || 'Sin correo institucional',
          correoPersonal: userData.correoPersonal || '',
          documento: userData.documento || 'Sin documento',
          tipoDocumento: userData.tipoDocumento || 'Sin tipo de documento',
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          etiquetas: userData.etiquetas || [],
          estadoEquipoPedagogico: userData.estadoEquipoPedagogico || 'pendiente',
          fechaCreacion: new Date(userData.createdAt).toLocaleDateString(),
          ultimaActualizacion: new Date(userData.updatedAt).toLocaleDateString()
        });
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar detalles del miembro del equipo pedagógico');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMiembroEquipo();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!miembroEquipo) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Aviso:</strong>
        <span className="block sm:inline"> No se encontró el miembro del equipo pedagógico solicitado.</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/Admin/usuarios/equipo-pedagogico" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Miembro del Equipo Pedagógico</h1>
        </div>
        <Link
          to={`/Admin/usuarios/equipo-pedagogico/${id}/editar`}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Información Personal</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="text-base font-medium">{miembroEquipo.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="text-base font-medium">{miembroEquipo.tipoDocumento} {miembroEquipo.documento}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Información de Contacto</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Correo Institucional</p>
                <p className="text-base font-medium">{miembroEquipo.correoInstitucional}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo Personal</p>
                <p className="text-base font-medium">{miembroEquipo.correoPersonal || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Etiquetas</h2>
          <div className="flex flex-wrap gap-2">
            {miembroEquipo.etiquetas.length > 0 ? (
              miembroEquipo.etiquetas.map((etiqueta, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {etiqueta}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No hay etiquetas asignadas</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Estado del Miembro del Equipo Pedagógico</h2>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-500">Estado actual</p>
              <p className={`text-base font-medium ${miembroEquipo.estadoEquipoPedagogico === 'aprobado' ? 'text-green-600' : miembroEquipo.estadoEquipoPedagogico === 'rechazado' ? 'text-red-600' : 'text-yellow-600'}`}>
                {miembroEquipo.estadoEquipoPedagogico === 'aprobado' ? 'Aprobado' : 
                 miembroEquipo.estadoEquipoPedagogico === 'rechazado' ? 'Rechazado' : 'Pendiente'}
              </p>
            </div>
            <EquipoPedagogicoStatusUpdater 
              miembroEquipoId={miembroEquipo.id} 
              currentStatus={miembroEquipo.estadoEquipoPedagogico} 
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <p>Fecha de registro: {miembroEquipo.fechaCreacion}</p>
            <p>Última actualización: {miembroEquipo.ultimaActualizacion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEquipoPedagogico;