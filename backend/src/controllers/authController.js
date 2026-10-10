const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, confirm_password, education_level } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check existing user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email address is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name, email, password_hash, 'student']
    );

    const userId = result.insertId;

    // Create student profile
    await db.query(
      'INSERT INTO student_profiles (user_id, education_level) VALUES (?, ?)',
      [userId, education_level || 'Undergraduate']
    );

    await db.query(
      'INSERT INTO student_preferences (user_id) VALUES (?)',
      [userId]
    );

    const token = jwt.sign(
      { id: userId, email, role: 'student', full_name },
      process.env.JWT_SECRET || 'super_secret_jwt_key_learning_path_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: { id: userId, full_name, email, role: 'student' }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET || 'super_secret_jwt_key_learning_path_2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [profile] = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        profile: profile[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
};
