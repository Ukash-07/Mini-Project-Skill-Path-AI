const db = require('../config/database');
const recommendationEngine = require('../services/recommendationEngine');

exports.getCourses = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = `
      SELECT c.*, s.name as primary_skill_name
      FROM courses c
      JOIN skills s ON c.primary_skill_id = s.id
      WHERE c.status = 'published'
    `;
    const params = [];

    if (category) {
      query += ` AND c.category = ?`;
      params.push(category);
    }
    if (difficulty) {
      query += ` AND c.difficulty = ?`;
      params.push(difficulty);
    }
    if (search) {
      query += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.rating DESC`;

    const [courses] = await db.query(query, params);
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const [rows] = await db.query(
      `SELECT c.*, s.name as primary_skill_name
       FROM courses c
       JOIN skills s ON c.primary_skill_id = s.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const course = rows[0];

    // Modules & Lessons
    const [modules] = await db.query(
      `SELECT * FROM modules WHERE course_id = ? ORDER BY module_order ASC`,
      [id]
    );

    for (const mod of modules) {
      const [lessons] = await db.query(
        `SELECT id, title, video_url, duration_minutes, lesson_order FROM lessons WHERE module_id = ? ORDER BY lesson_order ASC`,
        [mod.id]
      );

      const [quizzes] = await db.query(
        `SELECT id, title, pass_threshold FROM quizzes WHERE module_id = ?`,
        [mod.id]
      );

      mod.lessons = lessons;
      mod.quiz = quizzes[0] || null;
    }

    // Prerequisites
    const [prereqs] = await db.query(
      `SELECT cp.*, cr.title as required_course_title, s.name as required_skill_name
       FROM course_prerequisites cp
       LEFT JOIN courses cr ON cp.required_course_id = cr.id
       LEFT JOIN skills s ON cp.required_skill_id = s.id
       WHERE cp.course_id = ?`,
      [id]
    );

    // Enrollment & Progress Status
    let enrollment = null;
    let progress = null;
    let completedLessonIds = [];

    if (userId) {
      const [enrRows] = await db.query(`SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`, [userId, id]);
      enrollment = enrRows[0] || null;

      const [progRows] = await db.query(`SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?`, [userId, id]);
      progress = progRows[0] || null;

      const [lesRows] = await db.query(
        `SELECT lp.lesson_id
         FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         WHERE lp.user_id = ? AND m.course_id = ?`,
        [userId, id]
      );
      completedLessonIds = lesRows.map(l => l.lesson_id);
    }

    res.json({
      success: true,
      data: {
        ...course,
        modules,
        prerequisites: prereqs,
        enrollment,
        progress,
        completed_lesson_ids: completedLessonIds
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.enrollCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query(
      `INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, 'active')
       ON DUPLICATE KEY UPDATE status = 'active'`,
      [userId, id]
    );

    await db.query(
      `INSERT INTO course_progress (user_id, course_id, progress_percentage) VALUES (?, ?, 0.00)
       ON DUPLICATE KEY UPDATE progress_percentage = progress_percentage`,
      [userId, id]
    );

    res.json({ success: true, message: 'Enrolled in course successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.completeLesson = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    // Fetch module & course info for the lesson
    const [lessonRows] = await db.query(
      `SELECT l.id, m.course_id
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = ?`,
      [lessonId]
    );

    if (lessonRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    const courseId = lessonRows[0].course_id;

    // Record lesson completion
    await db.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed) VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE completed = 1`,
      [userId, lessonId]
    );

    // Calculate total & completed lessons in course
    const [totalRows] = await db.query(
      `SELECT COUNT(l.id) as total
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = ?`,
      [courseId]
    );

    const [doneRows] = await db.query(
      `SELECT COUNT(lp.lesson_id) as done
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE lp.user_id = ? AND m.course_id = ? AND lp.completed = 1`,
      [userId, courseId]
    );

    const total = totalRows[0].total || 1;
    const done = doneRows[0].done || 0;
    const progressPct = Math.round((done / total) * 100);
    const isCourseCompleted = progressPct >= 100;

    await db.query(
      `INSERT INTO course_progress (user_id, course_id, progress_percentage, completed, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         progress_percentage = VALUES(progress_percentage),
         completed = VALUES(completed),
         completed_at = VALUES(completed_at)`,
      [userId, courseId, progressPct, isCourseCompleted ? 1 : 0, isCourseCompleted ? new Date() : null]
    );

    if (isCourseCompleted) {
      await db.query(
        `UPDATE enrollments SET status = 'completed' WHERE user_id = ? AND course_id = ?`,
        [userId, courseId]
      );
      // Trigger Engine Recalculation
      await recommendationEngine.generateRecommendations(userId);
    }

    res.json({
      success: true,
      data: {
        lesson_id: lessonId,
        course_id: courseId,
        progress_percentage: progressPct,
        completed: isCourseCompleted
      }
    });
  } catch (err) {
    next(err);
  }
};
