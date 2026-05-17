// PAC - PRESENTATION: App principal con enrutamiento por rol
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './control/AuthContext';

// Layout Admin/Técnico
import Sidebar   from './presentation/components/Sidebar';
import Topbar    from './presentation/components/Topbar';

// Layout Trabajador
import SidebarTrabajador from './presentation/components/SidebarTrabajador';

// Páginas comunes
import Login     from './presentation/pages/Login';
import Register  from './presentation/pages/Register';

// Páginas Admin/Técnico
import Dashboard from './presentation/pages/Dashboard';
import Equipos   from './presentation/pages/Equipos';
import Reportes  from './presentation/pages/Reportes';
import Eventos   from './presentation/pages/Eventos';
import Chat      from './presentation/pages/Chat';
import Tickets   from './presentation/pages/Tickets';

// Páginas Trabajador
import MiEquipo      from './presentation/pages/trabajador/MiEquipo';
import MisReportes   from './presentation/pages/trabajador/MisReportes';
import ChatTrabajador from './presentation/pages/trabajador/ChatTrabajador';

/* ── Ruta protegida ── */
function PrivateRoute({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
}

/* ── Layout Admin/Técnico ── */
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

/* ── Layout Trabajador ── */
function WorkerLayout({ children }) {
  return (
    <div className="app-layout">
      <SidebarTrabajador />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

/* ── Redirige según rol al entrar ── */
function HomeRedirect() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'trabajador') return <Navigate to="/trabajador/mi-equipo" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { usuario } = useAuth();
  const esTrabajador = usuario?.rol === 'trabajador';

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login"    element={usuario ? <HomeRedirect /> : <Login />} />
      <Route path="/register" element={usuario ? <HomeRedirect /> : <Register />} />

      {/* Ruta raíz → redirige por rol */}
      <Route path="/" element={<HomeRedirect />} />

      {/* ═══ PORTAL ADMIN / TÉCNICO ═══ */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          {esTrabajador
            ? <Navigate to="/trabajador/mi-equipo" replace />
            : <AppLayout><Dashboard /></AppLayout>}
        </PrivateRoute>
      } />
      <Route path="/equipos" element={
        <PrivateRoute>
          {esTrabajador
            ? <Navigate to="/trabajador/mi-equipo" replace />
            : <AppLayout><Equipos /></AppLayout>}
        </PrivateRoute>
      } />
      <Route path="/reportes" element={
        <PrivateRoute>
          {esTrabajador
            ? <Navigate to="/trabajador/mis-reportes" replace />
            : <AppLayout><Reportes /></AppLayout>}
        </PrivateRoute>
      } />
      <Route path="/eventos" element={
        <PrivateRoute>
          {esTrabajador
            ? <Navigate to="/trabajador/mi-equipo" replace />
            : <AppLayout><Eventos /></AppLayout>}
        </PrivateRoute>
      } />
      <Route path="/chat" element={
        <PrivateRoute>
          {esTrabajador
            ? <Navigate to="/trabajador/chat" replace />
            : <AppLayout><Chat /></AppLayout>}
        </PrivateRoute>
      } />
      <Route path="/tickets" element={
        <PrivateRoute>
          {esTrabajador
            ? <Navigate to="/trabajador/mis-reportes" replace />
            : <AppLayout><Tickets /></AppLayout>}
        </PrivateRoute>
      } />

      {/* ═══ PORTAL TRABAJADOR ═══ */}
      <Route path="/trabajador/mi-equipo" element={
        <PrivateRoute>
          <WorkerLayout><MiEquipo /></WorkerLayout>
        </PrivateRoute>
      } />
      <Route path="/trabajador/mis-reportes" element={
        <PrivateRoute>
          <WorkerLayout><MisReportes /></WorkerLayout>
        </PrivateRoute>
      } />
      <Route path="/trabajador/chat" element={
        <PrivateRoute>
          <WorkerLayout><ChatTrabajador /></WorkerLayout>
        </PrivateRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<HomeRedirect />} />
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
