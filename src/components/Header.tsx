import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, HandHeart, Map, LogIn, Car, User, Home, Menu, X, Users, AlertTriangle } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { useUserStore } from '../store/userStore';

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/assistance', icon: HandHeart, label: 'Solicitudes' },
    { path: '/volunteers', icon: Users, label: 'Voluntarios' },
    { path: '/carpools', icon: Car, label: 'Viajes' },
    { path: '/housing', icon: Home, label: 'Viviendas' },
  ];

  return (
    <>
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <div className="relative">
                  <Users className="h-6 w-6 text-red-500" />
                  <div className="absolute -bottom-1.5 -right-1.5">
                    <Heart className="h-4 w-4 text-red-600 fill-current" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5">
                    <HandHeart className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900 whitespace-nowrap">SOS Conecta</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:flex-1 md:justify-center md:space-x-1">
              {navigationItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md ${
                    location.pathname === path 
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {label}
                </Link>
              ))}
              <a
                href="https://ajudadana.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                Ayuda Inmediata Dana
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {currentUser ? (
                <div className="flex items-center space-x-1">
                  <Link
                    to="/profile"
                    className={`inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md ${
                      location.pathname === '/profile' 
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    {currentUser.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Registro
                  </Link>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <LogIn className="h-3.5 w-3.5 mr-1.5" />
                    Iniciar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-1">
              {!currentUser && (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogIn className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === path
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </div>
                </Link>
              ))}

              <a
                href="https://ajudadana.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Ayuda Inmediata Dana
                </div>
              </a>

              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/profile'
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Registro
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}