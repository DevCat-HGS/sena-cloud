import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Service/API/AuthContext';
import Loader from '../loader';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Permitir acceso a imágenes y recursos estáticos sin restricciones
  const isImageRequest = path.includes('/img/') || path.includes('/images/') || 
                         path.includes('.png') || path.includes('.jpg') || 
                         path.includes('.svg') || path.includes('.ico') ||
                         path.includes('/assets/') || path.includes('api-img');
  
  // Si es una solicitud de imagen, permitir acceso sin restricciones
  if (isImageRequest) {
    return children;
  }

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return <Loader />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario es SuperAdmin, tiene acceso a todo sin restricciones
  if (user && user.rol === 'SuperAdmin') {
    return children;
  }
  
  // Permitir acceso completo a usuarios con rol Coordinacion en su sección
  if (user && user.rol === 'Coordinacion' && path.startsWith('/Coordinacion')) {
    return children;
  }
  
  // Si hay roles permitidos y el usuario no tiene uno de ellos, redirigir a una página de acceso denegado
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  // Si está autenticado y tiene el rol adecuado, mostrar el componente hijo
  return children;
};

export default ProtectedRoute;