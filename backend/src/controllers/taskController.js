const TaskModel = require('../models/taskModel');

const TaskController = {
  async list(req, res, next) {
    try {
      const { status, priority, search, page, limit } = req.query;
      const result = await TaskModel.findAll(req.user.id, {
        status,
        priority,
        search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const task = await TaskModel.findById(req.params.id, req.user.id);
      if (!task) return res.status(404).json({ message: 'Task not found.' });
      return res.json({ data: task });
    } catch (err) {
      return next(err);
    }
  },

  async create(req, res, next) {
    try {
      const task = await TaskModel.create(req.user.id, req.body);
      return res.status(201).json({ data: task });
    } catch (err) {
      return next(err);
    }
  },

  async update(req, res, next) {
    try {
      const task = await TaskModel.update(req.params.id, req.user.id, req.body);
      if (!task) return res.status(404).json({ message: 'Task not found.' });
      return res.json({ data: task });
    } catch (err) {
      return next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await TaskModel.remove(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ message: 'Task not found.' });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = TaskController;
