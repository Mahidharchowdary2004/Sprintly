const prisma = require('../lib/prisma');
const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('To Do', 'In Progress', 'Completed').optional(),
  project: Joi.string().required(),
  assignedTo: Joi.string().allow('', null).optional(),
  dueDate: Joi.date().allow('', null).optional()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Completed').optional(),
  assignedTo: Joi.string().allow('', null).optional(),
  dueDate: Joi.date().allow('', null).optional()
});

// Helper to map UI status to Prisma Enum names
const mapStatusToPrisma = (status) => {
  if (status === 'To Do') return 'ToDo';
  if (status === 'In Progress') return 'InProgress';
  return status; // Completed
};

// Helper to map Prisma Enum names to UI status
const mapStatusToUI = (status) => {
  if (status === 'ToDo') return 'To Do';
  if (status === 'InProgress') return 'In Progress';
  return status;
};

const getTasks = async (req, res) => {
  try {
    const { projectId, filter } = req.query;
    let where = {};
    
    if (projectId) {
      where.projectId = projectId;
    }

    if (filter === 'overdue') {
      where.status = { not: 'Completed' };
      where.dueDate = { lt: new Date() };
    } else {
      if (req.user.role === 'Admin') {
        where.project = { createdById: req.user.id };
      } else {
        where.assignedToId = req.user.id;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } }
      }
    });

    const formattedTasks = tasks.map(t => ({
      ...t,
      _id: t.id,
      status: mapStatusToUI(t.status),
      project: t.project ? { ...t.project, _id: t.project.id } : null,
      assignedTo: t.assignedTo ? { ...t.assignedTo, _id: t.assignedTo.id } : null
    }));

    res.json(formattedTasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, description, status, project, assignedTo, dueDate } = req.body;

    const projectExists = await prisma.project.findUnique({ where: { id: project } });
    if (!projectExists) return res.status(404).json({ message: 'Project not found' });

    if (projectExists.createdById !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to add task to this project' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: mapStatusToPrisma(status || 'To Do'),
        projectId: project,
        assignedToId: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    // Emit real-time update
    req.app.get('io').emit('refresh_data', { type: 'TASK_CREATED', projectId: project });

    res.status(201).json({ ...task, _id: task.id, status: mapStatusToUI(task.status) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { error } = updateTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const task = await prisma.task.findUnique({ 
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    let data = {};

    if (req.user.role === 'Admin') {
      if (task.project.createdById !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      
      if (req.body.title) data.title = req.body.title;
      if (req.body.description !== undefined) data.description = req.body.description;
      if (req.body.status) data.status = mapStatusToPrisma(req.body.status);
      if (req.body.assignedTo !== undefined) data.assignedToId = req.body.assignedTo;
      if (req.body.dueDate !== undefined) data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    } else {
      if (task.assignedToId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      if (req.body.status) data.status = mapStatusToPrisma(req.body.status);
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data
    });

    // Emit real-time update
    req.app.get('io').emit('refresh_data', { type: 'TASK_UPDATED', taskId: task.id });

    res.json({ ...updatedTask, _id: updatedTask.id, status: mapStatusToUI(updatedTask.status) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ 
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.project.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await prisma.task.delete({ where: { id: task.id } });

    // Emit real-time update
    req.app.get('io').emit('refresh_data', { type: 'TASK_DELETED', projectId: task.projectId });

    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let where = {};

    if (req.user.role === 'Admin') {
      where.project = { createdById: req.user.id };
    } else {
      where.assignedToId = req.user.id;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = mapStatusToPrisma(status);
    }

    const tasks = await prisma.task.findMany({ where });
    const now = new Date();

    // Calculate last 7 days performance
    const dailyPerformance = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const count = tasks.filter(t => {
        const updatedAt = new Date(t.updatedAt);
        return updatedAt >= d && updatedAt < nextD;
      }).length;

      // Map to a percentage for the chart (heuristic: max 10 tasks = 100%)
      const percentage = Math.min((count / 10) * 100, 100);
      dailyPerformance.push(percentage || 5); // Minimum 5% for visibility
    }

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'ToDo').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed').length,
      performance: dailyPerformance
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboardStats };
