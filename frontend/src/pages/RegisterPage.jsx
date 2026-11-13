import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, UserPlus } from 'lucide-react';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo completar el registro.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={24} />
          </div>
          <h1>Crear Cuenta</h1>
          <p>Regístrate en MongoDB Atlas y obtén tu token JWT automáticamente.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <label className="field">
            <span>Nombre completo</span>
            <div className="input-icon">
              <User size={16} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Danilo Angulo"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Correo electrónico</span>
            <div className="input-icon">
              <Mail size={16} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ejemplo@unemi.edu.ec"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Contraseña (mín. 6 caracteres)</span>
            <div className="input-icon">
              <Lock size={16} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Confirmar contraseña</span>
            <div className="input-icon">
              <Lock size={16} />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
