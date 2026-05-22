const express = require('express');
const { 
  getDashboardStats, 
  getAllUsers, 
  updateUserStatus, 
  updateUserRole,
  getAllAnswers 
} = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/answers', getAllAnswers);

module.exports = router;