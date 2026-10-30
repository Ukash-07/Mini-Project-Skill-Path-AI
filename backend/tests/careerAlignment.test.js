const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { resolveCareerFromInterests } = require('../src/utils/careerHelper');
const learningPathService = require('../src/services/learningPathService');
const skillGapService = require('../src/services/skillGapService');
const db = require('../src/config/database');

after(async () => {
  await db.end();
});

test('Career Alignment: resolveCareerFromInterests maps interest names correctly', () => {
  assert.equal(resolveCareerFromInterests(['Mobile Development']), 7);
  assert.equal(resolveCareerFromInterests('["Mobile Development"]'), 7);
  assert.equal(resolveCareerFromInterests(['AI/ML']), 11);
  assert.equal(resolveCareerFromInterests(['Data Science']), 9);
  assert.equal(resolveCareerFromInterests(['Cybersecurity']), 17);
  assert.equal(resolveCareerFromInterests(['Cloud Computing']), 15);
  assert.equal(resolveCareerFromInterests(['Web Development']), 1);
  assert.equal(resolveCareerFromInterests(['Software Engineering']), 6);
  assert.equal(resolveCareerFromInterests([]), null);
  assert.equal(resolveCareerFromInterests(null), null);
});

test('Career Alignment: Services resolve career from interests when target is not explicit', async () => {
  const [students] = await db.query(`SELECT id FROM users WHERE role = 'student' LIMIT 1`);
  if (students.length === 0) return;
  const studentId = students[0].id;

  // Temporarily set profile interests to Mobile Development
  const [origProfile] = await db.query(
    `SELECT target_career_id, interests FROM student_profiles WHERE user_id = ?`,
    [studentId]
  );

  try {
    await db.query(
      `UPDATE student_profiles SET target_career_id = NULL, interests = ? WHERE user_id = ?`,
      [JSON.stringify(['Mobile Development']), studentId]
    );

    // Roadmap should auto-align to Career 7 (Mobile App Developer)
    const roadmap = await learningPathService.getRoadmap(studentId);
    assert.ok(roadmap.career);
    assert.equal(roadmap.career.id, 7);
    assert.equal(roadmap.career.name, 'Mobile App Developer');

    // Skill Gap should auto-align to Career 7
    const gap = await skillGapService.calculateSkillGap(studentId);
    assert.ok(gap.career);
    assert.equal(gap.career.id, 7);
  } finally {
    // Restore original profile
    if (origProfile.length > 0) {
      await db.query(
        `UPDATE student_profiles SET target_career_id = ?, interests = ? WHERE user_id = ?`,
        [origProfile[0].target_career_id, origProfile[0].interests, studentId]
      );
    }
  }
});

