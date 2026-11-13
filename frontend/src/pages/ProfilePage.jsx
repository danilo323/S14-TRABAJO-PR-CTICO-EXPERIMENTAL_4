import { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Users } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../api/client';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchProtectedData() {
      setLoading(true);
      setError('');
      try {
        const [profileRes, usersRes] = await Promise.all([
          apiClient.get('/auth/profile'),
          apiClient.get('/auth/users'),
        ]);

        if (!active) return;
        setProfile(profileRes.data.user);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        if (!active) return;
        setError(extractErrorMessage(err, 'No se pudo consultar el perfil protegido.'));
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProtectedData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="card empty-state">
          <div className="spinner" />
          <p>Consultando rutas protegidas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Perfil y Consulta de Usuarios</h1>
          <p className="subtitle">
            Datos obtenidos en vivo desde endpoints protegidos por middleware JWT.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {profile && (
        <section className="card profile-card">
          <div className="section-title">
            <UserCheck size={20} />
            <h2>Mi Perfil (GET /api/auth/profile)</h2>
            <span className="badge badge-status-completada">
              <ShieldCheck size={14} /> Token válido
            </span>
          </div>

          <div className="profile-grid">
            <div>
              <span className="meta-label">ID en MongoDB</span>
              <p className="mono">{profile._id}</p>
            </div>
            <div>
              <span className="meta-label">Nombre</span>
              <p>{profile.name}</p>
            </div>
            <div>
              <span className="meta-label">Correo electrónico</span>
              <p>{profile.email}</p>
            </div>
            <div>
              <span className="meta-label">Rol</span>
              <p>{profile.role}</p>
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-title">
          <Users size={20} />
          <h2>Usuarios Registrados (GET /api/auth/users)</h2>
          <span className="badge badge-priority-media">{users.length} registrados</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Fecha de registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.role}</td>
                  <td>{new Date(item.createdAt).toLocaleString('es-EC')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
