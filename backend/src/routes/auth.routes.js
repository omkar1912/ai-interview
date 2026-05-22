const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Please provide a password')
], login);

router.get('/me', auth, getMe);

module.exports = router;