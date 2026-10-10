const db = require('../config/database');

// System Dashboard Analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [students] = await db.query(`SELECT COUNT(*) as total FROM users WHERE role = 'student'`);
    const [courses] = await db.query(`SELECT COUNT(*) as total FROM courses`);
    const [careers] = await db.query(`SELECT COUNT(*) as total FROM careers`);
    const [skills] = await db.query(`SELECT COUNT(*) as total FROM skills`);
    const [assessments] = await db.query(`SELECT COUNT(*) as total FROM assessment_attempts`);
    const [completions] = await db.query(`SELECT COUNT(*) as total FROM enrollments WHERE status = 'completed'`);

    // Popular Courses
    const [popularCourses] = await db.query(
      `SELECT c.title, COUNT(e.id) as enrollments
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       GROUP BY c.id
       ORDER BY enrollments DESC LIMIT 5`
    );

    // Common Skill Gaps
    const [skillGaps] = await db.query(
      `SELECT s.name as skill_name, AVG(ss.proficiency_level) as avg_level, COUNT(ss.user_id) as student_count
       FROM skills s
       LEFT JOIN student_skills ss ON s.id = ss.skill_id
       GROUP BY s.id
       ORDER BY avg_level ASC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        total_students: students[0].total,
        total_courses: courses[0].total,
        total_careers: careers[0].total,
        total_skills: skills[0].total,
        assessments_completed: assessments[0].total,
        courses_completed: completions[0].total,
        popular_courses: popularCourses,
        common_skill_gaps: skillGaps
      }
    });
  } catch (err) {
    next(err);
  }
};

// CRUD: Students
exports.getStudents = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.created_at, sp.education_level, sp.experience_level, c.name as target_career
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN careers c ON sp.target_career_id = c.id
       WHERE u.role = 'student'
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// CRUD: Careers
exports.createCareer = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    const [result] = await db.query(
      `INSERT INTO careers (name, description, category) VALUES (?, ?, ?)`,
      [name, description, category || 'Technology']
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name, description, category } });
  } catch (err) {
    next(err);
  }
};

exports.updateCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;
    await db.query(
      `UPDATE careers SET name = ?, description = ?, category = ? WHERE id = ?`,
      [name, description, category, id]
    );
    res.json({ success: true, message: 'Career updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM careers WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Career deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// CRUD: Skills
exports.createSkill = async (req, res, next) => {
  try {
    const { name, description, category, difficulty } = req.body;
    const [result] = await db.query(
      `INSERT INTO skills (name, description, category, difficulty) VALUES (?, ?, ?, ?)`,
      [name, description, category, difficulty || 'Beginner']
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name, description, category, difficulty } });
  } catch (err) {
    next(err);
  }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, difficulty } = req.body;
    await db.query(
      `UPDATE skills SET name = ?, description = ?, category = ?, difficulty = ? WHERE id = ?`,
      [name, description, category, difficulty, id]
    );
    res.json({ success: true, message: 'Skill updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM skills WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Skill deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// CRUD: Courses
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, primary_skill_id, difficulty, duration_hours, category, thumbnail_url } = req.body;
    const [result] = await db.query(
      `INSERT INTO courses (title, description, primary_skill_id, difficulty, duration_hours, category, thumbnail_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, primary_skill_id, difficulty || 'Beginner', duration_hours || 5.0, category || 'General', thumbnail_url || '']
    );
    res.status(201).json({ success: true, data: { id: result.insertId, title } });
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, primary_skill_id, difficulty, duration_hours, category, thumbnail_url } = req.body;
    await db.query(
      `UPDATE courses SET title = ?, description = ?, primary_skill_id = ?, difficulty = ?, duration_hours = ?, category = ?, thumbnail_url = ? WHERE id = ?`,
      [title, description, primary_skill_id, difficulty, duration_hours, category, thumbnail_url, id]
    );
    res.json({ success: true, message: 'Course updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM courses WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// CRUD: Assessments & Questions
exports.createAssessment = async (req, res, next) => {
  try {
    const { title, career_id, skill_id, total_marks, duration_minutes } = req.body;
    const [result] = await db.query(
      `INSERT INTO assessments (title, career_id, skill_id, total_marks, duration_minutes) VALUES (?, ?, ?, ?, ?)`,
      [title, career_id, skill_id, total_marks || 100, duration_minutes || 30]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, title } });
  } catch (err) {
    next(err);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const { assessment_id, skill_id, difficulty, question_text, marks, explanation, options } = req.body;
    const [qRes] = await db.query(
      `INSERT INTO assessment_questions (assessment_id, skill_id, difficulty, question_text, marks, explanation)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [assessment_id, skill_id, difficulty || 'Intermediate', question_text, marks || 10, explanation || '']
    );

    const questionId = qRes.insertId;
    if (Array.isArray(options)) {
      for (const opt of options) {
        await db.query(
          `INSERT INTO assessment_options (question_id, option_text, is_correct) VALUES (?, ?, ?)`,
          [questionId, opt.option_text, opt.is_correct ? 1 : 0]
        );
      }
    }

    res.status(201).json({ success: true, data: { id: questionId } });
  } catch (err) {
    next(err);
  }
};
