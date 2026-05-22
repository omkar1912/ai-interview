const express = require('express');
const { 
  submitAnswer, 
  getAnswers, 
  getAnswer, 
  scoreAnswer,
  getInterviewResults 
} = require('../controllers/answer.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.route('/')
  .get(auth, getAnswers)
  .post(auth, submitAnswer);

router.get('/results/:interviewId', auth, getInterviewResults);

router.route('/:id')
  .get(auth, getAnswer);

router.put('/:id/score', auth, authorize('admin'), scoreAnswer);

module.exports = router;