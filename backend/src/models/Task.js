const mongoose = require('mongoose');

const TASK_STATUSES = ['pendiente', 'en_progreso', 'completada'];
const TASK_PRIORITIES = ['baja', 'media', 'alta'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la tarea es obligatorio.'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres.'],
      maxlength: [120, 'El título no puede superar los 120 caracteres.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede superar los 500 caracteres.'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Estado inválido. Valores permitidos: pendiente, en_progreso, completada.',
      },
      default: 'pendiente',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: 'Prioridad inválida. Valores permitidos: baja, media, alta.',
      },
      default: 'media',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = {
  Task: mongoose.model('Task', taskSchema),
  TASK_STATUSES,
  TASK_PRIORITIES,
};
