const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/database');
const adminController = require('../src/controllers/adminController');

after(async () => {
  await db.end();
});

test('Admin Delete Protection: Cannot delete an admin user', async () => {
  // Try to delete user id 1 (seeded admin)
  let statusReceived = null;
  let jsonReceived = null;

  const req = { params: { id: 1 } };
  const res = {
    status: (code) => {
      statusReceived = code;
      return res;
    },
    json: (payload) => {
      jsonReceived = payload;
      return res;
    }
  };
  const next = (err) => {
    throw err;
  };

  await adminController.deleteStudent(req, res, next);

  assert.equal(statusReceived, 403);
  assert.equal(jsonReceived.success, false);
  assert.match(jsonReceived.message, /Admin accounts cannot be deleted/i);
});

test('Admin Delete: Non-existent student returns 404', async () => {
  let statusReceived = null;
  let jsonReceived = null;

  const req = { params: { id: 9999999 } };
  const res = {
    status: (code) => {
      statusReceived = code;
      return res;
    },
    json: (payload) => {
      jsonReceived = payload;
      return res;
    }
  };
  const next = (err) => {
    throw err;
  };

  await adminController.deleteStudent(req, res, next);

  assert.equal(statusReceived, 404);
  assert.equal(jsonReceived.success, false);
});

test('Admin Delete: Successfully deletes a test student and associated cascade', async () => {
  // Create a temporary test student
  const [insertRes] = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'student')`,
    ['Test To Delete', `testdelete_${Date.now()}@example.com`, 'fakehash']
  );
  const testStudentId = insertRes.insertId;

  // Insert associated student profile
  await db.query(
    `INSERT INTO student_profiles (user_id, education_level, experience_level) VALUES (?, 'Bachelor', 'Beginner')`,
    [testStudentId]
  );

  let statusReceived = 200;
  let jsonReceived = null;

  const req = { params: { id: testStudentId } };
  const res = {
    status: (code) => {
      statusReceived = code;
      return res;
    },
    json: (payload) => {
      jsonReceived = payload;
      return res;
    }
  };
  const next = (err) => {
    throw err;
  };

  await adminController.deleteStudent(req, res, next);

  assert.equal(jsonReceived.success, true);
  assert.match(jsonReceived.message, /deleted successfully/i);

  // Verify student is removed from users table
  const [userCheck] = await db.query(`SELECT id FROM users WHERE id = ?`, [testStudentId]);
  assert.equal(userCheck.length, 0);

  // Verify cascade removed profile
  const [profileCheck] = await db.query(`SELECT id FROM student_profiles WHERE user_id = ?`, [testStudentId]);
  assert.equal(profileCheck.length, 0);
});

test('Admin Delete: Successfully deletes a test assessment', async () => {
  // Create a temporary test assessment
  const [insertRes] = await db.query(
    `INSERT INTO assessments (title, total_marks, duration_minutes) VALUES (?, 100, 30)`,
    [`Test Delete Assessment ${Date.now()}`]
  );
  const testAssessmentId = insertRes.insertId;

  let jsonReceived = null;
  const req = { params: { id: testAssessmentId } };
  const res = {
    status: (code) => res,
    json: (payload) => {
      jsonReceived = payload;
      return res;
    }
  };
  const next = (err) => {
    throw err;
  };

  await adminController.deleteAssessment(req, res, next);

  assert.equal(jsonReceived.success, true);

  // Verify assessment is removed
  const [assCheck] = await db.query(`SELECT id FROM assessments WHERE id = ?`, [testAssessmentId]);
  assert.equal(assCheck.length, 0);
});
