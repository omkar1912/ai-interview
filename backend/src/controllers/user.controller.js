const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const Answer = require('../models/Answer');
    const Interview = require('../models/Interview');

    const totalAnswers = await Answer.countDocuments({ user: req.user.id });
    const interviewsTaken = await Answer.distinct('interview', { user: req.user.id });
    const scoredAnswers = await Answer.find({
      user: req.user.id,
      score: { $ne: null }
    });

    const averageScore = scoredAnswers.length > 0
      ? scoredAnswers.reduce((sum, a) => sum + a.score, 0) / scoredAnswers.length
      : 0;

    res.json({
      success: true,
      data: {
        totalAnswers,
        interviewsTaken: interviewsTaken.length,
        scoredAnswers: scoredAnswers.length,
        averageScore: Math.round(averageScore * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};