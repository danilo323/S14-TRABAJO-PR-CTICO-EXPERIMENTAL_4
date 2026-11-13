import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ListTodo,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { apiClient, extractErrorMessage } from '../api/client';
import TaskFormModal from '../components/TaskFormModal';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
};

const PRIORITY_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

const EMPTY_SUMMARY = {
  total: 0,
  pendiente: 0,
  en_progreso: 0,
  completada: 0,
  altaPrioridad: 0,
  completionRate: 0,
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const { data } = await apiClient.get('/tasks', { params });
      setTasks(data.tasks || []);
      setSummary(data.summary || EMPTY_SUMMARY);
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudieron cargar las tareas.'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (payload) => {
    setSaving(true);
    try {
      if (editingTask) {
        await apiClient.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await apiClient.post('/tasks', payload);
      }
      setModalOpen(false);
      await loadTasks();
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'No se pudo guardar la tarea.'));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      await apiClient.put(`/tasks/${task._id}`, { status: newStatus });
      await loadTasks();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo actualizar el estado.'));
    }
  };

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la tarea "${task.title}"?`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/tasks/${task._id}`);
      await loadTasks();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo eliminar la tarea.'));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Panel de Tareas y Reportería</h1>
          <p className="subtitle">
            Bienvenido, <strong>{user?.name}</strong>. Tus tareas están protegidas con JWT.
          </p>
        </div>

        <button type="button" onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Nueva tarea</span>
        </button>
      </div>

      {/* Tarjetas de reportería */}
      <section className="stats-grid" aria-label="Resumen de tareas">
        <div className="stat-card">
          <div className="stat-icon stat-blue">
            <ListTodo size={20} />
          </div>
          <div>
            <span className="stat-label">Total</span>
            <strong className="stat-value">{summary.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-amber">
            <Clock size={20} />
          </div>
          <div>
            <span className="stat-label">Pendientes</span>
            <strong className="stat-value">{summary.pendiente}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-indigo">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="stat-label">En progreso</span>
            <strong className="stat-value">{summary.en_progreso}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="stat-label">Completadas</span>
            <strong className="stat-value">{summary.completada}</strong>
          </div>
        </div>
      </section>

      {/* Barra de progreso */}
      <section className="card progress-card">
        <div className="progress-header">
          <span>Progreso general de cumplimiento</span>
          <strong>
            {summary.completionRate}% ({summary.completada}/{summary.total} completadas ·{' '}
            {summary.altaPrioridad} de prioridad alta activas)
          </strong>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${summary.completionRate}%` }}
          />
        </div>
      </section>

      {/* Filtros y búsqueda */}
      <section className="card filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, priority: e.target.value }))
          }
          aria-label="Filtrar por prioridad"
        >
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Listado de tareas */}
      {loading ? (
        <div className="card empty-state">
          <div className="spinner" />
          <p>Cargando tareas desde MongoDB...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card empty-state">
          <ListTodo size={36} />
          <h3>No hay tareas para mostrar</h3>
          <p>
            Crea tu primera tarea con el botón <strong>Nueva tarea</strong> o ajusta los
            filtros de búsqueda.
          </p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <article key={task._id} className="card task-card">
              <div className="task-top">
                <span className={`badge badge-priority-${task.priority}`}>
                  Prioridad {PRIORITY_LABELS[task.priority] || task.priority}
                </span>
                <span className={`badge badge-status-${task.status}`}>
                  {STATUS_LABELS[task.status] || task.status}
                </span>
              </div>

              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">
                {task.description || 'Sin descripción adicional.'}
              </p>

              {task.dueDate && (
                <div className="task-meta">
                  <Calendar size={14} />
                  <span>
                    Límite: {new Date(task.dueDate).toLocaleDateString('es-EC')}
                  </span>
                </div>
              )}

              <div className="task-actions">
                <select
                  value={task.status}
                  onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                  aria-label={`Cambiar estado de ${task.title}`}
                  className="status-select"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>

                <div className="action-buttons">
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="icon-btn"
                    title="Editar tarea"
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task)}
                    className="icon-btn icon-btn-danger"
                    title="Eliminar tarea"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        saving={saving}
      />
    </div>
  );
}
