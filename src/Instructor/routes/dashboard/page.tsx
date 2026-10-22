import { useEffect, useState } from 'react';
import { useAuth } from '../../../Service/API/AuthContext';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    guias: 0,
    actividades: 0,
    eventos: 0
  });

  useEffect(() => {
    // Aquí se podrían cargar estadísticas reales desde la API
    // Por ahora usamos datos de ejemplo
    setStats({
      guias: 12,
      actividades: 8,
      eventos: 3
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido, {user?.nombre}</h1>
      
      {/* Tarjetas de estadísticas */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 text-sm">Guías</p>
              <p className="text-2xl font-bold text-gray-800">{stats.guias}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 text-sm">Actividades</p>
              <p className="text-2xl font-bold text-gray-800">{stats.actividades}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 text-sm">Eventos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.eventos}</p>
            </div>
          </div>
        </div>
      </div>
       */}
      {/* Información del perfil */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Perfil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Nombre</p>
            <p className="text-gray-800">{user?.nombre}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Correo Institucional</p>
            <p className="text-gray-800">{user?.correoInstitucional}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Correo Personal</p>
            <p className="text-gray-800">{user?.correoPersonal}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Estado</p>
            <p className="text-gray-800">
              {user?.estadoInstructor === 'aprobado' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aprobado
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pendiente
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Etiquetas */}
      {user?.etiquetas && user.etiquetas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mis Etiquetas</h2>
          <div className="flex flex-wrap gap-2">
            {user.etiquetas.map((etiqueta: string, index: number) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {etiqueta}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}