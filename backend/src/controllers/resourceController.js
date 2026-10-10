const db = require('../config/database');

exports.getResources = async (req, res, next) => {
  try {
    const { skillId, type, difficulty, search } = req.query;
    let query = `
      SELECT lr.*, s.name as skill_name, s.category as skill_category
      FROM learning_resources lr
      JOIN skills s ON lr.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];

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

    query += ` ORDER BY lr.id ASC`;
    const [resources] = await db.query(query, params);

    res.json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
};
