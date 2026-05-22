const express = require('express');
const { 
  createInterview, 
  getInterviews, 
  getInterview, 
  updateInterview, 
  deleteInterview 
} = require('../controllers/interview.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.route('/')
  .get(auth, getInterviews)
  .post(auth, authorize('admin'), createInterview);

router.route('/:id')
  .get(auth, getInterview)
  .put(auth, authorize('admin'), updateInterview)
  .delete(auth, authorize('admin'), deleteInterview);

module.exports = router;