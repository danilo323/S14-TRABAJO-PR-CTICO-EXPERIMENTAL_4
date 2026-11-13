import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail, ShieldAlert } from 'lucide-react';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authRequired = location.state?.authRequired;
  const fromPath = location.state?.from || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo iniciar sesión.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <LogIn size={24} />
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Accede con tu cuenta para gestionar tus tareas protegidas con JWT.</p>
        </div>

        {authRequired && (
          <div className="alert alert-warning">
            <ShieldAlert size={18} />
            <span>
              Acceso restringido: debes iniciar sesión para entrar a{' '}
              <strong>{fromPath}</strong>.
            </span>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <label className="field">
            <span>Correo electrónico</span>
            <div className="input-icon">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@unemi.edu.ec"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Contraseña</span>
            <div className="input-icon">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
              />
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
          <p className="muted-link">
            ¿Quieres comprobar el bloqueo sin token?{' '}
            <Link to="/pruebas-jwt">Ir al Laboratorio JWT</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
