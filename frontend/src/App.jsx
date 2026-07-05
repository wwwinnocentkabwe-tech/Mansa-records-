import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Citizens from './pages/Citizens';
import Land from './pages/Land';
import Business from './pages/Business';
import Users from './pages/Users';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/citizens': 'Citizens & Residents',
  '/land': 'Land & Property Records',
  '/business': 'Business Licences',
  '/users': 'User Management',
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const path = window.location.pathname;
  return (
    <div className="layout">
      <Sidebar />
      <div className="page-wrapper" style={{ flex: 1 }}>
        <div className="topbar">
          <h1>{PAGE_TITLES[path] || 'Records System'}</h1>
          <span className="topbar-role">{user?.role}</span>
        </div>
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
        } />
        <Route path="/citizens" element={
          <ProtectedRoute><AppLayout><Citizens /></AppLayout></ProtectedRoute>
        } />
        <Route path="/land" element={
          <ProtectedRoute><AppLayout><Land /></AppLayout></ProtectedRoute>
        } />
        <Route path="/business" element={
          <ProtectedRoute><AppLayout><Business /></AppLayout></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute roles={['admin']}><AppLayout><Users /></AppLayout></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
