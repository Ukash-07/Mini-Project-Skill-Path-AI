const db = require('../config/database');

exports.getSkills = async (req, res, next) => {
  try {
    const [skills] = await db.query(`SELECT * FROM skills ORDER BY name ASC`);
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
};

exports.getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`SELECT * FROM skills WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    const [prereqs] = await db.query(
      `SELECT sp.*, s.name as prerequisite_skill_name, s.difficulty
       FROM skill_prerequisites sp
       JOIN skills s ON sp.prerequisite_skill_id = s.id
       WHERE sp.skill_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...rows[0],
        prerequisites: prereqs
      }
    });
  } catch (err) {
    next(err);
  }
};
