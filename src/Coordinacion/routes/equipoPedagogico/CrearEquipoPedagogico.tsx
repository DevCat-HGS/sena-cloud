import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useSocket } from '../../../Service/API/SocketContext';

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

const CrearEquipoPedagogico: React.FC = () => {
  const navigate = useNavigate();
  const { connectToNamespace, isConnected } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para enviar
      const equipoPedagogicoData = {
        nombre: formData.nombre,
        correoInstitucional: formData.correoInstitucional,
        correoPersonal: formData.correoPersonal || undefined,
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        password: formData.password,
        rol: 'EquipoPedagogico', // Asignar rol de EquipoPedagogico
        etiquetas: formData.etiquetas ? formData.etiquetas.split(',').map(tag => tag.trim()) : []
      };
      
      if (isConnected) {
        // Usar Socket.IO para crear el miembro del equipo pedagógico
        const socket = connectToNamespace('/pedagogical-team');
        
        // Crear una promesa para manejar la respuesta del socket
        const createPromise = new Promise<void>((resolve, reject) => {
          // Manejar respuesta exitosa
          const handleSuccess = (userData: any) => {
            console.log('Miembro del equipo pedagógico creado correctamente:', userData);
            resolve();
            // Eliminar listener
            socket.off('pedagogical-member-created');
          };
          
          // Manejar error
          const handleError = (errorData: any) => {
            console.error('Error del socket:', errorData);
            reject(new Error(errorData.message || 'Error al crear el miembro del equipo pedagógico'));
            // Eliminar listener
            socket.off('error');
          };
          
          // Registrar listeners
          socket.on('pedagogical-member-created', handleSuccess);
          socket.on('error', handleError);
          
          // Emitir evento para crear miembro del equipo pedagógico
          socket.emit('create-pedagogical-member', equipoPedagogicoData);
          
          // Timeout por si no hay respuesta
          setTimeout(() => {
            reject(new Error('Timeout al esperar respuesta del servidor'));
            socket.off('pedagogical-member-created');
            socket.off('error');
          }, 5000);
        });
        
        try {
          await createPromise;
          navigate('/Coordinacion/usuarios/equipo-pedagogico');
        } catch (err) {
          console.error('Error en la promesa del socket:', err);
          // Si falla el socket, intentar con HTTP
          await createEquipoPedagogicoHttp(equipoPedagogicoData);
          navigate('/Coordinacion/usuarios/equipo-pedagogico');
        }
      } else {
        // Si no hay conexión de socket, usar HTTP
        await createEquipoPedagogicoHttp(equipoPedagogicoData);
        navigate('/Coordinacion/usuarios/equipo-pedagogico');
      }
    } catch (err) {
      console.error('Error general:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el miembro del equipo pedagógico');
    } finally {
      setLoading(false);
    }
  };

  const createEquipoPedagogicoHttp = async (equipoPedagogicoData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipoPedagogicoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el miembro del equipo pedagógico');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error HTTP:', err);
      throw err;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link to="/Coordinacion/usuarios/equipo-pedagogico" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Miembro del Equipo Pedagógico</h1>
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
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
            
            <div>
              <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                required
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
            to="/Coordinacion/usuarios/equipo-pedagogico"
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

export default CrearEquipoPedagogico;