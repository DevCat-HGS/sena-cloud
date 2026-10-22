/**
 * App.tsx - Componente principal de la aplicación SenaCloud
 * 
 * Este archivo contiene la estructura principal de la aplicación, incluyendo:
 * - Rutas y navegación
 * - Página de inicio con información promocional
 * - Rutas protegidas para diferentes roles (SuperAdmin, Admin, Instructor)
 */

import { useState, useEffect } from 'react';
import "./index.css";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { lazy } from "react";
// Comentado temporalmente para evitar errores de conexión WebSocket
// import { SocketProvider, useSocket } from './Service/API/SocketContext';
import { AuthProvider, useAuth } from './Service/API/AuthContext';
import AuthButtons from './components/AuthButtons';
import UserMenu from './components/UserMenu';
import SecurityGateway from './components/SecurityGateway';
// Importar el servicio de cookies para uso global
import cookieService from './Service/cookieService';
import SecurityCheck from './components/SecurityCheck';
import Card from './components/Card';
import ResolutionCheck from './components/ResolutionCheck';
// Importar rutas de API para eventos
import { API_URL, EVENT_ROUTES } from './Service/API/apiRoutes';
// Carga perezosa (lazy loading) de componentes para mejorar el rendimiento
// Se añade un pequeño retraso para mostrar la animación de carga
const Login = lazy(() =>
  new Promise(resolve => setTimeout(resolve, 500)).then(() => import("./User/Login"))
);
const Register = lazy(() =>
  new Promise(resolve => setTimeout(resolve, 500)).then(() => import("./User/Register"))
);
const PasswordRecovery = lazy(() =>
  new Promise(resolve => setTimeout(resolve, 500)).then(() => import("./User/PasswordRecovery"))
);
import Admin from './Admin/Dashboard.tsx';
import SuperAdminDashboard from './SuperAdmin/Dashboard.tsx';
import InstructorDashboard from './Instructor/Dashboard.tsx';
import CoordinacionDashboard from './Coordinacion/Dashboard.tsx';
import EquipoPedagogicoDashboard from './EquipoPedagogico/Dashboard.tsx';
// Importaciones para Admin
import { Usuarios } from './Admin/components/Usuarios';
import InstructoresRoutes from './Admin/routes/instructores';
import CoordinadoresRoutes from './Admin/routes/coordinadores';
import EquipoPedagogicoRoutes from './Admin/routes/equipoPedagogico';
import AdministradoresRoutes from './Admin/routes/administradores';
import { Actividades } from './Admin/components/Actividades';
import { Eventos } from './Admin/components/Eventos';

// Importaciones para Coordinación
import CoordinacionInstructoresRoutes from './Coordinacion/routes/instructores';
import CoordinacionCoordinadoresRoutes from './Coordinacion/routes/coordinadores';
import CoordinacionEquipoPedagogicoRoutes from './Coordinacion/routes/equipoPedagogico';
import CoordinacionAdministradoresRoutes from './Coordinacion/routes/administradores';
import CoordinacionActividadesRoutes from './Coordinacion/routes/actividades';
import CoordinacionEventosRoutes from './Coordinacion/routes/eventos';

// Importaciones para SuperAdmin
import SuperAdminInstructoresRoutes from './SuperAdmin/routes/instructores';
import SuperAdminCoordinadoresRoutes from './SuperAdmin/routes/coordinadores';
import SuperAdminEquipoPedagogicoRoutes from './SuperAdmin/routes/equipoPedagogico';
import SuperAdminAdministradoresRoutes from './SuperAdmin/routes/administradores';
import SuperAdminActividadesRoutes from './SuperAdmin/routes/actividades';
import SuperAdminEventosRoutes from './SuperAdmin/routes/eventos';

//importaciones para Instructor
import InstructorDashboardPage from './Instructor/routes/dashboard/page';
import InstructorGuidesPage from './Instructor/routes/guides/page';
import InstructorActivitiesPage from './Instructor/routes/activities/page';
import InstructorEventsPage from './Instructor/routes/events/page';
import InstructorReportesPage from './Instructor/routes/reportes/page';

//importaciones para EquipoPedagogico
import EquipoPedagogicoDashboardPage from './EquipoPedagogico/routes/dashboard/page';
import EquipoPedagogicoGuidesPage from './EquipoPedagogico/routes/guides/page';
import EquipoPedagogicoActivitiesPage from './EquipoPedagogico/routes/activities/page';
import EquipoPedagogicoEventsPage from './EquipoPedagogico/routes/events/page';
import EquipoPedagogicoReportesPage from './EquipoPedagogico/routes/reportes/page';



import SupportButton from './components/SupportButton';
import NotFound from './404';
import AccessDenied from './AccessDenied';
import Loader from './loader';
import { Suspense } from 'react';
import SessionWarning from './components/SessionWarning';
import ProtectedRoute from './components/ProtectedRoute';

// Carga perezosa de páginas administrativas

const DashboardPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Admin/routes/dashboard/page')));
const SuperAdminDashboardPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./SuperAdmin/routes/dashboard/page')));
const CoordinacionDashboardPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Coordinacion/routes/dashboard/page')));
const AnalisisPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Admin/routes/analisis/page')));
const ReportesExcelPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Admin/routes/reportes/excel/page')));
const CoordinacionReportesExcelPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Coordinacion/routes/reportes/excel/page')));
const SuperAdminReportesExcelPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./SuperAdmin/routes/reportes/excel/page')));
const AjustesPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Admin/routes/ajustes/page')));
const SuperAdminAjustesPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./SuperAdmin/routes/ajustes/page')));
const CoordinacionAjustesPage = lazy(() => new Promise(resolve => setTimeout(resolve, 50)).then(() => import('./Coordinacion/routes/ajustes/page')));

/**
 * Componente principal App
 * Gestiona el estado de la aplicación y define todas las rutas
 */
function App() {
  // Estado para controlar la apertura/cierre del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Inicializar el gestor de sesión
  useEffect(() => {
    // Importar dinámicamente para evitar problemas de SSR
    import('./Service/sessionManager').then(({ default: sessionManager }) => {
      // El gestor de sesión ya se inicializa automáticamente
      console.log('Gestor de sesión inicializado');
    });
  }, []);
  
  // Definir la interfaz para los eventos
  interface Event {
    _id: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    modalidad: string;
    ubicacion: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    organizador: {
      _id: string;
      nombre: string;
      apellido: string;
      email: string;
    };
    participantes: Array<{
      usuario: {
        _id: string;
        nombre: string;
        apellido: string;
        email: string;
      };
      confirmacion: string;
    }>;
  }
  
  // Estados para el carrusel de eventos
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  // Comentado temporalmente para evitar errores de conexión WebSocket
  // const { connectToNamespace, on, off } = useSocket();
  
  // Verificar cookies al cargar la aplicación
  useEffect(() => {
    // Este efecto se ejecuta una vez al cargar la aplicación
    // Las cookies ya son manejadas por el servicio de autenticación
    console.log('Cookies inicializadas');
  }, []);
  
  // Efecto para obtener los eventos desde la API
  useEffect(() => {
    // Establecer estado inicial
    setEventsLoading(true);
    setEventsError(null);
    
    // Obtener eventos desde la API con manejo de reintentos
    const fetchEvents = async (retryCount = 0) => {
      try {
        // Usar la ruta de API definida en apiRoutes.ts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout por intento
        
        const response = await fetch(`${API_URL}${EVENT_ROUTES.GET_ALL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error al obtener eventos: ${response.status}`);
        }
        
        const data = await response.json();
        setEvents(data);
        setEventsLoading(false);
      } catch (error: any) {
        console.error('Error al obtener eventos:', error);
        
        // Reintentar hasta 2 veces en caso de error (máximo 3 intentos en total)
        if (retryCount < 2) {
          console.log(`Reintentando obtener eventos (intento ${retryCount + 1})...`);
          setTimeout(() => fetchEvents(retryCount + 1), 2000); // Esperar 2 segundos antes de reintentar
        } else {
          setEventsError('No se pudieron cargar los eventos. Por favor, intente de nuevo más tarde.');
          setEventsLoading(false);
        }
      }
    };
    
    fetchEvents();
    
    // Aumentar el tiempo de espera a 15 segundos para evitar errores prematuros
    const timeout = setTimeout(() => {
      if (eventsLoading) {
        setEventsError('Cargando eventos institucionales. Por favor espere un momento...');
        // Mantenemos el estado de carga para mostrar el spinner
        setEventsLoading(true);
      }
    }, 15000);
    
    // Limpiar timeout al desmontar
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthProvider> {/* Proveedor de autenticación para toda la aplicación */}
      {/* SocketProvider comentado temporalmente para evitar errores de conexión WebSocket */}
      <Suspense fallback={<Loader />}> {/* Muestra un loader mientras se cargan los componentes */}
        <ResolutionCheck />
        <SessionWarning />
        <SecurityCheck />
        <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white relative">
              <SupportButton />
              {/* Top Banner - Mensaje de desarrollo y fecha de lanzamiento */}
              <div className="bg-yellow-300 border-b border-gray-200 relative z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center">
                  <p className="text-sm text-gray-900">
                    SenaCloud se encuentra aun en desarrollo, Se estan trabajando en la primera version de la plataforma, se Estima un Lanzamiento en{' '}
                    <strong>22 de octubre de 2025</strong> - Registrate para estar al tanto de las actualizaciones
                  </p>
                </div>
              </div>

              {/* Header - Barra de navegación principal con logo y menús */}
              <header className="bg-white border-4 border-green-200 sticky top-5 z-40 rounded-2xl shadow-lg transition-all mx-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    {/* Logo - Imagen y texto de SenaCloud */}
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://api-img-hgs.netlify.app/img/senacloud-logo.svg"
                        alt="SenaCloud"
                        className="h-16 w-auto"
                      />
                    <span className="text-2xl md:text-lg sm:text-base font-bold text-gray-800 tracking-tight">SENACLOUD</span>
                    </div>

                    {/* Navigation - Menú de navegación principal (visible solo en pantallas grandes) */}
                      <nav className="hidden lg:flex items-center space-x-8">
                        <div className="relative group">
                          <a href="#funcionalidades" className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors">
                            Manual de Usuario
                            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </a>
                        </div>

                        <div className="relative group">
                          <a href="#eventos" className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors">
                            Eventos
                            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </a>
                        </div>

                      {/* <div className="relative group">
                        <button className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors">
                          Gestion de Ambientes
                          <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div> */}

                    </nav>

                    {/* Right Side Actions - Botones de inicio de sesión y registro o menú de usuario */}
                    <div className="flex items-center space-x-6">
                      <AuthButtons isMenuOpen={isMenuOpen} />
                      
                      {/* Mobile menu button - Botón para mostrar/ocultar menú en dispositivos móviles */}
                      <button
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Menu - Menú desplegable para dispositivos móviles */}
                  {isMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-100 relative">
                      <button
                        className="absolute top-2 right-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="space-y-4">
                        <a href="#funcionalidades" className="block text-gray-700 hover:text-green-600 font-medium">Manual de usuario</a>
                        <a href="#eventos" className="block text-gray-700 hover:text-green-600 font-medium">Eventos</a>
                        <Link to="/login" className="block text-gray-700 hover:text-green-600 font-medium">Iniciar sesión</Link>
                        <Link to="/register" className="block text-gray-700 hover:text-green-600 font-medium">Registrarse</Link>
                      </div>
                    </div>
                  )}
                </div>
              </header>

              {/* Hero Section - Sección principal con título, subtítulo y video */}
              <section className="bg-gradient-to-b from-green-50 to-white pt-16 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    {/* Main Heading - Título principal de la página */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                    Gestión de cronogramas para <br />
                      <span className="text-green-600">Funcionarios SENA</span>
                    </h1>

                    {/* Subtitle - Descripción de la plataforma */}
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Optimiza la planificación académica del CTPGA con una plataforma web intuitiva, segura y en la nube. Centraliza, automatiza y mejora la coordinación entre instructores y administrativos.
                    </p>

                    {/* Video Placeholder - Imagen con botón de reproducción */}
                    <div className="relative max-w-4xl mx-auto">
                      <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src="https://api-img-hgs.netlify.app/img/image.png"
                          alt="SenaCloud Video"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-6 transition-all transform hover:scale-105">
                            <svg className="w-8 h-8 text-green-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          0:00
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Customer Logos - Sección con logos en movimiento */}
              <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <p className="text-gray-600 text-lg">
                    Desarrollado para mejorar la calidad educativa mediante innovación digital.
                    </p>
                  </div>

                  {/* Logo Marquee - Carrusel de logos en movimiento */}
                  <div className="relative overflow-hidden">
                    <div className="flex animate-scroll space-x-16 items-center">
                      <img src="https://api-img-hgs.netlify.app/img/Sennova.png" alt="Senova" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-negro.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-verde.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/senacloud-logo.png" alt="SenaCloud" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/Sennova.png" alt="Senova" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-negro.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-verde.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/senacloud-logo.png" alt="SenaCloud" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/Sennova.png" alt="Senova" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-negro.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-verde.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/senacloud-logo.png" alt="SenaCloud" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/Sennova.png" alt="Senova" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-negro.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-verde.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/senacloud-logo.png" alt="SenaCloud" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/Sennova.png" alt="Senova" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-negro.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-verde.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/senacloud-logo.png" alt="SenaCloud" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/Sennova.png" alt="Senova" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-negro.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/sena-verde.png" alt="Sena" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      <img src="https://api-img-hgs.netlify.app/img/senacloud-logo.png" alt="SenaCloud" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
                      
                    </div>
                  </div>
                </div>
              </section>

              {/* Events Carousel Section - Carrusel de eventos institucionales */} 
               <section id="eventos" className="py-20 bg-white"> 
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
                   <div className="text-center mb-12"> 
                     <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"> 
                       Eventos Institucionales <span className="text-green-600">SENA</span> 
                     </h2> 
                     <p className="text-lg text-gray-600 max-w-3xl mx-auto"> 
                       Mantente al día con los eventos más importantes del Centro de Formación 
                     </p> 
                   </div> 
 
                   <div className="relative overflow-hidden"> 
                     {eventsLoading ? ( 
                       <div className="flex justify-center items-center py-12"> 
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div> 
                         <span className="ml-3 text-gray-600">Cargando eventos...</span> 
                       </div> 
                     ) : eventsError ? ( 
                       <div className="text-center py-12"> 
                         <p className="text-red-600 mb-4">{eventsError}</p> 
                         <button 
                           onClick={() => window.location.reload()} 
                           className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors" 
                         > 
                           Reintentar 
                         </button> 
                       </div> 
                     ) : events.length === 0 ? ( 
                       <div className="text-center py-12"> 
                         <p className="text-gray-600">No hay eventos disponibles en este momento.</p> 
                       </div> 
                     ) : ( 
                       <div className="flex space-x-8 items-center overflow-x-auto pb-4" style={{scrollBehavior: 'smooth'}}> 
                         {/* Renderizar eventos dinámicos sin duplicar */} 
                         {events.map((event) => ( 
                           <div key={event._id} className="flex-none w-full md:w-1/2 lg:w-1/3 p-4"> 
                             <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"> 
                               <div className="p-8"> 
                                 <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.titulo}</h3> 
                                 <p className="text-gray-600 mb-6 leading-relaxed">{event.descripcion}</p> 
                                 
                                 <div className="space-y-3"> 
                                   {/* Fecha y hora del evento */} 
                                   <div className="flex items-center text-sm text-gray-500"> 
                                     <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> 
                                     </svg> 
                                     <span className="font-medium"> 
                                       {new Date(event.fecha).toLocaleDateString('es-ES', { 
                                         year: 'numeric', 
                                         month: 'long', 
                                         day: 'numeric' 
                                       })} 
                                       {' '} | {event.horaInicio} - {event.horaFin}
                                     </span> 
                                   </div> 
                                   
                                   {/* Ubicación y modalidad del evento */} 
                                   <div className="flex items-center text-sm text-gray-500"> 
                                     <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /> 
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> 
                                     </svg> 
                                     <span className="font-medium">
                                       {event.ubicacion || 'Sin ubicación'} | {event.modalidad}
                                     </span> 
                                   </div>
                                   
                                   {/* Organizador del evento */}
                                   {event.organizador && (
                                     <div className="flex items-center text-sm text-gray-500">
                                       <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                       </svg>
                                       <span className="font-medium">
                                         Organizado por: {event.organizador.nombre} {event.organizador.apellido}
                                       </span>
                                     </div>
                                   )} 
                                 </div> 
                               </div> 
                             </div> 
                           </div> 
                         ))} 
                       </div> 
                     )} 
                   </div> 
                 </div> 
               </section>

              {/* Dashboard Tools - Sección sobre herramientas del dashboard */}
              <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                      Herramientas que potencian tu trabajo
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      SenaCloud te ofrece un conjunto completo de herramientas diseñadas para optimizar la gestión académica y administrativa del SENA.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                      <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src="https://api-img-hgs.netlify.app/img/image.png"
                          alt="Dashboard de SenaCloud"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold text-blue-600 mb-4">Gestión de Usuarios</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Administra perfiles, roles y permisos de forma intuitiva. Controla el acceso a la información según el rol de cada usuario: SuperAdmin, Admin, Instructor, Coordinación o Equipo Pedagógico.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-600 mb-4">Reportes y Documentos</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Genera, comparte y gestiona informes en Excel con facilidad. Crea guías pedagógicas y comparte documentos importantes con tu equipo o estudiantes de manera segura.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-purple-600 mb-4">Notificaciones en Tiempo Real</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Mantente informado con alertas instantáneas sobre eventos, actividades y actualizaciones importantes. Recibe notificaciones personalizadas según tu rol y responsabilidades.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Funcionalidades Clave - Sección de funcionalidades principales del sistema */}
              <section id="funcionalidades" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                      Funcionalidades clave de SenaCloud
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      Herramientas diseñadas específicamente para optimizar la gestión académica del SENA
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Gestión de Usuarios */}
                    <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Usuarios</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Administración completa de perfiles de instructores, coordinadores y equipo pedagógico. Control de roles y permisos para garantizar la seguridad de la información.
                      </p>
                    </div>
                    
                    {/* Gestión de Actividades y Eventos */}
                    <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Actividades y Eventos</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Planificación y seguimiento de actividades académicas y eventos institucionales. Calendario compartido con notificaciones y recordatorios automáticos.
                      </p>
                    </div>

                    {/* Sistema de Reportes en Excel */}
                    <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1.99 6H7V7h10.01v2zm0 4H7v-2h10.01v2zm-3 4H7v-2h7.01v2z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Reportes en Excel</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Generación y gestión de informes académicos en formato Excel. Plantillas predefinidas, edición colaborativa y exportación de datos estadísticos.
                      </p>
                    </div>

                    {/* Guías */}
                    <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Guías Pedagógicas</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Creación y distribución de guías de aprendizaje. Repositorio centralizado con control de versiones y opciones de compartir con estudiantes.
                      </p>
                    </div>

                    {/* Notificaciones en tiempo real */}
                    <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Notificaciones en Tiempo Real</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Sistema de alertas y notificaciones instantáneas. Mantente informado sobre cambios en cronogramas, nuevos eventos y actualizaciones importantes.
                      </p>
                    </div>

                    {/* Seguridad y Privacidad */}
                    <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Seguridad y Privacidad</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Protección avanzada de datos personales y académicos. Cumplimiento con normativas de privacidad y acceso seguro mediante autenticación de dos factores.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer - Pie de página con enlaces y créditos */}
              <footer className="bg-gradient-to-br from-green-500 via-emerald-600 to-green-800 text-white py-16 animate-gradient-x overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-10 animate-fade-in-up transition-all duration-700">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg animate-fade-in">Ingresa a SenaCloud y vive con nosotros una nueva experiencia</h2>
                      <a
                        href="/register"
                        className="bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-400 transition-all duration-300 animate-glow focus:outline-none focus:ring-4 focus:ring-green-300"
                      >
                        Regístrate
                      </a>
                    </div>
                     {/* Añadiendo el componente Card en la esquina derecha */}
                    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                      <Card />
                    </div>
                    {/* <div className="grid md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20">
                      <div className="hover:scale-105 transition-transform duration-300">
                        <h4 className="font-semibold mb-4">Plataforma</h4>
                        <ul className="space-y-2 text-white/80">
                          <li><a href="#" className="hover:text-white transition-colors">Ingreso Administradores</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Ingreso de Instructores</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Reportes</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Notificaciones</a></li>
                        </ul>
                      </div>
                      <div className="hover:scale-105 transition-transform duration-300">
                        <h4 className="font-semibold mb-4">Otros Servicios</h4>
                        <ul className="space-y-2 text-white/80">
                          <li><a href="#" className="hover:text-white transition-colors">Gestion de Eventos</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Gestion de Ambientes</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Donaciones</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Asistencia Tecnica</a></li>
                        </ul>
                      </div>
                      <div className="hover:scale-105 transition-transform duration-300">
                        <h4 className="font-semibold mb-4">Recursos</h4>
                        <ul className="space-y-2 text-white/80">
                          <li><a href="#" className="hover:text-white transition-colors">Gestion organizada de Reportes</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Documentacion</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Eventos</a></li>
                        </ul>
                      </div>
                      <div className="hover:scale-105 transition-transform duration-300">
                        <h4 className="font-semibold mb-4">Para Desarrolladores</h4>
                        <ul className="space-y-2 text-white/80">
                          <li><a href="#" className="hover:text-white transition-colors">Quienes somos</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Como Ingreso</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Diseño del Software</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Precio de Modelo</a></li>
                        </ul>
                      </div>
                    </div> */}

                    <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-white/20">
                      <div className="flex items-center mb-4 md:mb-0">
                        <img
                          src="https://api-img-hgs.netlify.app/img/senacloud-logo.svg"
                          alt="SenaCloud"
                          className="h-10 w-auto mr-4 drop-shadow-glow animate-glow"
                        />
                        <span className="text-white/80 font-semibold">
                          © {new Date().getFullYear()} SenaCloud
                        </span>

                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          }
        /> 
        {/* Rutas públicas - Accesibles sin autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-contrasena" element={<PasswordRecovery />} />
        <Route path="/acceso-denegado" element={<AccessDenied />} />
        {/* Rutas protegidas para SuperAdmin - Acceso completo a todas las funcionalidades */}
        <Route path="/SuperAdmin" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>}>
          <Route index element={<SuperAdminDashboardPage />} />
          <Route path="analisis" element={<AnalisisPage />} />
          <Route path="reportes">
            <Route path="excel" element={<SuperAdminReportesExcelPage />} />
          </Route>
          <Route path="usuarios">
            <Route path="instructores/*" element={<SuperAdminInstructoresRoutes />} />
            <Route path="coordinadores/*" element={<SuperAdminCoordinadoresRoutes />} />
            <Route path="equipo-pedagogico/*" element={<SuperAdminEquipoPedagogicoRoutes />} />
            <Route path="administradores/*" element={<SuperAdminAdministradoresRoutes />} />
            <Route path="superadmins" element={<Usuarios tipo="administradores" />} />
          </Route>
          <Route path="actividades/*" element={<SuperAdminActividadesRoutes />} />
          <Route path="eventos/*" element={<SuperAdminEventosRoutes />} />
          <Route path="ajustes/*" element={<SuperAdminAjustesPage />} />
        </Route>
        {/* Rutas protegidas para Coordinación - Acceso a funcionalidades de coordinación */}
        <Route path="/Coordinacion" element={<ProtectedRoute allowedRoles={['Coordinacion']}><CoordinacionDashboard /></ProtectedRoute>}>
          <Route index element={<CoordinacionDashboardPage />} />
          <Route path="analisis" element={<AnalisisPage />} />
          <Route path="reportes">
            <Route path="excel" element={<CoordinacionReportesExcelPage />} />
          </Route>
          <Route path="usuarios">
            <Route path="instructores/*" element={<CoordinacionInstructoresRoutes />} />
            <Route path="coordinadores/*" element={<CoordinacionCoordinadoresRoutes />} />
            <Route path="equipo-pedagogico/*" element={<CoordinacionEquipoPedagogicoRoutes />} />
            <Route path="administradores/*" element={<CoordinacionAdministradoresRoutes />} />
          </Route>
          <Route path="actividades/*" element={<CoordinacionActividadesRoutes />} />
          <Route path="eventos/*" element={<CoordinacionEventosRoutes />} />
          <Route path="ajustes/*" element={<CoordinacionAjustesPage />} />
        </Route>
        
        {/* Rutas protegidas para Admin - Acceso a funcionalidades administrativas */}
        <Route path="/Admin" element={<ProtectedRoute allowedRoles={['Admin']}><Admin /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="analisis" element={<AnalisisPage />} />
          <Route path="reportes">
            <Route path="excel" element={<ReportesExcelPage />} />
          </Route>
          <Route path="usuarios">
            <Route path="instructores/*" element={
              <ProtectedRoute allowedRoles={['Admin', 'Coordinacion']}>
                <InstructoresRoutes />
              </ProtectedRoute>
            } />
            <Route path="coordinadores/*" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CoordinadoresRoutes />
              </ProtectedRoute>
            } />
            <Route path="equipo-pedagogico/*" element={
              <ProtectedRoute allowedRoles={['Admin', 'Coordinacion']}>
                <EquipoPedagogicoRoutes />
              </ProtectedRoute>
            } />
            <Route path="administradores/*" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdministradoresRoutes />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="actividades/*" element={
            <ProtectedRoute allowedRoles={['Admin', 'Coordinacion', 'EquipoPedagogico']}>
              <Actividades />
            </ProtectedRoute>
          } />
          <Route path="eventos/*" element={
            <ProtectedRoute allowedRoles={['Admin', 'Coordinacion', 'EquipoPedagogico']}>
              <Eventos />
            </ProtectedRoute>
          } />
          <Route path="ajustes" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AjustesPage />
            </ProtectedRoute>
          } />
        </Route>
        {/* Rutas protegidas para Instructor - Acceso a funcionalidades específicas para instructores */}
        <Route path="/Instructor" element={<ProtectedRoute allowedRoles={['Instructor']}><InstructorDashboard /></ProtectedRoute>}>
          <Route index element={<InstructorDashboardPage />} />
          <Route path="guias/*" element={<InstructorGuidesPage />} />
          <Route path="actividades/*" element={<InstructorActivitiesPage />} />
          <Route path="eventos/*" element={<InstructorEventsPage />} />
          <Route path="reportes" element={<InstructorReportesPage />} />
        </Route>
        {/* Rutas protegidas para EquipoPedagogico - Acceso a funcionalidades específicas para equipo pedagógico */}
        <Route path="/EquipoPedagogico" element={<ProtectedRoute allowedRoles={['EquipoPedagogico']}><EquipoPedagogicoDashboard /></ProtectedRoute>}>
          <Route index element={<EquipoPedagogicoDashboardPage />} />
          <Route path="guias/*" element={<EquipoPedagogicoGuidesPage />} />
          <Route path="actividades/*" element={<EquipoPedagogicoActivitiesPage />} />
          <Route path="eventos/*" element={<EquipoPedagogicoEventsPage />} />
          <Route path="reportes" element={<EquipoPedagogicoReportesPage />} />
        </Route>
        {/* Ruta para páginas no encontradas - Error 404 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
        
        
      </Suspense>
    </AuthProvider>
  );
}

/**
 * Exportación del componente App como componente principal de la aplicación
 */
export default App;
