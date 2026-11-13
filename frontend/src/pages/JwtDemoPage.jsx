import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { apiClient, apiPublic } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function JwtDemoPage() {
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();

  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const runRequestTest = async (mode) => {
    setTesting(true);
    try {
      if (mode === 'without-token') {
        const res = await apiPublic.get('/auth/profile');
        setTestResult({
          title: 'Prueba SIN Token (GET /api/auth/profile)',
          status: res.status,
          authorized: true,
          payload: res.data,
        });
      } else if (mode === 'invalid-token') {
        const res = await apiPublic.get('/tasks', {
          headers: { Authorization: 'Bearer token_invalido_de_prueba_123' },
        });
        setTestResult({
          title: 'Prueba con Token Inválido (GET /api/tasks)',
          status: res.status,
          authorized: true,
          payload: res.data,
        });
      } else {
        const res = await apiClient.get('/auth/profile');
        setTestResult({
          title: 'Prueba CON Token JWT válido (GET /api/auth/profile)',
          status: res.status,
          authorized: true,
          payload: res.data,
        });
      }
    } catch (error) {
      setTestResult({
        title:
          mode === 'without-token'
            ? 'Prueba SIN Token (GET /api/auth/profile)'
            : mode === 'invalid-token'
              ? 'Prueba con Token Inválido (GET /api/tasks)'
              : 'Prueba CON Token (GET /api/auth/profile)',
        status: error?.response?.status || 0,
        authorized: false,
        payload: error?.response?.data || { message: error.message },
      });
    } finally {
      setTesting(false);
    }
  };

  const maskedToken = token
    ? `${token.slice(0, 24)}...${token.slice(-16)}`
    : 'No hay token guardado en localStorage';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Laboratorio de Acceso JWT</h1>
          <p className="subtitle">
            Comprueba en vivo el acceso autorizado y no autorizado a las rutas protegidas
            del Back-End.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="section-title">
          <KeyRound size={20} />
          <h2>Estado actual de autenticación</h2>
          {isAuthenticated ? (
            <span className="badge badge-status-completada">
              <ShieldCheck size={14} /> Sesión activa ({user?.email})
            </span>
          ) : (
            <span className="badge badge-priority-alta">
              <ShieldAlert size={14} /> Sin sesión iniciada
            </span>
          )}
        </div>

        <div className="token-box">
          <code className="mono">{showToken && token ? token : maskedToken}</code>
          {token && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowToken((prev) => !prev)}
            >
              {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{showToken ? 'Ocultar' : 'Ver token'}</span>
            </button>
          )}
        </div>

        <div className="demo-buttons">
          <button
            type="button"
            className="btn btn-danger"
            disabled={testing}
            onClick={() => runRequestTest('without-token')}
          >
            <ShieldAlert size={16} />
            <span>1. Probar SIN Token (401)</span>
          </button>

          <button
            type="button"
            className="btn btn-warning"
            disabled={testing}
            onClick={() => runRequestTest('invalid-token')}
          >
            <Lock size={16} />
            <span>2. Probar con Token Inválido (401)</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={testing}
            onClick={() => runRequestTest('with-token')}
          >
            <ShieldCheck size={16} />
            <span>3. Probar CON Token Actual</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/dashboard')}
          >
            <span>Intentar abrir /dashboard</span>
          </button>
        </div>
      </section>

      {testResult && (
        <section className="card">
          <div className="section-title">
            <h3>{testResult.title}</h3>
            <span
              className={`badge ${
                testResult.authorized ? 'badge-status-completada' : 'badge-priority-alta'
              }`}
            >
              HTTP {testResult.status} ·{' '}
              {testResult.authorized ? 'Acceso Autorizado' : 'Acceso Denegado'}
            </span>
          </div>

          <pre className="json-preview">
            {JSON.stringify(testResult.payload, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
