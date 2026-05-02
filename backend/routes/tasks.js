const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.get('/stats', protect, getDashboardStats);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

module.exports = router;
