const learningPathService = require('../services/learningPathService');

exports.getLearningPath = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const careerId = req.query.careerId ? parseInt(req.query.careerId) : null;
    const data = await learningPathService.getRoadmap(userId, careerId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.generateLearningPath = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const careerId = req.body.careerId ? parseInt(req.body.careerId) : null;
    const data = await learningPathService.getRoadmap(userId, careerId);
    res.json({
      success: true,
      message: 'Learning path generated successfully.',
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleSkillCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.skillId);
    const result = await learningPathService.toggleSkillCompletion(userId, skillId);
    res.json({
      success: true,
      message: result.is_completed ? 'Skill marked as completed!' : 'Skill marked as in-progress.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};
