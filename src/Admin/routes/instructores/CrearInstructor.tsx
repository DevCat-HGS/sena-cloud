import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { USER_ROUTES, API_URL } from '../../../Service/API/apiRoutes';

interface FormData {
  nombre: string;
  tipoDocumento: 'CC' | 'CE' | 'TI' | 'PASAPORTE';
  documento: string;
  correoInstitucional: string;
  correoPersonal: string;
  password: string;
  etiquetas: string[];
}

const CrearInstructor: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [etiqueta, setEtiqueta] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipoDocumento: 'CC',
    documento: '',
    correoInstitucional: '',
    correoPersonal: '',
    password: '',
    etiquetas: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addEtiqueta = () => {
    if (etiqueta.trim() && !formData.etiquetas.includes(etiqueta.trim())) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, etiqueta.trim()]
      }));
      setEtiqueta('');
    }
  };

  const removeEtiqueta = (index: number) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validar correo institucional
      if (!formData.correoInstitucional.endsWith('@sena.edu.co')) {
        throw new Error('El correo institucional debe terminar en @sena.edu.co');
      }
      
      const instructorData = {
        ...formData,
        rol: 'Instructor',
        estadoInstructor: 'pendiente'
      };
      
      await createInstructor(instructorData);
      navigate('/Admin/usuarios/instructores');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el instructor');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para crear instructor usando la API
  const createInstructor = async (instructorData: any) => {
    const response = await fetch(`${API_URL}${USER_ROUTES.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instructorData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el instructor');
    }
    
    return await response.json();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/Admin/usuarios/instructores"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" /> Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Instructor</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Tipo de documento */}
            <div>
              <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento *
              </label>
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            {/* Número de documento */}
            <div>
              <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-1">
                Número de documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Correo institucional */}
            <div>
              <label htmlFor="correoInstitucional" className="block text-sm font-medium text-gray-700 mb-1">
                Correo institucional *
              </label>
              <input
                type="email"
                id="correoInstitucional"
                name="correoInstitucional"
                value={formData.correoInstitucional}
                onChange={handleChange}
                required
                placeholder="ejemplo@sena.edu.co"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Debe terminar en @sena.edu.co</p>
            </div>

            {/* Correo personal */}
            <div>
              <label htmlFor="correoPersonal" className="block text-sm font-medium text-gray-700 mb-1">
                Correo personal *
              </label>
              <input
                type="email"
                id="correoPersonal"
                name="correoPersonal"
                value={formData.correoPersonal}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
          </div>

          {/* Etiquetas */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas
            </label>
            <div className="flex">
              <input
                type="text"
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                placeholder="Añadir etiqueta"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEtiqueta())}
              />
              <button
                type="button"
                onClick={addEtiqueta}
                className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.etiquetas.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeEtiqueta(index)}
                    className="ml-1 text-green-600 hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              to="/Admin/usuarios/instructores"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-green-600 text-white rounded-md flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-1" /> Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearInstructor;