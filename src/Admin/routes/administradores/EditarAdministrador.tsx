import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { API_URL, USER_ROUTES } from '../../../Service/API/apiRoutes';

interface FormData {
  nombre: string;
  correoInstitucional: string;
  correoPersonal: string;
  documento: string;
  tipoDocumento: string;
  telefono: string;
  direccion: string;
  password: string;
  confirmarPassword: string;
  etiquetas: string;
}

const EditarAdministrador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    correoInstitucional: '',
    correoPersonal: '',
    documento: '',
    tipoDocumento: 'CC',
    telefono: '',
    direccion: '',
    password: '',
    confirmarPassword: '',
    etiquetas: ''
  });

  useEffect(() => {
    const fetchAdministrador = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si el ID existe y es válido
        if (!id || id === 'undefined' || id === 'null') {
          console.error('ID inválido detectado:', id);
          setError('ID de administrador no válido o no proporcionado');
          setLoading(false);
          // Redirigir a la lista de administradores después de un breve retraso
          setTimeout(() => {
            navigate('/Admin/administradores');
          }, 2000);
          return;
        }

        console.log('Obteniendo detalles del administrador con ID:', id);
        
        // Usar HTTP para obtener los detalles del administrador usando USER_ROUTES
        const response = await fetch(`${API_URL}${USER_ROUTES.GET_BY_ID(id as string)}`, {
          credentials: 'include' // Asegura que las cookies se envíen con la solicitud
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los detalles del administrador');
        }
        
        const administradorData = await response.json();
        if (!administradorData) {
          throw new Error('No se encontró el administrador');
        }
        
        // Mapear datos del administrador al formulario
        setFormData({
          nombre: administradorData.nombre || '',
          correoInstitucional: administradorData.correoInstitucional || '',
          correoPersonal: administradorData.correoPersonal || '',
          documento: administradorData.documento || '',
          tipoDocumento: administradorData.tipoDocumento || 'CC',
          telefono: administradorData.telefono || '',
          direccion: administradorData.direccion || '',
          password: '',
          confirmarPassword: '',
          etiquetas: administradorData.etiquetas ? administradorData.etiquetas.join(', ') : ''
        });
      } catch (err) {
        console.error('Error al obtener detalles del administrador:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar detalles del administrador');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdministrador();
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas para la contraseña
    if (formData.password && formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Preparar datos para enviar
      const administradorData: any = {
        nombre: formData.nombre,
        correoInstitucional: formData.correoInstitucional,
        correoPersonal: formData.correoPersonal || undefined,
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        rol: 'Admin', // Asignar rol de Administrador
        etiquetas: formData.etiquetas ? formData.etiquetas.split(',').map(tag => tag.trim()) : []
      };
      
      // Solo incluir la contraseña si se ha proporcionado una nueva
      if (formData.password) {
        administradorData.password = formData.password;
      }
      
      // Usar HTTP para actualizar el administrador
      const response = await fetch(`${API_URL}${USER_ROUTES.UPDATE(id as string)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(administradorData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al actualizar el administrador: ${response.status}`);
      }

      const data = await response.json();
      console.log('Administrador actualizado correctamente:', data);
      setSuccess('Administrador actualizado correctamente');
      
      // Opcional: redirigir después de un tiempo
      setTimeout(() => {
        navigate(`/Admin/usuarios/administradores/`);
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar el administrador:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el administrador');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.nombre) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link to={`/Admin/usuarios/administradores/`} className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Editar Administrador</h1>
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
          {/* Información Personal */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Información Personal</h2>
            
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento *
              </label>
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                required
                value={formData.tipoDocumento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                required
                value={formData.documento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
          </div>

          {/* Información de Contacto y Acceso */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Información de Contacto y Acceso</h2>
            
            <div>
              <label htmlFor="correoInstitucional" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Institucional *
              </label>
              <input
                type="email"
                id="correoInstitucional"
                name="correoInstitucional"
                required
                value={formData.correoInstitucional}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="correoPersonal" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Personal
              </label>
              <input
                type="email"
                id="correoPersonal"
                name="correoPersonal"
                value={formData.correoPersonal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Dejar en blanco para mantener la contraseña actual</p>
            </div>
            
            <div>
              <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="etiquetas" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <input
                type="text"
                id="etiquetas"
                name="etiquetas"
                value={formData.etiquetas}
                onChange={handleChange}
                placeholder="Separadas por comas (ej: ADSI, Sistemas, Virtual)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Separe las etiquetas con comas</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Link
            to={`/Admin/administradores/${id}`}
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

export default EditarAdministrador;