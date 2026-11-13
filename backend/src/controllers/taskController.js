const { Task, TASK_STATUSES, TASK_PRIORITIES } = require('../models/Task');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSummary(tasks) {
  const summary = {
    total: tasks.length,
    pendiente: 0,
    en_progreso: 0,
    completada: 0,
    altaPrioridad: 0,
    completionRate: 0,
  };

  for (const task of tasks) {
    if (task.status in summary) {
      summary[task.status] += 1;
    }
    if (task.priority === 'alta' && task.status !== 'completada') {
      summary.altaPrioridad += 1;
    }
  }

  summary.completionRate =
    summary.total > 0 ? Math.round((summary.completada / summary.total) * 100) : 0;

  return summary;
}

/**
 * GET /api/tasks (Protegida)
 * Lista tareas del usuario autenticado con filtros opcionales y resumen de reportería.
 */
async function getTasks(req, res, next) {
  try {
    const { status, priority, search } = req.query;
    const filter = { user: req.user._id };

    if (status && TASK_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (priority && TASK_PRIORITIES.includes(priority)) {
      filter.priority = priority;
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const [tasks, allUserTasks] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }),
      Task.find({ user: req.user._id }).select('status priority'),
    ]);

    res.json({
      ok: true,
      total: tasks.length,
      tasks,
      summary: buildSummary(allUserTasks),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id (Protegida)
 * Obtiene una tarea específica si pertenece al usuario autenticado.
 */
async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: 'Tarea no encontrada o no tienes permisos para verla.',
      });
    }

    res.json({ ok: true, task });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks (Protegida)
 * Crea una nueva tarea asociada al usuario autenticado.
 */
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El título de la tarea es obligatorio.',
      });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      status: status || 'pendiente',
      priority: priority || 'media',
      dueDate: dueDate || null,
      user: req.user._id,
    });

    res.status(201).json({
      ok: true,
      message: 'Tarea creada correctamente.',
      task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/tasks/:id (Protegida)
 * Actualiza una tarea existente perteneciente al usuario autenticado.
 */
async function updateTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: 'Tarea no encontrada o no tienes permisos para editarla.',
      });
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field] === '' && field === 'dueDate' ? null : req.body[field];
      }
    }

    const updatedTask = await task.save();

    res.json({
      ok: true,
      message: 'Tarea actualizada correctamente.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/:id (Protegida)
 * Elimina una tarea existente perteneciente al usuario autenticado.
 */
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: 'Tarea no encontrada o no tienes permisos para eliminarla.',
      });
    }

    res.json({
      ok: true,
      message: 'Tarea eliminada correctamente.',
      deletedId: task._id,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
