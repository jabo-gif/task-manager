const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Ada Lovelace }
 *               email: { type: string, example: ada@example.com }
 *               password: { type: string, example: StrongPass1! }
 *     responses:
 *       201: { description: Account created, returns a JWT }
 *       409: { description: Email already registered }
 *       422: { description: Validation failed }
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 120 }),
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
  ],
  validate,
  AuthController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns a JWT }
 *       401: { description: Invalid credentials }
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  AuthController.login
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Missing or invalid token }
 */
router.get('/me', requireAuth, AuthController.me);

module.exports = router;
