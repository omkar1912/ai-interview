const Interview = require('../models/Interview');
const Question = require('../models/Question');

// @desc    Create new interview
// @route   POST /api/interviews
// @access  Private (Admin)
exports.createInterview = async (req, res) => {
  try {
    const { title, description, type, difficulty, category, maxDuration, isPublic } = req.body;

    const interview = await Interview.create({
      title,
      description,
      type,
      difficulty: difficulty || 'medium',
      category,
      createdBy: req.user.id,
      maxDuration,
      isPublic: isPublic || false
    });

    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Public (with some filters for private)
exports.getInterviews = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show public interviews or their own
    if (!req.user || req.user.role !== 'admin') {
      query = { $or: [{ isPublic: true }, { createdBy: req.user?.id }] };
    }

    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Add difficulty filter if provided
    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }

    // Add type filter if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    const interviews = await Interview.find(query)
      .populate('createdBy', 'name email')
      .populate('questions', 'text type difficulty')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Public (with checks)
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user can access this interview
    if (!interview.isPublic && 
        (!req.user || (req.user.role !== 'admin' && interview.createdBy._id.toString() !== req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this interview'
      });
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private (Admin)
exports.updateInterview = async (req, res) => {
  try {
    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && interview.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this interview'
      });
    }

    interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('questions');

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private (Admin)
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (req.user.role !== 'admin' && interview.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this interview'
      });
    }

    // Delete associated questions
    await Question.deleteMany({ interview: req.params.id });
    
    await Interview.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};