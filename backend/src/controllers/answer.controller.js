const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Interview = require('../models/Interview');

// @desc    Submit answer
// @route   POST /api/answers
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const { question, interview, answer, code, language, timeTaken } = req.body;

    // Validate question and interview exist
    const questionExists = await Question.findById(question);
    const interviewExists = await Interview.findById(interview);

    if (!questionExists || !interviewExists) {
      return res.status(404).json({
        success: false,
        message: 'Question or Interview not found'
      });
    }

    // Check if answer already exists
    let existingAnswer = await Answer.findOne({
      user: req.user.id,
      question: question
    });

    if (existingAnswer) {
      // Update existing answer
      existingAnswer.answer = answer;
      existingAnswer.code = code;
      existingAnswer.language = language;
      existingAnswer.timeTaken = timeTaken || existingAnswer.timeTaken;
      existingAnswer.attempts += 1;
      
      await existingAnswer.save();

      return res.json({
        success: true,
        data: existingAnswer,
        message: 'Answer updated successfully'
      });
    }

    // Create new answer
    const newAnswer = await Answer.create({
      user: req.user.id,
      question,
      interview,
      answer,
      code,
      language,
      timeTaken
    });

    res.status(201).json({
      success: true,
      data: newAnswer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's answers
// @route   GET /api/answers
// @access  Private
exports.getAnswers = async (req, res) => {
  try {
    let query = { user: req.user.id };

    if (req.query.interview) {
      query.interview = req.query.interview;
    }

    if (req.query.question) {
      query.question = req.query.question;
    }

    const answers = await Answer.find(query)
      .populate('question', 'text type difficulty')
      .populate('interview', 'title category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: answers.length,
      data: answers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single answer
// @route   GET /api/answers/:id
// @access  Private
exports.getAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('question')
      .populate('interview', 'title category')
      .populate('user', 'name email');

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user owns this answer or is admin
    if (req.user.role !== 'admin' && answer.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this answer'
      });
    }

    res.json({
      success: true,
      data: answer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update answer score and feedback
// @route   PUT /api/answers/:id/score
// @access  Private (Admin)
exports.scoreAnswer = async (req, res) => {
  try {
    const { score, feedback } = req.body;

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    answer.score = score;
    answer.feedback = feedback;

    await answer.save();

    res.json({
      success: true,
      data: answer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get interview results for user
// @route   GET /api/answers/results/:interviewId
// @access  Private
exports.getInterviewResults = async (req, res) => {
  try {
    const interviewId = req.params.interviewId;
    const userId = req.user.id;

    const answers = await Answer.find({
      user: userId,
      interview: interviewId
    }).populate('question', 'text type difficulty');

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Calculate statistics
    const totalQuestions = interview.questions.length;
    const answeredQuestions = answers.length;
    const scoredAnswers = answers.filter(a => a.score !== null);
    const averageScore = scoredAnswers.length > 0
      ? scoredAnswers.reduce((sum, a) => sum + a.score, 0) / scoredAnswers.length
      : 0;

    res.json({
      success: true,
      data: {
        interview: {
          id: interview._id,
          title: interview.title,
          category: interview.category
        },
        statistics: {
          totalQuestions,
          answeredQuestions,
          averageScore: Math.round(averageScore * 100) / 100,
          completionRate: Math.round((answeredQuestions / totalQuestions) * 100)
        },
        answers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};