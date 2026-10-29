const db = require('../config/database');

exports.getResources = async (req, res, next) => {
  try {
    let { careerId, career_id, skillId, type, difficulty, search } = req.query;
    careerId = careerId || career_id;

    // If careerId not provided in query, look up student's selected target career
    if (!careerId && req.user && req.user.id) {
      const [profiles] = await db.query(
        `SELECT target_career_id FROM student_profiles WHERE user_id = ?`,
        [req.user.id]
      );
      if (profiles.length > 0 && profiles[0].target_career_id) {
        careerId = profiles[0].target_career_id;
      }
    }

    // If still no careerId, fallback to the first career role in DB
    if (!careerId) {
      const [firstCareer] = await db.query(`SELECT id FROM careers ORDER BY id ASC LIMIT 1`);
      if (firstCareer.length > 0) {
        careerId = firstCareer[0].id;
      }
    }

    // Get details of selected career
    let selectedCareer = null;
    if (careerId) {
      const [careerRows] = await db.query(
        `SELECT id, name, domain, category, description, difficulty, estimated_prep_months
         FROM careers WHERE id = ?`,
        [careerId]
      );
      if (careerRows.length > 0) {
        selectedCareer = careerRows[0];
      }
    }

    // Fetch resources strictly matching the required skills of the selected career
    let query = `
      SELECT lr.*, s.name as skill_name, s.category as skill_category,
             cs.priority as skill_priority, cs.phase_order as skill_phase,
             cs.required_proficiency
      FROM learning_resources lr
      JOIN skills s ON lr.skill_id = s.id
      JOIN career_skills cs ON cs.skill_id = s.id AND cs.career_id = ?
      WHERE 1=1
    `;
    const params = [careerId];

    if (skillId) {
      query += ` AND lr.skill_id = ?`;
      params.push(skillId);
    }
    if (type && type !== 'All') {
      query += ` AND lr.type = ?`;
      params.push(type);
    }
    if (difficulty && difficulty !== 'All') {
      query += ` AND lr.difficulty = ?`;
      params.push(difficulty);
    }
    if (search) {
      query += ` AND (lr.title LIKE ? OR lr.platform LIKE ? OR s.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY cs.phase_order ASC, cs.importance_weight DESC, lr.id ASC`;
    const [resources] = await db.query(query, params);

    res.json({
      success: true,
      selected_career: selectedCareer,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};
