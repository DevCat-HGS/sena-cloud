import { useState, useEffect } from "react";
import { User, Mail, Phone, Save, AlertCircle, Edit, X } from "lucide-react";
import { AuthService } from "../../Service/API/authService";
import { USER_ROUTES } from "../../Service/API/apiRoutes";
import { User as UserType, UpdateUserDto } from "../../Service/API/userService";

// Interfaz para los datos de usuario en el formulario
interface UserData {
  id: string;
  nombre: string;
  correoInstitucional: string;
  correoPersonal: string;
  telefono?: string;
  rol: string;
}

// Función para convertir User a UserData
const mapUserToUserData = (user: any): UserData => {
  console.log("Mapeando datos de usuario:", user);
  return {
    id: user._id || user.id || "",
    nombre: user.nombre || user.name || "",
    correoInstitucional: user.correoInstitucional || user.email || "",
    correoPersonal: user.correoPersonal || "",
    telefono: user.telefono || "",
    rol: user.rol || user.role || ""
  };
}

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({
    nombre: "",
    correoInstitucional: "",
    correoPersonal: "",
    telefono: "",
    rol: ""
  });

  // Obtener datos del usuario actual
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Obtener ID del usuario actual
        const userId = AuthService.getInstance().getCurrentUserId();
        
        if (!userId) {
          setError("No se ha iniciado sesión");
          setLoading(false);
          return;
        }

        console.log("Obteniendo datos del usuario con ID:", userId);
        
        // Inicializar formData con valores por defecto para evitar errores
        setFormData({
          nombre: "",
          correoInstitucional: "",
          correoPersonal: "",
          telefono: "",
          rol: ""
        });

        // Obtener datos del usuario directamente del servicio de usuario
        try {
          // Importar el servicio de usuario
          const { UserService } = await import('../../Service/API/userService');
          const userService = UserService.getInstance();
          
          // Obtener datos del usuario usando el servicio y USER_ROUTES
          // Nota: userService.getUserById ya usa USER_ROUTES internamente
          const user = await userService.getUserById(userId);
          console.log("Datos de usuario recibidos:", user);
          
          if (!user || Object.keys(user).length === 0) {
            throw new Error("Datos de usuario vacíos o inválidos");
          }
          
          // Convertir User a UserData
          const userDataMapped = mapUserToUserData(user);
          setUserData(userDataMapped);
          
          // Asegurarse de que todos los campos existan antes de actualizar formData
          setFormData({
            nombre: userDataMapped.nombre || "",
            correoInstitucional: userDataMapped.correoInstitucional || "",
            correoPersonal: userDataMapped.correoPersonal || "",
            telefono: userDataMapped.telefono || "",
            rol: userDataMapped.rol || ""
          });
        } catch (userError) {
          console.error("Error al obtener datos con userService:", userError);
          throw new Error("No se pudieron obtener los datos del usuario");
        }
        setLoading(false);
      } catch (error: any) {
        console.error("Error al obtener datos del usuario:", error);
        setError(`Error al cargar los datos del usuario: ${error?.message || "Error desconocido"}`);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      
      // Obtener ID del usuario actual
      const userId = AuthService.getInstance().getCurrentUserId();
      
      if (!userId) {
        setError("No se ha iniciado sesión");
        setLoading(false);
        return;
      }
      
      // Verificar que el usuario solo edite sus propios datos
      if (userId !== userData?.id) {
        setError("No tienes permiso para editar estos datos");
        setLoading(false);
        return;
      }
      
      // Importar el servicio de usuario para actualizar los datos
      const { UserService } = await import('../../Service/API/userService');
      const userService = UserService.getInstance();
      
      // Convertir formData a UpdateUserDto
      const updateData: any = {
        nombre: formData.nombre,
        correoInstitucional: formData.correoInstitucional,
        correoPersonal: formData.correoPersonal
      };
      
      // Si hay teléfono, agregarlo como campo personalizado
      if (formData.telefono) {
        updateData.telefono = formData.telefono;
      }
      
      // Actualizar datos del usuario usando el servicio
      console.log("Enviando datos de perfil:", updateData);
      const response = await userService.updateUser(userId, updateData);
      console.log("Respuesta de actualización:", response);
      
      // Verificar si la respuesta es exitosa
      if (response && typeof response === 'object') {
        // Volver a obtener los datos del usuario para asegurar que tenemos la información más actualizada
        const refreshedUser = await userService.getUserById(userId);
        console.log("Datos actualizados del usuario:", refreshedUser);
        
        // Actualizar los datos del usuario con la respuesta del servidor
        const updatedUserData = mapUserToUserData(refreshedUser);
        setUserData(updatedUserData);
        
        // Actualizar también los datos del formulario
        setFormData({
          nombre: updatedUserData.nombre,
          correoInstitucional: updatedUserData.correoInstitucional,
          correoPersonal: updatedUserData.correoPersonal,
          telefono: updatedUserData.telefono,
          rol: updatedUserData.rol
        });
        
        // Salir del modo de edición
        setEditMode(false);
        
        // Mostrar mensaje de éxito
        setSuccess("Datos actualizados correctamente");
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
      setLoading(false);
      
      // Limpiar mensajes después de 5 segundos
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
    } catch (error: any) {
      console.error("Error al actualizar datos:", error);
      setError(`Error al actualizar los datos: ${error?.message || "Error desconocido"}`);
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return <div className="text-center py-8">Cargando datos del usuario...</div>;
  }

  if (error && !userData) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
        <div className="flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
            <User className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h2 className="text-xl font-semibold">Mi Perfil</h2>
        </div>
        
        <button
          type="button"
          onClick={() => {
            if (editMode) {
              // Si estamos en modo edición y cancelamos, restauramos los datos originales
              if (userData) {
                setFormData({
                  nombre: userData.nombre || "",
                  correoInstitucional: userData.correoInstitucional || "",
                  correoPersonal: userData.correoPersonal || "",
                  telefono: userData.telefono || "",
                  rol: userData.rol || ""
                });
              }
            }
            setEditMode(!editMode);
            setError("");
            setSuccess("");
          }}
          className={`flex items-center gap-2 px-4 py-2 ${
            editMode 
              ? "bg-gray-500 hover:bg-gray-600" 
              : "bg-blue-500 hover:bg-blue-600"
          } text-white rounded-lg transition-colors`}
        >
          {editMode ? (
            <>
              <X size={18} />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Edit size={18} />
              <span>Editar Perfil</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          <span>{success}</span>
        </div>
      )}

      {!editMode ? (
        // Modo visualización
        <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</h3>
              <div className="flex items-center gap-2">
                <User className="text-gray-400" size={18} />
                <p className="text-gray-900 dark:text-white font-medium">{userData?.nombre || "-"}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Correo Institucional</h3>
              <div className="flex items-center gap-2">
                <Mail className="text-gray-400" size={18} />
                <p className="text-gray-900 dark:text-white font-medium">{userData?.correoInstitucional || "-"}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Correo Personal</h3>
              <div className="flex items-center gap-2">
                <Mail className="text-gray-400" size={18} />
                <p className="text-gray-900 dark:text-white font-medium">{userData?.correoPersonal || "-"}</p>
              </div>
            </div>
            
            {/* <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teléfono</h3>
              <div className="flex items-center gap-2">
                <Phone className="text-gray-400" size={18} />
                <p className="text-gray-900 dark:text-white font-medium">{userData?.telefono || "-"}</p>
              </div>
            </div>
             */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rol</h3>
              <p className="text-gray-900 dark:text-white font-medium">{userData?.rol || "-"}</p>
            </div>
          </div>
        </div>
      ) : (
        // Modo edición
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                name="nombre"
                value={formData?.nombre || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Nombre completo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo Institucional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={18} />
              </div>
              <input
                type="email"
                name="correoInstitucional"
                value={formData?.correoInstitucional || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-gray-100 dark:bg-slate-700"
                placeholder="correo@sena.edu.co"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">El correo institucional no se puede modificar</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo Personal</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={18} />
              </div>
              <input
                type="email"
                name="correoPersonal"
                value={formData?.correoPersonal || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="text-gray-400" size={18} />
              </div>
              <input
                type="tel"
                name="telefono"
                value={formData?.telefono || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Número de teléfono"
              />
            </div>
          </div> */}

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;