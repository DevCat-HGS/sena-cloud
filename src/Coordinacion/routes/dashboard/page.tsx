import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/use-theme";
import { Footer } from "../../layouts/footer";
import { 
    Users, 
    UserCheck, 
    UserPlus, 
    Calendar, 
    FileText, 
    Award, 
    UserMinus, 
    ShieldCheck, 
    Briefcase,
    BookOpen
} from "lucide-react";
import { authService } from "../../../Service/API/authService";
import { Link } from "react-router-dom";

const DashboardPage = () => {
    const { theme } = useTheme();
    const [userName, setUserName] = useState("Usuario");

    useEffect(() => {
        // Obtener información del usuario actual
        const user = authService.getAuthenticatedUser();
        if (user && user.nombre) {
            setUserName(user.nombre);
        }
    }, []);

    // Definir los atajos administrativos
    const adminShortcuts = [
        {
            title: "Aprobar Instructores",
            icon: <UserCheck size={24} />,
            description: "Gestionar solicitudes pendientes de instructores",
            path: "/Coordinacion/usuarios/instructores",
            color: "bg-blue-500"
        },
        {
            title: "Subir de Rango",
            icon: <Award size={24} />,
            description: "Promover usuarios a roles superiores",
            path: "/Coordinacion/usuarios/instructores",
            color: "bg-green-500"
        },
        {
            title: "Degradar Equipo",
            icon: <UserMinus size={24} />,
            description: "Cambiar roles de equipo pedagógico",
            path: "/Coordinacion/usuarios/equipo-pedagogico",
            color: "bg-orange-500"
        },
        {
            title: "Crear Evento",
            icon: <Calendar size={24} />,
            description: "Programar nuevos eventos institucionales",
            path: "/Coordinacion/eventos/crear",
            color: "bg-purple-500"
        },
        {
            title: "Crear Instructor",
            icon: <UserPlus size={24} />,
            description: "Registrar nuevos instructores",
            path: "/Coordinacion/usuarios/instructores/crear",
            color: "bg-teal-500"
        },
        {
            title: "Crear Actividad",
            icon: <FileText size={24} />,
            description: "Crear nuevas actividades formativas",
            path: "/Coordinacion/actividades/crear",
            color: "bg-yellow-500"
        },
        {
            title: "Crear Equipo Pedagógico",
            icon: <BookOpen size={24} />,
            description: "Formar nuevos equipos pedagógicos",
            path: "/Coordinacion/usuarios/equipo-pedagogico/crear",
            color: "bg-pink-500"
        }
    ];

    return (
        <div className="flex flex-col gap-y-6 rounded-2xl">
            <h1 className="title">Panel Institucional SenaCloud</h1>
            
            <div className="flex flex-col items-center mb-6">
                {/* Foto de perfil circular */}
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-blue-500 overflow-hidden">
                    <Users size={64} className="text-gray-500" />
                </div>
                
                {/* Mensaje de bienvenida */}
                <h2 className="text-2xl font-bold mb-1">Bienvenido</h2>
                <h3 className="text-xl text-blue-600 font-semibold mb-6">{userName}</h3>
                
                {/* Descripción */}
                <p className="text-gray-600 max-w-md text-center mb-4">
                    Accede rápidamente a las funciones administrativas desde este panel.
                </p>
            </div>
            
            {/* Atajos administrativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminShortcuts.map((shortcut, index) => (
                    <Link 
                        key={index} 
                        to={shortcut.path}
                        className={`${shortcut.color} hover:opacity-90 transition-all p-4 rounded-lg shadow-md flex flex-col items-center text-white`}
                    >
                        <div className="bg-white bg-opacity-20 p-3 rounded-full mb-3">
                            {shortcut.icon}
                        </div>
                        <h3 className="font-bold text-lg mb-1">{shortcut.title}</h3>
                        <p className="text-sm text-center opacity-90">{shortcut.description}</p>
                    </Link>
                ))}
            </div>
            
            <Footer />
        </div>
    );
};

export default DashboardPage;
