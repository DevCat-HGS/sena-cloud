import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Tag } from 'lucide-react';
import { API_URL, EVENT_ROUTES } from '../../../Service/API/apiRoutes';

interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

const DetalleEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}${EVENT_ROUTES.GET_BY_ID(id || '')}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error al obtener el evento: ${response.status}`);
        }

        const data = await response.json();
        setEvento(data);
      } catch (err) {
        console.error('Error al obtener el evento:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener el evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvento();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error || 'No se pudo cargar el evento'}</span>
        </div>
        <div className="mt-4">
          <Link
            to="/Coordinacion/eventos"
            className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/Coordinacion/eventos" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{evento.titulo}</h1>
        </div>
        <Link
          to={`/Coordinacion/eventos/editar/${evento._id}`}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Descripción</h2>
            <p className="text-gray-700 whitespace-pre-line">{evento.descripcion}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Información Adicional</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Fecha y Hora</p>
                  <p className="text-gray-600">{formatDate(evento.fecha)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Ubicación</p>
                  <p className="text-gray-600">{evento.ubicacion}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Tag className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Estado</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    evento.estado === 'Programado' ? 'bg-blue-100 text-blue-800' :
                    evento.estado === 'En preparación' ? 'bg-yellow-100 text-yellow-800' :
                    evento.estado === 'En curso' ? 'bg-green-100 text-green-800' :
                    evento.estado === 'Finalizado' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {evento.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Detalles del Registro</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Creado el</p>
                <p className="text-gray-700">{formatDate(evento.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="text-gray-700">{formatDate(evento.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID del Evento</p>
                <p className="text-gray-700 text-sm font-mono">{evento._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento;