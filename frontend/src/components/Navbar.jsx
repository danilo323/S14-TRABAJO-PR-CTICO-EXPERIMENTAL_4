import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CheckSquare, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="brand">
          <CheckSquare size={22} />
          <span>TaskFlow</span>
          <span className="brand-badge">JWT</span>
        </Link>

        <nav className="nav-links">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className="nav-link">
                Panel de Tareas
              </NavLink>
              <NavLink to="/profile" className="nav-link">
                <User size={16} />
                <span>Perfil</span>
              </NavLink>
              <NavLink to="/pruebas-jwt" className="nav-link">
                <ShieldCheck size={16} />
                <span>Pruebas JWT</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Iniciar Sesión
              </NavLink>
              <NavLink to="/register" className="nav-link">
                Registrarse
              </NavLink>
              <NavLink to="/pruebas-jwt" className="nav-link">
                <ShieldCheck size={16} />
                <span>Pruebas JWT</span>
              </NavLink>
            </>
          )}
        </nav>

        {isAuthenticated && (
          <div className="nav-user">
            <span className="user-pill">{user?.name}</span>
            <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
