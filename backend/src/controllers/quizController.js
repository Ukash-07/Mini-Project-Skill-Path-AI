const db = require('../config/database');
const recommendationEngine = require('../services/recommendationEngine');
const learningPathService = require('../services/learningPathService');
const { calculateSkillGap } = require('../services/skillGapService');

exports.getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT q.*, m.title as module_title, m.course_id, c.title as course_title, c.primary_skill_id
       FROM quizzes q
       JOIN modules m ON q.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE q.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const quiz = rows[0];

    // Fetch Questions WITHOUT exposing is_correct
    const [questions] = await db.query(
      `SELECT id, quiz_id, question_text FROM quiz_questions WHERE quiz_id = ?`,
      [id]
    );

    for (const q of questions) {
      const [options] = await db.query(
        `SELECT id, question_id, option_text FROM quiz_options WHERE question_id = ?`,
        [q.id]
      );
      q.options = options;
    }

    quiz.questions = questions;

    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { answers } = req.body; // { question_id: option_id }

    const [quizRows] = await db.query(
      `SELECT q.*, m.course_id, c.primary_skill_id
       FROM quizzes q
       JOIN modules m ON q.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE q.id = ?`,
      [id]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const quiz = quizRows[0];
    const skillId = quiz.primary_skill_id;

    // Fetch correct options
    const [questions] = await db.query(
      `SELECT qq.id as question_id, qq.explanation, qo.id as correct_option_id, qo.option_text as correct_option_text
       FROM quiz_questions qq
       JOIN quiz_options qo ON qq.id = qo.question_id
       WHERE qq.quiz_id = ? AND qo.is_correct = 1`,
      [id]
    );

    let total = questions.length;
    let correctCount = 0;
    const questionBreakdown = [];

    for (const q of questions) {
      const userSelectedId = answers[q.question_id];
      const isCorrect = parseInt(userSelectedId) === parseInt(q.correct_option_id);
      if (isCorrect) correctCount++;

      questionBreakdown.push({
        question_id: q.question_id,
        is_correct: isCorrect,
        user_selected_id: userSelectedId || null,
        correct_option_id: q.correct_option_id,
        correct_option_text: q.correct_option_text,
        explanation: q.explanation
      });
    }

    const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = scorePercentage >= (quiz.pass_threshold || 60);

    // Save Quiz Attempt
    await db.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score_percentage, passed)
       VALUES (?, ?, ?, ?)`,
      [userId, id, scorePercentage, passed ? 1 : 0]
    );

    // Update Skill Level based on score
    let calculatedLevel = scorePercentage >= 70 ? 'Advanced' : scorePercentage >= 40 ? 'Intermediate' : 'Beginner';

    if (skillId) {
      await db.query(
        `INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE proficiency_level = ?, status = ?, last_assessed_at = NOW()`,
        [userId, skillId, scorePercentage, calculatedLevel, scorePercentage, calculatedLevel]
      );
    }

    // Trigger Recommendation & Path Recalculation
    await recommendationEngine.generateRecommendations(userId);
    await learningPathService.generateLearningPath(userId);

    res.json({
      success: true,
      data: {
        score_percentage: scorePercentage,
        passed,
        pass_threshold: quiz.pass_threshold,
        calculated_level: calculatedLevel,
        total_questions: total,
        correct_count: correctCount,
        breakdown: questionBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};
