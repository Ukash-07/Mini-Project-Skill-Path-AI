const db = require('../config/database');
const { calculateCareerRecommendations } = require('../services/careerRecommendationService');
const { calculateSkillGap } = require('../services/skillGapService');
const learningPathService = require('../services/learningPathService');

// List all 23 career roles (Role Explorer)
exports.getCareers = async (req, res, next) => {
  try {
    const { domain, difficulty, search } = req.query;
    let query = `SELECT * FROM careers WHERE 1=1`;
    const params = [];

    if (domain && domain !== 'All') {
      query += ` AND domain = ?`;
      params.push(domain);
    }
    if (difficulty && difficulty !== 'All') {
      query += ` AND difficulty = ?`;
      params.push(difficulty);
    }
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ? OR category LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY domain ASC, name ASC`;
    const [careers] = await db.query(query, params);

    // If user is authenticated, also calculate their compatibility score for each role
    let userCompatibilityMap = {};
    if (req.user && req.user.id) {
      const recs = await calculateCareerRecommendations(req.user.id);
      recs.forEach(r => {
        userCompatibilityMap[r.role_id] = r.compatibility_score;
      });
    }

    const enhanced = careers.map(c => {
      let sampleProjects = [];
      try {
        sampleProjects = c.sample_projects ? JSON.parse(c.sample_projects) : [];
      } catch (e) {
        sampleProjects = [];
      }
      return {
        ...c,
        sample_projects: sampleProjects,
        compatibility_score: userCompatibilityMap[c.id] || null
      };
    });

    res.json({ success: true, data: enhanced });
  } catch (err) {
    next(err);
  }
};

// Get single career role details by ID
exports.getCareerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`SELECT * FROM careers WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Career role not found.' });
    }

    const career = rows[0];

    // Get required skills for this role
    const [skills] = await db.query(
      `SELECT cs.*, s.name as skill_name, s.category, s.difficulty, s.description
       FROM career_skills cs
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.career_id = ?
       ORDER BY cs.phase_order ASC, cs.importance_weight DESC`,
      [id]
    );

    let sampleProjects = [];
    try {
      sampleProjects = career.sample_projects ? JSON.parse(career.sample_projects) : [];
    } catch (e) {
      sampleProjects = [];
    }

    let userGapInfo = null;
    let compatibilityScore = null;
    if (req.user && req.user.id) {
      userGapInfo = await calculateSkillGap(req.user.id, id);
      const recs = await calculateCareerRecommendations(req.user.id);
      const matchedRec = recs.find(r => r.role_id === parseInt(id));
      if (matchedRec) compatibilityScore = matchedRec.compatibility_score;
    }

    res.json({
      success: true,
      data: {
        ...career,
        sample_projects: sampleProjects,
        required_skills: skills,
        user_compatibility_score: compatibilityScore,
        skill_gap_summary: userGapInfo
      }
    });
  } catch (err) {
    next(err);
  }
};

// AI-Based Career Role Recommendations for logged in student
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recommendations = await calculateCareerRecommendations(userId);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
};

// Detailed Skill Gap Diagnostics for a specific role or active role
exports.getSkillGap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const careerId = req.params.id ? parseInt(req.params.id) : null;
    const gapData = await calculateSkillGap(userId, careerId);
    res.json({ success: true, data: gapData });
  } catch (err) {
    next(err);
  }
};

// 5-Phase Personalized Learning Roadmap for a specific role or active role
exports.getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const careerId = req.params.id ? parseInt(req.params.id) : null;
    const roadmap = await learningPathService.getRoadmap(userId, careerId);
    res.json({ success: true, data: roadmap });
  } catch (err) {
    next(err);
  }
};
