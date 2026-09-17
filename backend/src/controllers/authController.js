const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

const AuthController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ name, email, passwordHash });
      const token = signToken(user);

      return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      return next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = signToken(user);
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      return next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = AuthController;
