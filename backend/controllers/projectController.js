const prisma = require('../lib/prisma');
const Joi = require('joi');

const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  members: Joi.array().items(Joi.string()).optional()
});

const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await prisma.project.findMany({
        where: { createdById: req.user.id },
        include: { members: { select: { id: true, name: true, email: true } } }
      });
    } else {
      projects = await prisma.project.findMany({
        where: { members: { some: { id: req.user.id } } },
        include: { 
          members: { select: { id: true, name: true, email: true } },
          createdBy: { select: { name: true } }
        }
      });
    }
    // Add _id for frontend compatibility
    const formattedProjects = projects.map(p => ({ ...p, _id: p.id, members: p.members.map(m => ({...m, _id: m.id})) }));
    res.json(formattedProjects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { 
        members: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.members.some(m => m.id === req.user.id)) {
       return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json({ ...project, _id: project.id, members: project.members.map(m => ({...m, _id: m.id})) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, description, members } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        createdById: req.user.id,
        members: {
          connect: (members || []).map(id => ({ id }))
        }
      }
    });

    // Emit real-time update
    req.app.get('io').emit('refresh_data', { type: 'PROJECT_CREATED', projectId: project.id });

    res.status(201).json({ ...project, _id: project.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdById !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { title, description, members } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        members: {
          set: (members || []).map(id => ({ id })) // Overwrite members
        }
      },
      include: { members: { select: { id: true, name: true, email: true } } }
    });

    // Emit real-time update
    req.app.get('io').emit('refresh_data', { type: 'PROJECT_UPDATED', projectId: project.id });

    res.json({ ...updatedProject, _id: updatedProject.id, members: updatedProject.members.map(m => ({...m, _id: m.id})) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdById !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Prisma Cascade delete or manual delete of tasks
    await prisma.task.deleteMany({ where: { projectId: project.id } });
    await prisma.project.delete({ where: { id: project.id } });

    // Emit real-time update
    req.app.get('io').emit('refresh_data', { type: 'PROJECT_DELETED', projectId: project.id });

    res.json({ message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
