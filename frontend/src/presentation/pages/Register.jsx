// PAC - PRESENTATION: Página de Registro de Usuario
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../abstraction/auth.service';

const AREAS = ['Sistemas', 'Administración', 'Recursos Humanos', 'Contabilidad', 'Operaciones', 'Dirección', 'Otro'];
const ROLES = [
  { value: 'trabajador', label: 'Trabajador' },
  { value: 'tecnico',    label: 'Técnico TI' },
  { value: 'admin',      label: 'Administrador' },
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    area: '',
    correo: '',
    password: '',
    confirmar: '',
    rol: 'trabajador',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim())   return setError('El nombre es requerido');
    if (!form.correo.trim())   return setError('El correo es requerido');
    if (!form.password)        return setError('La contraseña es requerida');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden');

    setLoading(true);
    try {
      await authService.register({
        nombre:   form.nombre.trim(),
        area:     form.area,
        correo:   form.correo.trim().toLowerCase(),
        password: form.password,
        rol:      form.rol,
      });
      setSuccess('✅ Usuario registrado correctamente. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <span className="login-logo-name">Sireti</span>
        </div>

        <h1 className="login-title">Crear cuenta</h1>
        <p className="login-subtitle">Completa el formulario para registrarte en el sistema</p>

        {/* Mensajes */}
        {error   && <div className="login-error">⚠️ {error}</div>}
        {success && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nombre completo */}
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input
              id="reg-nombre"
              name="nombre"
              type="text"
              className="form-control"
              placeholder="Ej. María López Reyez"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* Área y Rol en fila */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Área</label>
              <select
                id="reg-area"
                name="area"
                className="form-control"
                value={form.area}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rol</label>
              <select
                id="reg-rol"
                name="rol"
                className="form-control"
                value={form.rol}
                onChange={handleChange}
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {/* Correo */}
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              id="reg-correo"
              name="correo"
              type="email"
              className="form-control"
              placeholder="tu@correo.com"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password y confirmación en fila */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Mín. 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <input
                id="reg-confirmar"
                name="confirmar"
                type="password"
                className="form-control"
                placeholder="Repetir contraseña"
                value={form.confirmar}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Indicador de fortaleza */}
          {form.password && (
            <div style={{ marginBottom: 14, marginTop: -6 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: form.password.length >= i * 3
                      ? i <= 1 ? '#ef4444' : i === 2 ? '#f59e0b' : i === 3 ? '#10b981' : '#059669'
                      : '#e5e7eb',
                    transition: 'background 0.3s'
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {form.password.length < 4 ? 'Muy débil' : form.password.length < 7 ? 'Débil' : form.password.length < 10 ? 'Buena' : 'Fuerte'}
              </span>
            </div>
          )}

          {/* Botón */}
          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '11px', fontSize: '14px', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></span>
                Registrando...
              </>
            ) : 'Crear cuenta'}
          </button>
        </form>

        {/* Link al login */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#2d6a4f', fontWeight: 600, textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
