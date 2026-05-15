// PAC - PRESENTATION: App principal con enrutamiento
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './control/AuthContext';

import Sidebar   from './presentation/components/Sidebar';
import Topbar    from './presentation/components/Topbar';
import Login     from './presentation/pages/Login';
import Register  from './presentation/pages/Register';
import Dashboard from './presentation/pages/Dashboard';
import Equipos   from './presentation/pages/Equipos';
import Reportes  from './presentation/pages/Reportes';
import Eventos   from './presentation/pages/Eventos';
import Chat      from './presentation/pages/Chat';
import Tickets   from './presentation/pages/Tickets';

// Rutas protegidas: redirige al login si no hay sesión
function PrivateRoute({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
}

// Layout con sidebar + topbar
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={usuario ? <Navigate to="/" replace /> : <Register />} />

      <Route path="/" element={
        <PrivateRoute>
          <AppLayout><Dashboard /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/equipos" element={
        <PrivateRoute>
          <AppLayout><Equipos /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/reportes" element={
        <PrivateRoute>
          <AppLayout><Reportes /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/eventos" element={
        <PrivateRoute>
          <AppLayout><Eventos /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/chat" element={
        <PrivateRoute>
          <AppLayout><Chat /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/tickets" element={
        <PrivateRoute>
          <AppLayout><Tickets /></AppLayout>
        </PrivateRoute>
      } />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
