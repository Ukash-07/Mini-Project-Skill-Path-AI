const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const recommendationEngine = require('../src/services/recommendationEngine');
const skillGapService = require('../src/services/skillGapService');
const db = require('../src/config/database');

after(async () => {
  await db.end();
});

test('Skill Gap Calculation Logic', async () => {
  const [students] = await db.query(`SELECT id FROM users WHERE role = 'student' LIMIT 1`);
  const studentId = students.length > 0 ? students[0].id : 1;
  const result = await skillGapService.calculateSkillGap(studentId);
  assert.ok(result);
  assert.ok(Array.isArray(result.skillGaps));
  assert.equal(typeof result.overallGapPercentage, 'number');
});

test('Hybrid Recommendation Scoring for Student', async () => {
  const [students] = await db.query(`SELECT id FROM users WHERE role = 'student' LIMIT 1`);
  const studentId = students.length > 0 ? students[0].id : 1;
  const result = await recommendationEngine.generateRecommendations(studentId);
  assert.ok(result);
  assert.ok(Array.isArray(result.recommendations));
  assert.ok(result.recommendations.length > 0);
  
  const topRec = result.recommendations[0];
  assert.ok(topRec.course);
  assert.equal(typeof topRec.recommendation_score, 'number');
  assert.ok(Array.isArray(topRec.reasons));
});
