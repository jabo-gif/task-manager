const express = require('express');
const { body, param, query } = require('express-validator');
const TaskController = require('../controllers/taskController');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const STATUS_VALUES = ['Pending', 'Completed'];
const PRIORITY_VALUES = ['Low', 'Medium', 'High'];

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List tasks (filter by status/priority, search, paginate)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [Low, Medium, High] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches against title and description
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: A page of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Task' } }
 *                 pagination: { type: object }
 */
router.get(
  '/',
  [
    query('status').optional().isIn(STATUS_VALUES),
    query('priority').optional().isIn(PRIORITY_VALUES),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  TaskController.list
);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: The task }
 *       404: { description: Task not found }
 */
router.get('/:id', [param('id').isInt()], validate, TaskController.getOne);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskInput' }
 *     responses:
 *       201: { description: Task created }
 *       422: { description: Validation failed }
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('status').optional().isIn(STATUS_VALUES),
    body('priority').optional().isIn(PRIORITY_VALUES),
  ],
  validate,
  TaskController.create
);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskInput' }
 *     responses:
 *       200: { description: Task updated }
 *       404: { description: Task not found }
 *       422: { description: Validation failed }
 */
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty().isLength({ max: 150 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('status').optional().isIn(STATUS_VALUES),
    body('priority').optional().isIn(PRIORITY_VALUES),
  ],
  validate,
  TaskController.update
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Task deleted }
 *       404: { description: Task not found }
 */
router.delete('/:id', [param('id').isInt()], validate, TaskController.remove);

module.exports = router;
