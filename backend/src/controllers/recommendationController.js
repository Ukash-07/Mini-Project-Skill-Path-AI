const recommendationEngine = require('../services/recommendationEngine');
const db = require('../config/database');

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await recommendationEngine.generateRecommendations(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getNextRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await recommendationEngine.generateRecommendations(userId);
    const topCourse = data.recommendations.length > 0 ? data.recommendations[0] : null;

    res.json({
      success: true,
      data: topCourse
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await recommendationEngine.generateRecommendations(userId);
    res.json({
      success: true,
      message: 'Recommendation engine recalculated successfully.',
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.getExplanation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const [rows] = await db.query(
      `SELECT r.*, c.title as course_title, c.difficulty, c.duration_hours, s.name as primary_skill_name
       FROM recommendations r
       JOIN courses c ON r.course_id = c.id
       JOIN skills s ON c.primary_skill_id = s.id
       WHERE r.user_id = ? AND r.course_id = ?`,
      [userId, courseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Explanation not found for this course.' });
    }

    const rec = rows[0];
    let parsedReasons = [];
    try {
      parsedReasons = JSON.parse(rec.explanation);
    } catch (e) {
      parsedReasons = [rec.explanation];
    }

    res.json({
      success: true,
      data: {
        course_id: rec.course_id,
        course_title: rec.course_title,
        primary_skill: rec.primary_skill_name,
        recommendation_score: parseFloat(rec.recommendation_score),
        breakdown: {
          skill_gap_score: parseFloat(rec.skill_gap_score),
          prerequisite_match_score: parseFloat(rec.prerequisite_match_score),
          relevance_score: parseFloat(rec.relevance_score),
          performance_score: parseFloat(rec.performance_score),
          difficulty_fit_score: parseFloat(rec.difficulty_fit_score)
        },
        reasons: parsedReasons
      }
    });
  } catch (err) {
    next(err);
  }
};
