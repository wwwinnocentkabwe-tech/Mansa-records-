import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>🏛️ Mansa Municipal Council</h2>
        <span>Records Management System</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/citizens" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">👥</span> Citizens
        </NavLink>
        <NavLink to="/land" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">🗺️</span> Land & Property
        </NavLink>
        <NavLink to="/business" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">🏪</span> Business Licences
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="icon">🔐</span> Manage Users
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{user?.full_name}</strong>
          {user?.role}
        </div>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
