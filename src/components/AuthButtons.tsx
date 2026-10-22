import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Service/API/AuthContext';
import UserMenu from './UserMenu';

interface AuthButtonsProps {
  isMenuOpen?: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ isMenuOpen = false }) => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {isAuthenticated ? (
        <UserMenu onLogout={handleLogout} />
      ) : (
        <>
          <Link to="/login" className="hidden md:block text-gray-700 hover:text-green-600 font-medium transition-colors">
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className={`bg-green-500 text-white px-1 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full font-bold shadow-lg hover:bg-green-400 transition-all duration-300 animate-glow focus:outline-none focus:ring-4 focus:ring-green-300 ${isMenuOpen ? 'hidden' : ''}`}
          >
            Regístrate
          </Link>
        </>
      )}
    </>
  );
};

export default AuthButtons;