const Question = require('../models/Question');
const Interview = require('../models/Interview');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    let query = {};

    if (req.query.interview) {
      query.interview = req.query.interview;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const questions = await Question.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res) => {
  try {
    const { text, type, difficulty, category, options, expectedAnswer, interview, timeLimit, tags } = req.body;

    // Verify interview exists if provided
    if (interview) {
      const interviewExists = await Interview.findById(interview);
      if (!interviewExists) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }
    }

    const question = await Question.create({
      text,
      type,
      difficulty: difficulty || 'medium',
      category,
      options,
      expectedAnswer,
      createdBy: req.user.id,
      interview,
      timeLimit,
      tags
    });

    // Add question to interview if provided
    if (interview) {
      await Interview.findByIdAndUpdate(interview, {
        $push: { questions: question._id }
      });
    }

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = async (req, res) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (req.user.role !== 'admin' && question.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }

    question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (req.user.role !== 'admin' && question.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    // Remove question from interview
    if (question.interview) {
      await Interview.findByIdAndUpdate(question.interview, {
        $pull: { questions: question._id }
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate AI questions
// @route   POST /api/questions/generate
// @access  Private
exports.generateAIQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count, type } = req.body;

    // Mock AI question generation
    // In production, this would use OpenAI API
    const aiQuestions = generateMockQuestions(topic, difficulty, count, type);

    const createdQuestions = await Promise.all(
      aiQuestions.map(async (q) => {
        return await Question.create({
          text: q.text,
          type: type || 'open_ended',
          difficulty: difficulty || 'medium',
          category: topic,
          options: q.options,
          expectedAnswer: q.expectedAnswer,
          aiGenerated: true,
          createdBy: req.user.id,
          tags: [topic]
        });
      })
    );

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      data: createdQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mock AI question generator (in production, use OpenAI API)
function generateMockQuestions(topic, difficulty, count, type) {
  const questions = [];
  const difficultyMap = {
    easy: ['basic', 'fundamental', 'simple', 'introduction to'],
    medium: ['intermediate', 'practical', 'common scenarios', 'best practices'],
    hard: ['advanced', 'complex', 'edge cases', 'performance optimization']
  };

  const difficultyWords = difficultyMap[difficulty] || difficultyMap.medium;

  for (let i = 0; i < count; i++) {
    const question = {
      text: `${difficultyWords[Math.floor(Math.random() * difficultyWords.length)]} question about ${topic} - Example question ${i + 1}?`,
      type: type || 'open_ended',
      options: type === 'multiple_choice' ? [
        { text: 'Option A', isCorrect: i === 0 },
        { text: 'Option B', isCorrect: i === 1 },
        { text: 'Option C', isCorrect: i === 2 },
        { text: 'Option D', isCorrect: i === 3 }
      ] : undefined,
      expectedAnswer: `Expected answer for ${topic} question ${i + 1}`
    };
    questions.push(question);
  }

  return questions;
}

// @desc    Generate questions with OpenAI
// @route   POST /api/questions/generate-ai
// @access  Private (Admin)
exports.generateQuestionsWithAI = async (req, res) => {
  try {
    const { topic, difficulty, count, type } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock questions if no API key
      return exports.generateAIQuestions(req, res);
    }

    // Implement actual OpenAI integration here
    // This is a placeholder for OpenAI integration
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Generate ${count} ${difficulty} interview questions about ${topic}.
    Format each question as JSON with the following structure:
    {
      "text": "question text",
      "type": "${type}",
      "expectedAnswer": "brief expected answer",
      "options": [...] // if multiple_choice
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    // Parse and save questions
    const generatedContent = completion.choices[0].message.content;
    
    res.status(201).json({
      success: true,
      message: 'Questions generated successfully (OpenAI integration)',
      rawContent: generatedContent
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    // Fallback to mock questions
    exports.generateAIQuestions(req, res);
  }
};