import { useEffect, useState } from 'react';
import { useAuth } from '../../../Service/API/AuthContext';
import { API_URL, ACTIVITY_ROUTES } from '../../../Service/API/apiRoutes';

interface Activity {
  _id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
}

export default function InstructorActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // Obtener las actividades desde la API
        const response = await fetch(`${API_URL}${ACTIVITY_ROUTES.GET_ALL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener las actividades');
        }
        
        const data = await response.json();
        setActivities(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('No se pudieron cargar las actividades. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activa
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendiente
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Actividades</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No hay actividades disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activities.map((activity) => (
            <div key={activity._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{activity.titulo}</h2>
                    <p className="text-gray-600 mb-4">{activity.descripcion}</p>
                  </div>
                  <div>
                    {getStatusBadge(activity.estado)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha de inicio</p>
                    <p className="font-medium">{formatDate(activity.fechaInicio)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de finalización</p>
                    <p className="font-medium">{formatDate(activity.fechaFin)}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowDetailModal(true);
                    }}
                  >
                    Ver detalles
                  </button>
                  {activity.estado === 'activa' && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      onClick={() => alert(`Participar en actividad ${activity._id}`)}
                    >
                      Participar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles de actividad */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedActivity.titulo}</h2>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-4">
                <span>{getStatusBadge(selectedActivity.estado)}</span>
                <span className="text-sm text-gray-500">Creado el {formatDate(selectedActivity.createdAt)}</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedActivity.descripcion}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Fecha de inicio</h3>
                  <p className="text-gray-700">{formatDate(selectedActivity.fechaInicio)}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Fecha de finalización</h3>
                  <p className="text-gray-700">{formatDate(selectedActivity.fechaFin)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              {selectedActivity.estado === 'activa' && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => alert(`Participar en actividad ${selectedActivity._id}`)}
                >
                  Participar
                </button>
              )}
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => setShowDetailModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}