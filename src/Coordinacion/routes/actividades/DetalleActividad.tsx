import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { ACTIVITY_ROUTES, API_URL } from '../../../Service/API/apiRoutes';

interface Actividad {
  _id: string;
  titulo: string;
  descripcion: string;
  responsable: {
    _id: string;
    nombre: string;
  };
  fecha: string;
  estado: string;
  participantes: Array<{
    _id: string;
    nombre: string;
  }>;
}

export const DetalleActividad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actividad, setActividad] = useState<Actividad | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActividad = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}${ACTIVITY_ROUTES.GET_BY_ID(id as string)}`);
        setActividad(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar actividad:', err);
        setError('Error al cargar los datos de la actividad');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActividad();
  }, [id]);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!actividad) {
    return <div className="p-6">Actividad no encontrada</div>;
  }

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case 'Programada': return 'bg-green-100 text-green-800';
      case 'En curso': return 'bg-yellow-100 text-yellow-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/Coordinacion/actividades" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2" size={20} />
          Volver a la lista
        </Link>
        <Link to={`/Coordinacion/actividades/editar/${actividad._id}`} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Edit className="mr-2" size={16} />
          Editar
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">{actividad.titulo}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500">Descripción</h2>
          <p className="mt-1">{actividad.descripcion}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Responsable</h2>
            <p className="mt-1">{actividad.responsable?.nombre || 'No asignado'}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Fecha</h2>
            <p className="mt-1">{new Date(actividad.fecha).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h2 className="text-sm font-medium text-gray-500">Estado</h2>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(actividad.estado)}`}>
            {actividad.estado}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetalleActividad;