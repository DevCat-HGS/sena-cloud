import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { API_URL, EVENT_ROUTES } from '../../../Service/API/apiRoutes';

interface EventoData {
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  estado: string;
}

const EditarEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [eventoData, setEventoData] = useState<EventoData>({
    titulo: '',
    descripcion: '',
    fecha: '',
    ubicacion: '',
    estado: 'Programado'
  });

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setFetchLoading(true);
        const response = await fetch(`${API_URL}${EVENT_ROUTES.GET_BY_ID(id || '')}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error al obtener el evento: ${response.status}`);
        }

        const data = await response.json();
        
        // Formatear la fecha para el input datetime-local
        const fechaISO = new Date(data.fecha).toISOString().slice(0, 16);
        
        setEventoData({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          fecha: fechaISO,
          ubicacion: data.ubicacion || '',
          estado: data.estado || 'Programado'
        });
      } catch (err) {
        console.error('Error al obtener el evento:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener el evento');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchEvento();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}${EVENT_ROUTES.UPDATE(id || '')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventoData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al actualizar el evento: ${response.status}`);
      }

      const data = await response.json();
      console.log('Evento actualizado correctamente:', data);
      setSuccess('Evento actualizado correctamente');
      
      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/SuperAdmin/eventos');
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar el evento:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link to="/SuperAdmin/eventos" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Editar Evento</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Éxito:</strong>
          <span className="block sm:inline"> {success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Evento */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Información del Evento</h2>
            
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                required
                value={eventoData.titulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                rows={4}
                value={eventoData.descripcion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Detalles del Evento */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Detalles del Evento</h2>
            
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                id="fecha"
                name="fecha"
                required
                value={eventoData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación *
              </label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                required
                value={eventoData.ubicacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                required
                value={eventoData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Programado">Programado</option>
                <option value="En preparación">En preparación</option>
                <option value="En curso">En curso</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Link
            to="/SuperAdmin/eventos"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors mr-2"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarEvento;