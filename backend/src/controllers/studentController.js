const db = require('../config/database');
const { calculateCareerRecommendations } = require('../services/careerRecommendationService');
const { calculateSkillGap } = require('../services/skillGapService');
const learningPathService = require('../services/learningPathService');

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT sp.*, u.full_name, u.email, c.name as target_career_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN careers c ON sp.target_career_id = c.id
       WHERE sp.user_id = ?`,
      [userId]
    );

    const [prefRows] = await db.query(`SELECT * FROM student_preferences WHERE user_id = ?`, [userId]);

    let profile = rows[0] || null;
    if (profile && profile.interests) {
      try {
        profile.interests = JSON.parse(profile.interests);
      } catch (e) {
        profile.interests = [];
      }
    }

    res.json({
      success: true,
      data: {
        profile,
        preferences: prefRows[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      education_level,
      current_qualification,
      experience_level,
      target_career_id,
      interests,
      preferred_learning_style,
      weekly_learning_hours,
      daily_learning_time_min,
      preferred_difficulty,
      preferred_format,
      target_completion_weeks
    } = req.body;

    const interestsJson = Array.isArray(interests) ? JSON.stringify(interests) : (interests || '[]');

    await db.query(
      `INSERT INTO student_profiles (user_id, education_level, current_qualification, experience_level, target_career_id, interests, preferred_learning_style, weekly_learning_hours, onboarding_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         education_level = COALESCE(VALUES(education_level), education_level),
         current_qualification = COALESCE(VALUES(current_qualification), current_qualification),
         experience_level = COALESCE(VALUES(experience_level), experience_level),
         target_career_id = COALESCE(VALUES(target_career_id), target_career_id),
         interests = COALESCE(VALUES(interests), interests),
         preferred_learning_style = COALESCE(VALUES(preferred_learning_style), preferred_learning_style),
         weekly_learning_hours = COALESCE(VALUES(weekly_learning_hours), weekly_learning_hours),
         onboarding_completed = 1`,
      [
        userId,
        education_level,
        current_qualification,
        experience_level,
        target_career_id,
        interestsJson,
        preferred_learning_style || 'Interactive Courses',
        weekly_learning_hours || 10
      ]
    );

    await db.query(
      `INSERT INTO student_preferences (user_id, daily_learning_time_min, preferred_difficulty, preferred_format, target_completion_weeks)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         daily_learning_time_min = COALESCE(VALUES(daily_learning_time_min), daily_learning_time_min),
         preferred_difficulty = COALESCE(VALUES(preferred_difficulty), preferred_difficulty),
         preferred_format = COALESCE(VALUES(preferred_format), preferred_format),
         target_completion_weeks = COALESCE(VALUES(target_completion_weeks), target_completion_weeks)`,
      [userId, daily_learning_time_min || 60, preferred_difficulty || 'Beginner', preferred_format || 'Interactive', target_completion_weeks || 12]
    );

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getSkills = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT ss.*, s.name as skill_name, s.category, s.difficulty, s.is_custom
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.user_id = ?
       ORDER BY ss.proficiency_level DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.updateSkills = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body; // Array of { skill_id, proficiency_level, status }

    if (Array.isArray(skills)) {
      for (const sk of skills) {
        let level = parseFloat(sk.proficiency_level) || 0;
        let status = sk.status || (level >= 70 ? 'Advanced' : level >= 40 ? 'Intermediate' : 'Beginner');

        await db.query(
          `INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level), status = VALUES(status), last_assessed_at = NOW()`,
          [userId, sk.skill_id, level, status]
        );
      }
    }

    res.json({ success: true, message: 'Student skills updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.addCustomSkill = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, category, proficiency_level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    const level = parseFloat(proficiency_level) || 50;
    const status = level >= 70 ? 'Advanced' : level >= 40 ? 'Intermediate' : 'Beginner';
    const cat = category || 'Custom Skill';

    // Insert into skills table
    const [result] = await db.query(
      `INSERT INTO skills (name, description, category, difficulty, is_custom, created_by_user_id)
       VALUES (?, 'Custom skill added by student.', ?, 'Intermediate', 1, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);`,
      [name.trim(), cat, userId]
    );

    const skillId = result.insertId;

    // Attach to student skills
    await db.query(
      `INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level), status = VALUES(status)`,
      [userId, skillId, level, status]
    );

    res.json({
      success: true,
      message: 'Custom skill created and added to your profile!',
      data: { skill_id: skillId, name: name.trim(), proficiency_level: level, status }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get Target Career
    const [profileRows] = await db.query(
      `SELECT sp.target_career_id, c.name as target_career_name
       FROM student_profiles sp
       LEFT JOIN careers c ON sp.target_career_id = c.id
       WHERE sp.user_id = ?`,
      [userId]
    );
    const careerId = (profileRows[0] && profileRows[0].target_career_id) || 2;
    const careerName = (profileRows[0] && profileRows[0].target_career_name) || 'Backend Developer';

    // Skill Gap & Roadmap Info
    const gapInfo = await calculateSkillGap(userId, careerId);
    const roadmap = await learningPathService.getRoadmap(userId, careerId);

    // Completed Projects Count
    const [projRows] = await db.query(
      `SELECT COUNT(*) as count FROM student_projects WHERE user_id = ? AND status = 'completed'`,
      [userId]
    );

    // Total skills in student profile
    const [allStudentSkills] = await db.query(
      `SELECT COUNT(*) as total, SUM(CASE WHEN proficiency_level >= 70 THEN 1 ELSE 0 END) as mastered
       FROM student_skills WHERE user_id = ?`,
      [userId]
    );

    const weeklyProgressData = [
      { day: 'Mon', hours: 1.5, completedTopics: 2 },
      { day: 'Tue', hours: 2.0, completedTopics: 3 },
      { day: 'Wed', hours: 1.0, completedTopics: 1 },
      { day: 'Thu', hours: 2.5, completedTopics: 4 },
      { day: 'Fri', hours: 2.0, completedTopics: 2 },
      { day: 'Sat', hours: 3.0, completedTopics: 5 },
      { day: 'Sun', hours: 2.0, completedTopics: 3 }
    ];

    res.json({
      success: true,
      data: {
        target_career_id: careerId,
        target_career_name: careerName,
        readiness_score: gapInfo.readinessScore || 0,
        overall_progress: roadmap.overall_progress || 0,
        skills_mastered: gapInfo.masteredSkills.length,
        skills_partial: gapInfo.partialSkills.length,
        skills_missing: gapInfo.missingSkills.length,
        skills_learned: (allStudentSkills[0] && allStudentSkills[0].mastered) || 0,
        skills_remaining: gapInfo.missingSkills.length + gapInfo.partialSkills.length,
        total_skills_count: (allStudentSkills[0] && allStudentSkills[0].total) || 0,
        completed_projects: (projRows[0] && projRows[0].count) || 0,
        current_streak: 6,
        current_level: gapInfo.readinessScore >= 80 ? 'Job-Ready Candidate' : gapInfo.readinessScore >= 50 ? 'Intermediate Learner' : 'Foundational Learner',
        weekly_progress: weeklyProgressData
      }
    });
  } catch (err) {
    next(err);
  }
};
