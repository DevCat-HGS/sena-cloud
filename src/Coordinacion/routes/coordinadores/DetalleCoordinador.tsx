import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../../Service/API/apiRoutes';
import CoordinadorStatusUpdater from './CoordinadorStatusUpdater';

interface Coordinador {
  id: string;
  nombre: string;
  correoInstitucional: string;
  correoPersonal: string;
  documento: string;
  tipoDocumento: string;
  telefono: string;
  direccion: string;
  etiquetas: string[];
  estadoCoordinador: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

const DetalleCoordinador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [coordinador, setCoordinador] = useState<Coordinador | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinador = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si el ID existe y es válido
        if (!id || id === 'undefined' || id === 'null') {
          console.error('ID inválido detectado:', id);
          setError('ID de coordinador no válido o no proporcionado');
          setLoading(false);
          // Redirigir a la lista de coordinadores después de un breve retraso
          setTimeout(() => {
            window.location.href = '/Coordinacion/usuarios/coordinadores';
          }, 2000);
          return;
        }

        console.log('Obteniendo detalles del coordinador con ID:', id);
        
        // Usar HTTP para obtener los detalles del coordinador usando USER_ROUTES
        const response = await fetch(`${API_URL}${USER_ROUTES.GET_BY_ID(id)}`, {
          credentials: 'include' // Asegura que las cookies se envíen con la solicitud
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los detalles del coordinador');
        }
        
        const coordinadorData = await response.json();
        if (!coordinadorData) {
          throw new Error('No se encontró el coordinador');
        }
        
        // Mapear datos del coordinador
        const mappedCoordinador: Coordinador = {
          id: coordinadorData._id,
          nombre: coordinadorData.nombre || 'Sin nombre',
          correoInstitucional: coordinadorData.correoInstitucional || 'Sin correo institucional',
          correoPersonal: coordinadorData.correoPersonal || 'Sin correo personal',
          documento: coordinadorData.documento || 'Sin documento',
          tipoDocumento: coordinadorData.tipoDocumento || 'Sin tipo de documento',
          telefono: coordinadorData.telefono || 'Sin teléfono',
          direccion: coordinadorData.direccion || 'Sin dirección',
          etiquetas: coordinadorData.etiquetas || [],
          estadoCoordinador: coordinadorData.estadoCoordinador || 'Inactivo',
          fechaCreacion: new Date(coordinadorData.createdAt).toLocaleDateString(),
          ultimaActualizacion: new Date(coordinadorData.updatedAt).toLocaleDateString()
        };
        
        setCoordinador(mappedCoordinador);
      } catch (err) {
        console.error('Error al obtener detalles del coordinador:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar detalles del coordinador');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoordinador();
    }

    // No cleanup needed since we're not using sockets anymore
    return () => {};
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

  if (!coordinador) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Aviso:</strong>
        <span className="block sm:inline"> No se encontró el coordinador solicitado.</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/Coordinacion/usuarios/coordinadores" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Coordinador</h1>
        </div>
        <Link
          to={`/Coordinacion/usuarios/coordinadores/${coordinador.id}/editar`}
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
                <p className="text-base font-medium">{coordinador.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="text-base font-medium">{coordinador.tipoDocumento} {coordinador.documento}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-base font-medium">{coordinador.telefono || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-base font-medium">{coordinador.direccion || 'No especificada'}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Información de Contacto</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Correo Institucional</p>
                <p className="text-base font-medium">{coordinador.correoInstitucional}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo Personal</p>
                <p className="text-base font-medium">{coordinador.correoPersonal || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Etiquetas</h2>
          <div className="flex flex-wrap gap-2">
            {coordinador.etiquetas.length > 0 ? (
              coordinador.etiquetas.map((etiqueta, index) => (
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
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Estado del Coordinador</h2>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-500">Estado actual</p>
              <p className={`text-base font-medium ${coordinador.estadoCoordinador === 'aprobado' ? 'text-green-600' : coordinador.estadoCoordinador === 'rechazado' ? 'text-red-600' : 'text-yellow-600'}`}>
                {coordinador.estadoCoordinador === 'aprobado' ? 'Aprobado' : 
                 coordinador.estadoCoordinador === 'rechazado' ? 'Rechazado' : 'Pendiente'}
              </p>
            </div>
            <CoordinadorStatusUpdater 
              coordinadorId={coordinador.id} 
              currentStatus={coordinador.estadoCoordinador} 
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <p>Fecha de registro: {coordinador.fechaCreacion}</p>
            <p>Última actualización: {coordinador.ultimaActualizacion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleCoordinador;