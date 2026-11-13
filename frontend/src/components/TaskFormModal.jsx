import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'pendiente',
  priority: 'media',
  dueDate: '',
};

export default function TaskFormModal({ isOpen, onClose, onSubmit, initialTask, saving }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'pendiente',
        priority: initialTask.priority || 'media',
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || null,
      });
    } catch (err) {
      setError(err.message || 'No se pudo guardar la tarea.');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{initialTask ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {error && <div className="alert alert-error">{error}</div>}

          <label className="field">
            <span>Título *</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej. Implementar autenticación JWT"
              maxLength={120}
              required
            />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detalles de la actividad..."
              rows={3}
              maxLength={500}
            />
          </label>

          <div className="grid-2">
            <label className="field">
              <span>Estado</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </label>

            <label className="field">
              <span>Prioridad</span>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Fecha límite (opcional)</span>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : initialTask ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
