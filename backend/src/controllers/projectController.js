const db = require('../config/database');

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Get student's submitted projects
    const [userProjects] = await db.query(
      `SELECT sp.*, c.name as career_name
       FROM student_projects sp
       LEFT JOIN careers c ON sp.career_id = c.id
       WHERE sp.user_id = ?
       ORDER BY sp.submitted_at DESC`,
      [userId]
    );

    // Get student's target career to return sample recommended capstones
    const [profile] = await db.query(
      `SELECT target_career_id FROM student_profiles WHERE user_id = ?`,
      [userId]
    );
    const careerId = (profile[0] && profile[0].target_career_id) || 2;

    const [careerRows] = await db.query(`SELECT name, sample_projects FROM careers WHERE id = ?`, [careerId]);
    let recommendedProjects = [];
    if (careerRows.length > 0 && careerRows[0].sample_projects) {
      try {
        const titles = JSON.parse(careerRows[0].sample_projects);
        recommendedProjects = titles.map((title, idx) => ({
          id: idx + 1,
          title,
          role_name: careerRows[0].name,
          difficulty: idx === 0 ? 'Intermediate' : idx === 1 ? 'Intermediate' : 'Advanced',
          type: 'Capstone Challenge'
        }));
      } catch (e) {
        recommendedProjects = [];
      }
    }

    res.json({
      success: true,
      data: {
        portfolio_projects: userProjects,
        recommended_projects: recommendedProjects
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.addProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, skills_used, repo_url, demo_url, career_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const [result] = await db.query(
      `INSERT INTO student_projects (user_id, career_id, title, description, skills_used, repo_url, demo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [userId, career_id || null, title.trim(), description || '', skills_used || '', repo_url || '', demo_url || '']
    );

    res.json({
      success: true,
      message: 'Project added to portfolio successfully!',
      data: { id: result.insertId, title, repo_url, demo_url }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query(`DELETE FROM student_projects WHERE id = ? AND user_id = ?`, [id, userId]);
    res.json({ success: true, message: 'Project removed from portfolio.' });
  } catch (err) {
    next(err);
  }
};
