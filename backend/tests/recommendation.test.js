const test = require('node:test');
const assert = require('node:assert/strict');
const recommendationEngine = require('../src/services/recommendationEngine');
const skillGapService = require('../src/services/skillGapService');

test('Skill Gap Calculation Logic', async () => {
  // Test skill gap calculation for seeded user 2 (Alex Morgan)
  const result = await skillGapService.calculateSkillGap(2);
  assert.ok(result);
  assert.ok(Array.isArray(result.skillGaps));
  assert.equal(typeof result.overallGapPercentage, 'number');
});

test('Hybrid Recommendation Scoring for Student', async () => {
  const result = await recommendationEngine.generateRecommendations(2);
  assert.ok(result);
  assert.ok(Array.isArray(result.recommendations));
  assert.ok(result.recommendations.length > 0);
  
  const topRec = result.recommendations[0];
  assert.ok(topRec.course);
  assert.equal(typeof topRec.recommendation_score, 'number');
  assert.ok(Array.isArray(topRec.reasons));
});
