import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import axios from 'axios';
import { ACTIVITY_ROUTES, API_URL } from '../../../Service/API/apiRoutes';

interface Actividad {
    _id: string;
    titulo: string;
    responsable: {
        _id: string;
        nombre: string;
    };
    fecha: string;
    estado: string;
}

export const ListaActividades: React.FC = () => {
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActividades = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}${ACTIVITY_ROUTES.GET_ALL}`);
            // Asegurarse de que response.data sea un array
            if (Array.isArray(response.data)) {
                setActividades(response.data);
            } else if (response.data && Array.isArray(response.data.activities)) {
                setActividades(response.data.activities);
            } else {
                console.error('La respuesta no contiene un array de actividades:', response.data);
                setActividades([]);
            }
            setError(null);
        } catch (err) {
            console.error('Error al cargar actividades:', err);
            setError('Error al cargar las actividades. Por favor, intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActividades();
    }, []);

    const filteredActividades = actividades.filter(actividad =>
        actividad.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (actividad.responsable?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            try {
                await axios.delete(`${API_URL}${ACTIVITY_ROUTES.DELETE(id)}`);
                setActividades(actividades.filter(a => a._id !== id));
            } catch (err) {
                console.error('Error al eliminar actividad:', err);
                alert('Error al eliminar la actividad. Por favor, intenta de nuevo.');
            }
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Programada': return 'bg-green-100 text-green-800';
            case 'En curso': return 'bg-yellow-100 text-yellow-800';
            case 'Completada': return 'bg-green-100 text-green-800';
            case 'Cancelada': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
                <Link
                    to="/Coordinacion/actividades/crear"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                    <Plus size={20} />
                    Agregar Actividad
                </Link>
            </div>
            
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500">Cargando actividades...</p>
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar actividades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredActividades.map((actividad) => (
                            <tr key={actividad._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{actividad.titulo}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{actividad.responsable?.nombre || 'No asignado'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{new Date(actividad.fecha).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(actividad.estado)}`}>
                                        {actividad.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Link to={`/Coordinacion/actividades/detalle/${actividad._id}`} className="text-blue-600 hover:text-blue-900">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/Coordinacion/actividades/editar/${actividad._id}`} className="text-yellow-600 hover:text-yellow-900">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(actividad._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListaActividades;