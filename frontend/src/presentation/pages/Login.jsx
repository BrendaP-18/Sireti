// PAC - PRESENTATION: Página de Login
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../control/AuthContext';

export default function Login() {
  const [correo, setCorreo]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login, loading }      = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(correo, password);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <span className="login-logo-name">Sireti</span>
        </div>

        <h1 className="login-title">Bienvenido de nuevo</h1>
        <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              id="login-correo"
              type="email"
              className="form-control"
              placeholder="tu@correo.com"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '11px', fontSize: '14px', marginTop: 8, justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></span>
                Iniciando sesión...
              </>
            ) : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#2d6a4f', fontWeight: 600, textDecoration: 'none' }}>
            Regístrate
          </Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#9ca3af' }}>
          Sistema de Soporte e Inventario TI
        </p>
      </div>
    </div>
  );
}
