import { useState, useEffect, FC } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  etiquetas: string;
  password: string;
  confirmarPassword: string;
}

const EditarCoordinador: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    correoInstitucional: '',
    correoPersonal: '',
    documento: '',
    tipoDocumento: 'CC',
    telefono: '',
    direccion: '',
    etiquetas: '',
    password: '',
    confirmarPassword: ''
  });

  useEffect(() => {
    const fetchCoordinador = async () => {
      try {
        setFetchLoading(true);
        setError(null);

        // Verificar si el ID existe y es válido
        if (!id || id === 'undefined' || id === 'null') {
          console.error('ID inválido detectado:', id);
          setError('ID de coordinador no válido o no proporcionado');
          setFetchLoading(false);
          // Redirigir a la lista de coordinadores después de un breve retraso
          setTimeout(() => {
            navigate('/Coordinacion/usuarios/coordinadores');
          }, 2000);
          return;
        }

        console.log('Obteniendo datos del coordinador con ID:', id);
        
        // Usar HTTP para obtener los datos del coordinador usando USER_ROUTES
        const response = await fetch(`${API_URL}${USER_ROUTES.GET_BY_ID(id)}`, {
          credentials: 'include' // Asegura que las cookies se envíen con la solicitud
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos del coordinador');
        }
        
        const coordinadorData = await response.json();
        console.log('Detalles del coordinador recibidos:', coordinadorData);
            
            // Validar datos recibidos
            if (!coordinadorData || !coordinadorData.nombre) {
              throw new Error('Datos del coordinador inválidos o incompletos');
            }

            setFormData({
              nombre: coordinadorData.nombre,
              correoInstitucional: coordinadorData.correoInstitucional,
              correoPersonal: coordinadorData.correoPersonal || '',
              documento: coordinadorData.documento,
              tipoDocumento: coordinadorData.tipoDocumento,
              telefono: coordinadorData.telefono || '',
              direccion: coordinadorData.direccion || '',
              etiquetas: coordinadorData.etiquetas ? coordinadorData.etiquetas.join(', ') : '',
              password: '',
              confirmarPassword: ''
            });
      } catch (err) {
        console.error('Error general:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar detalles del coordinador');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchCoordinador();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas para la contraseña si se está cambiando
    if (formData.password || formData.confirmarPassword) {
      if (formData.password !== formData.confirmarPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para enviar
      const coordinadorData: any = {
        nombre: formData.nombre,
        correoInstitucional: formData.correoInstitucional,
        correoPersonal: formData.correoPersonal || undefined,
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        rol: 'Coordinacion', // Asegurar que el rol sigue siendo Coordinación
        etiquetas: formData.etiquetas ? formData.etiquetas.split(',').map(tag => tag.trim()) : []
      };
      
      // Solo incluir contraseña si se ha proporcionado una nueva
      if (formData.password) {
        coordinadorData.password = formData.password;
      }
      
      // Usar HTTP para actualizar el coordinador
       const response = await fetch(`${API_URL}/api/users/${id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(coordinadorData),
         credentials: 'include'
       });
       
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || `Error al actualizar el coordinador: ${response.status}`);
       }
       
       const data = await response.json();
       console.log('Coordinador actualizado correctamente:', data);
       navigate('/Coordinacion/usuarios/coordinadores');
    } catch (err) {
      console.error('Error general:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el coordinador');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link to={`/Coordinacion/usuarios/coordinadores/${id}`} className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Editar Coordinador</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
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
                <option value="PASAPORTE">Pasaporte</option>
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
            
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Cambiar Contraseña (opcional)</h3>
              <div className="space-y-4">
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
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Link
            to="/Coordinacion/usuarios/coordinadores"
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

export default EditarCoordinador;