const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/database');
const resourceController = require('../src/controllers/resourceController');

after(async () => {
  await db.end();
});

test('Learning Resources: Filters resources strictly by selected career', async () => {
  // Test with career 1 (Frontend Developer)
  let jsonCareer1 = null;
  const req1 = {
    query: { careerId: 1 },
    user: null
  };
  const res1 = {
    json: (payload) => {
      jsonCareer1 = payload;
      return res1;
    }
  };

  await resourceController.getResources(req1, res1, (err) => {
    throw err;
  });

  assert.ok(jsonCareer1);
  assert.equal(jsonCareer1.success, true);
  assert.equal(jsonCareer1.selected_career.id, 1);
  assert.equal(jsonCareer1.selected_career.name, 'Frontend Developer');

  // Verify that all returned resources belong to skills required by Frontend Developer
  const [frontendSkills] = await db.query(
    `SELECT skill_id FROM career_skills WHERE career_id = 1`
  );
  const frontendSkillIds = new Set(frontendSkills.map((s) => s.skill_id));

  for (const r of jsonCareer1.data) {
    assert.ok(
      frontendSkillIds.has(r.skill_id),
      `Resource ${r.title} with skill_id ${r.skill_id} must be in Frontend Developer required skills`
    );
  }

  // Test with career 2 (Backend Developer)
  let jsonCareer2 = null;
  const req2 = {
    query: { careerId: 2 },
    user: null
  };
  const res2 = {
    json: (payload) => {
      jsonCareer2 = payload;
      return res2;
    }
  };

  await resourceController.getResources(req2, res2, (err) => {
    throw err;
  });

  assert.ok(jsonCareer2);
  assert.equal(jsonCareer2.success, true);
  assert.equal(jsonCareer2.selected_career.id, 2);
  assert.equal(jsonCareer2.selected_career.name, 'Backend Developer');

  const [backendSkills] = await db.query(
    `SELECT skill_id FROM career_skills WHERE career_id = 2`
  );
  const backendSkillIds = new Set(backendSkills.map((s) => s.skill_id));

  for (const r of jsonCareer2.data) {
    assert.ok(
      backendSkillIds.has(r.skill_id),
      `Resource ${r.title} with skill_id ${r.skill_id} must be in Backend Developer required skills`
    );
  }
});

