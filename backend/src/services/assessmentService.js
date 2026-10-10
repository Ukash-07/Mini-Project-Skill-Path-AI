const db = require('../config/database');
const { PROFICIENCY_LEVELS } = require('../config/recommendationConfig');
const recommendationEngine = require('./recommendationEngine');
const learningPathService = require('./learningPathService');

class AssessmentService {
  /**
   * Calculates proficiency level string based on score percentage
   */
  calculateProficiencyLevel(percentage) {
    if (percentage >= PROFICIENCY_LEVELS.ADVANCED.min) return 'Advanced';
    if (percentage >= PROFICIENCY_LEVELS.INTERMEDIATE.min) return 'Intermediate';
    return 'Beginner';
  }

  /**
   * Grades student's submitted assessment answers, updates skill profile, and triggers engine recalculation
   */
  async submitAssessment(userId, assessmentId, userAnswers) {
    // userAnswers format: { question_id: selected_option_id }

    // 1. Fetch Assessment Questions & Correct Options
    const [questionRows] = await db.query(
      `SELECT aq.id as question_id, aq.skill_id, aq.difficulty, aq.marks, aq.question_text, aq.explanation,
              ao.id as correct_option_id, ao.option_text as correct_option_text, s.name as skill_name
       FROM assessment_questions aq
       JOIN assessment_options ao ON aq.id = ao.question_id
       JOIN skills s ON aq.skill_id = s.id
       WHERE aq.assessment_id = ? AND ao.is_correct = 1`,
      [assessmentId]
    );

    if (questionRows.length === 0) {
      throw new Error('Assessment not found or has no questions.');
    }

    let totalMarks = 0;
    let earnedMarks = 0;

    const questionResults = [];
    const skillPerformance = {}; // skill_id -> { total: 0, earned: 0, name: '' }

    for (const q of questionRows) {
      totalMarks += q.marks;

      if (!skillPerformance[q.skill_id]) {
        skillPerformance[q.skill_id] = { total: 0, earned: 0, name: q.skill_name };
      }
      skillPerformance[q.skill_id].total += q.marks;

      const selectedOptionId = userAnswers[q.question_id];
      const isCorrect = parseInt(selectedOptionId) === parseInt(q.correct_option_id);

      if (isCorrect) {
        earnedMarks += q.marks;
        skillPerformance[q.skill_id].earned += q.marks;
      }

      // Fetch all options for result review
      const [options] = await db.query(
        `SELECT id, option_text, is_correct FROM assessment_options WHERE question_id = ?`,
        [q.question_id]
      );

      questionResults.push({
        question_id: q.question_id,
        question_text: q.question_text,
        skill_name: q.skill_name,
        difficulty: q.difficulty,
        marks: q.marks,
        is_correct: isCorrect,
        user_selected_option_id: selectedOptionId || null,
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
        options
      });
    }

    const percentage = Math.round((earnedMarks / totalMarks) * 100);
    const calculatedLevel = this.calculateProficiencyLevel(percentage);

    // 2. Save Assessment Attempt Record
    const [attemptResult] = await db.query(
      `INSERT INTO assessment_attempts (user_id, assessment_id, score_raw, score_percentage, calculated_level)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, assessmentId, earnedMarks, percentage, calculatedLevel]
    );

    // 3. Update Student Skills in MySQL
    const weakTopics = [];
    for (const [skillId, perf] of Object.entries(skillPerformance)) {
      const skillScorePct = Math.round((perf.earned / perf.total) * 100);
      const skillLevel = this.calculateProficiencyLevel(skillScorePct);

      if (skillScorePct < 60) {
        weakTopics.push(perf.name);
      }

      await db.query(
        `INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE proficiency_level = ?, status = ?, last_assessed_at = NOW()`,
        [userId, skillId, skillScorePct, skillLevel, skillScorePct, skillLevel]
      );
    }

    // 4. Trigger Dynamic Recommendation Engine Recalculation
    await recommendationEngine.generateRecommendations(userId);
    await learningPathService.generateLearningPath(userId);

    return {
      attempt_id: attemptResult.insertId,
      score_raw: earnedMarks,
      total_marks: totalMarks,
      percentage,
      calculated_level: calculatedLevel,
      weak_topics: weakTopics,
      question_results: questionResults
    };
  }
}

module.exports = new AssessmentService();
