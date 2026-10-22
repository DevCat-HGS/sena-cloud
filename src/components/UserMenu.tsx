import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Service/API/AuthContext';

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  const goToDashboard = () => {
    // Redirigir según el rol del usuario
    if (user && user.rol) {
      switch (user.rol) {
        case 'Admin':
          navigate('/Admin');
          break;
        case 'Instructor':
          navigate('/Instructor');
          break;
        case 'SuperAdmin':
          navigate('/SuperAdmin');
          break;
        case 'Coordinacion':
          navigate('/Coordinacion');
          break;
        case 'EquipoPedagogico':
          navigate('/EquipoPedagogico');
          break;
        default:
          navigate('/');
          break;
      }
    } else {
      navigate('/');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        <span className="sr-only">Menú de usuario</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
          <button
            onClick={goToDashboard}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700"
          >
            {user && user.rol ? (
              <>
                {user.rol === 'Admin' && 'Ir a panel administrativo'}
                {user.rol === 'Instructor' && 'Ir a panel de instructor'}
                {user.rol === 'SuperAdmin' && 'Ir a panel de super admin'}
                {user.rol === 'Coordinacion' && 'Ir a panel de coordinación'}
                {user.rol === 'EquipoPedagogico' && 'Ir a panel pedagógico'}
                {!['Admin', 'Instructor', 'SuperAdmin', 'Coordinacion', 'EquipoPedagogico'].includes(user.rol) && 'Ir a panel institucional'}
              </>
            ) : (
              'Ir a panel institucional'
            )}
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;