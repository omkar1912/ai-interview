const express = require('express');
const { 
  getQuestions, 
  getQuestion, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  generateAIQuestions,
  generateQuestionsWithAI
} = require('../controllers/question.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.route('/')
  .get(auth, getQuestions)
  .post(auth, authorize('admin'), createQuestion);

router.post('/generate', auth, generateAIQuestions);
router.post('/generate-ai', auth, authorize('admin'), generateQuestionsWithAI);

router.route('/:id')
  .get(auth, getQuestion)
  .put(auth, authorize('admin'), updateQuestion)
  .delete(auth, authorize('admin'), deleteQuestion);

module.exports = router;