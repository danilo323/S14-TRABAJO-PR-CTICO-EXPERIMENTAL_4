const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas del CRUD de tareas requieren autenticación JWT válida
router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;
