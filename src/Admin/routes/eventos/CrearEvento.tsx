import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { API_URL, EVENT_ROUTES } from '../../../Service/API/apiRoutes';

interface FormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  estado: string;
  organizador: string;
  horaInicio: string;
  horaFin: string;
  modalidad: string;
  tipo: string;
}

const CrearEvento: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    fecha: '',
    ubicacion: '',
    estado: 'Programado',
    organizador: '64f8b8f0e5aa2a1a5e1f7b12', // ID de MongoDB válido como ejemplo
    horaInicio: '',
    horaFin: '',
    modalidad: 'Presencial',
    tipo: 'Conferencia'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Verificar que todos los campos requeridos estén completos
    const requiredFields = ['titulo', 'descripcion', 'fecha', 'ubicacion', 'organizador', 
                           'horaInicio', 'horaFin', 'modalidad', 'tipo'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        return `El campo ${field} es requerido`;
      }
    }
    
    // Validar que la hora de fin sea posterior a la hora de inicio
    if (formData.horaInicio && formData.horaFin) {
      if (formData.horaInicio >= formData.horaFin) {
        return 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }
    
    return null; // Sin errores
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}${EVENT_ROUTES.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al crear el evento: ${response.status}`);
      }

      const data = await response.json();
      console.log('Evento creado correctamente:', data);
      setSuccess('Evento creado correctamente');
      
      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/Admin/eventos');
      }, 2000);
    } catch (err) {
      console.error('Error al crear el evento:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link to="/Admin/eventos" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Evento</h1>
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
                value={formData.titulo}
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
                value={formData.descripcion}
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
                Fecha *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                required
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Hora de inicio *
              </label>
              <input
                type="time"
                id="horaInicio"
                name="horaInicio"
                required
                value={formData.horaInicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 mb-1">
                Hora de fin *
              </label>
              <input
                type="time"
                id="horaFin"
                name="horaFin"
                required
                value={formData.horaFin}
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
                value={formData.ubicacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* El campo organizador ahora usa un ID fijo y no se muestra en el formulario */}

            <div>
              <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad *
              </label>
              <select
                id="modalidad"
                name="modalidad"
                required
                value={formData.modalidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de evento *
              </label>
              <select
                id="tipo"
                name="tipo"
                required
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Conferencia">Conferencia</option>
                <option value="Taller">Taller</option>
                <option value="Seminario">Seminario</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Feria">Feria</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                required
                value={formData.estado}
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
            to="/Admin/eventos"
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

export default CrearEvento;