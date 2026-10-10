const db = require('../config/database');
const assessmentService = require('../services/assessmentService');

exports.getAssessments = async (req, res, next) => {
  try {
    const { career_id, skill_id } = req.query;
    let query = `
      SELECT a.*, c.name as career_name, s.name as skill_name,
             (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.id) as total_questions
      FROM assessments a
      LEFT JOIN careers c ON a.career_id = c.id
      LEFT JOIN skills s ON a.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (career_id) {
      query += ` AND a.career_id = ?`;
      params.push(career_id);
    }
    if (skill_id) {
      query += ` AND a.skill_id = ?`;
      params.push(skill_id);
    }

    const [assessments] = await db.query(query, params);
    res.json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
};

exports.getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT a.*, c.name as career_name, s.name as skill_name
       FROM assessments a
       LEFT JOIN careers c ON a.career_id = c.id
       LEFT JOIN skills s ON a.skill_id = s.id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    const assessment = rows[0];

    // Fetch Questions WITHOUT exposing is_correct (Requirement #12)
    const [questions] = await db.query(
      `SELECT id, assessment_id, skill_id, difficulty, question_text, marks
       FROM assessment_questions
       WHERE assessment_id = ?`,
      [id]
    );

    for (const q of questions) {
      const [options] = await db.query(
        `SELECT id, question_id, option_text FROM assessment_options WHERE question_id = ?`,
        [q.id]
      );
      q.options = options;
    }

    assessment.questions = questions;

    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
};

exports.submitAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { answers } = req.body; // { question_id: selected_option_id }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid or missing answers object.' });
    }

    const result = await assessmentService.submitAssessment(userId, id, answers);

    res.json({
      success: true,
      message: 'Assessment submitted successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT aa.*, a.title as assessment_title, c.name as career_name
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       LEFT JOIN careers c ON a.career_id = c.id
       WHERE aa.user_id = ?
       ORDER BY aa.attempted_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
