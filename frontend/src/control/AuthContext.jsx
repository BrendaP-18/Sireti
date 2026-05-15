// PAC - CONTROL: Contexto de Autenticación
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../abstraction/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('sireti_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (correo, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login(correo, password);
      localStorage.setItem('sireti_token', data.token);
      localStorage.setItem('sireti_user', JSON.stringify(data.usuario));
      setUsuario(data.usuario);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sireti_token');
    localStorage.removeItem('sireti_user');
    setUsuario(null);
  };

  const initiales = (nombre) => {
    if (!nombre) return '??';
    return nombre.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('');
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, initiales }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
