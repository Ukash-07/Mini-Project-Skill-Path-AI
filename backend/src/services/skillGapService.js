const db = require('../config/database');
const { resolveCareerFromInterests } = require('../utils/careerHelper');

/**
 * Skill Gap Analysis Service
 * Compares student's current proficiency with role requirements without asking
 * them to relearn what they already know. Generates targeted revision for partial skills
 * and structured learning for missing skills.
 */
async function calculateSkillGap(userId, targetCareerId) {
  let careerId = targetCareerId;
  if (!careerId) {
    const [profileRows] = await db.query(
      `SELECT target_career_id, interests FROM student_profiles WHERE user_id = ?`,
      [userId]
    );
    if (profileRows.length > 0 && profileRows[0].target_career_id) {
      careerId = profileRows[0].target_career_id;
    } else {
      careerId = resolveCareerFromInterests(profileRows[0]?.interests) || 2;
    }
  }

  // Get Career details
  const [careerRows] = await db.query(`SELECT * FROM careers WHERE id = ?`, [careerId]);
  if (careerRows.length === 0) {
    return { career: null, skillGaps: [], masteredSkills: [], partialSkills: [], missingSkills: [] };
  }
  const career = careerRows[0];

  // Get student profile for weekly availability
  const [profiles] = await db.query(
    `SELECT weekly_learning_hours FROM student_profiles WHERE user_id = ?`,
    [userId]
  );
  const weeklyHours = (profiles[0] && profiles[0].weekly_learning_hours) || 10;

  // Get Career Skills (Required Benchmarks)
  const [csRows] = await db.query(
    `SELECT cs.skill_id, s.name as skill_name, s.category, s.difficulty,
            cs.required_proficiency, cs.importance_weight, cs.priority, cs.phase_order, cs.prerequisites
     FROM career_skills cs
     JOIN skills s ON cs.skill_id = s.id
     WHERE cs.career_id = ?
     ORDER BY cs.phase_order ASC, cs.importance_weight DESC`,
    [careerId]
  );

  // Get Student's Current Skills
  const [ssRows] = await db.query(
    `SELECT skill_id, proficiency_level, status FROM student_skills WHERE user_id = ?`,
    [userId]
  );
  const studentSkillMap = {};
  ssRows.forEach(r => {
    studentSkillMap[r.skill_id] = {
      proficiency_level: parseFloat(r.proficiency_level) || 0,
      status: r.status
    };
  });

  let totalRequired = 0;
  let totalCurrentEarned = 0;
  let totalMissingPoints = 0;

  const masteredSkills = [];
  const partialSkills = [];
  const missingSkills = [];
  const skillGaps = [];

  for (const item of csRows) {
    const current = studentSkillMap[item.skill_id] ? studentSkillMap[item.skill_id].proficiency_level : 0;
    const required = parseFloat(item.required_proficiency) || 70;
    const gap = Math.max(0, Math.round(required - current));

    totalRequired += required;
    totalCurrentEarned += Math.min(required, current);

    let classification = 'Missing';
    let actionRecommendation = '';

    if (gap === 0) {
      classification = 'Mastered';
      actionRecommendation = `Already mastered (${current}%). No relearning required; keep practicing in projects.`;
      masteredSkills.push({
        skill_id: item.skill_id,
        skill_name: item.skill_name,
        category: item.category,
        current_proficiency: current,
        required_proficiency: required,
        priority: item.priority,
        phase: item.phase_order
      });
    } else if (current > 0) {
      classification = 'Partially Known';
      actionRecommendation = `Foundational knowledge present (${current}%). Focus on targeted revision and advanced patterns to reach ${required}%.`;
      totalMissingPoints += gap;
      partialSkills.push({
        skill_id: item.skill_id,
        skill_name: item.skill_name,
        category: item.category,
        current_proficiency: current,
        required_proficiency: required,
        gap,
        priority: item.priority,
        phase: item.phase_order,
        revision_advice: actionRecommendation
      });
    } else {
      classification = 'Missing';
      actionRecommendation = `Essential skill to learn from fundamentals to reach ${required}% proficiency.`;
      totalMissingPoints += required;
      missingSkills.push({
        skill_id: item.skill_id,
        skill_name: item.skill_name,
        category: item.category,
        required_proficiency: required,
        priority: item.priority,
        phase: item.phase_order,
        learning_focus: actionRecommendation
      });
    }

    skillGaps.push({
      skill_id: item.skill_id,
      skill_name: item.skill_name,
      category: item.category,
      difficulty: item.difficulty,
      current_proficiency: current,
      required_proficiency: required,
      gap,
      classification,
      priority: item.priority,
      importance_weight: parseFloat(item.importance_weight) || 0.5,
      phase_order: item.phase_order,
      recommendation: actionRecommendation
    });
  }

  const readinessScore = totalRequired > 0 ? Math.round((totalCurrentEarned / totalRequired) * 100) : 0;
  const overallGapPercentage = 100 - readinessScore;

  // Curated targeted technical topic recommendations for this role
  const topicRecommendations = generateTopicRecommendations(career.name, partialSkills, missingSkills);

  const estimatedStudyHours = Math.max(20, Math.round(totalMissingPoints * 0.75));
  const estimatedWeeks = Math.max(2, Math.ceil(estimatedStudyHours / Math.max(5, weeklyHours)));

  return {
    career,
    readinessScore,
    overallGapPercentage,
    totalMissingPoints,
    estimatedStudyHours,
    estimatedWeeks,
    masteredSkills,
    partialSkills,
    missingSkills,
    skillGaps,
    topicRecommendations
  };
}

function generateTopicRecommendations(roleName, partialSkills, missingSkills) {
  const recommendations = [];

  // For partial skills, recommend advanced topics rather than basics
  partialSkills.forEach(s => {
    recommendations.push({
      skill_name: s.skill_name,
      type: 'Revision & Deepening',
      tag: 'Partially Known',
      topics: getAdvancedTopics(s.skill_name),
      goal: `Advance from ${s.current_proficiency}% to ${s.required_proficiency}% target proficiency.`
    });
  });

  // For missing skills, recommend core curriculum
  missingSkills.forEach(s => {
    recommendations.push({
      skill_name: s.skill_name,
      type: 'Core Skill to Learn',
      tag: 'Missing Skill',
      priority: s.priority,
      topics: getCoreTopics(s.skill_name),
      goal: `Learn from fundamentals to reach ${s.required_proficiency}% job-ready benchmark.`
    });
  });

  return recommendations;
}

function getAdvancedTopics(skillName) {
  const map = {
    'JavaScript': ['ES6+ and modern features', 'Promises, async/await, and error handling', 'Closures, prototypes, and asynchronous event loop'],
    'Node.js': ['Event-driven non-blocking I/O', 'Streams, buffers, and file processing', 'Cluster module and worker threads'],
    'Express.js': ['Modular routing and middleware architecture', 'Centralized error handling and async wrappers', 'Rate limiting and security middlewares'],
    'MySQL': ['Database relationships, normalization (1NF to 3NF)', 'Complex JOINs, aggregate functions, and subqueries', 'Indexing strategies and EXPLAIN execution plan analysis'],
    'React': ['Custom hooks and composition patterns', 'Context API & state managers', 'Performance optimization with useMemo/useCallback'],
    'HTML & CSS': ['Flexbox & Grid responsive layout mastery', 'CSS custom properties and dark mode systems', 'Web accessibility (a11y) standards']
  };
  return map[skillName] || [`Advanced ${skillName} architecture patterns`, `Industry best practices and performance optimization`, `Real-world integration and edge case handling`];
}

function getCoreTopics(skillName) {
  const map = {
    'REST API Architecture': ['RESTful design principles and status codes', 'Request validation (Joi/Zod)', 'Pagination, filtering, and sorting standards'],
    'JWT & Authentication': ['JSON Web Token signing and verification', 'HTTP-only cookie vs Bearer token storage', 'Role-based access control (RBAC) middleware'],
    'MongoDB': ['Document schema design and BSON types', 'Mongoose ODM models and validation', 'Aggregation pipeline for analytics'],
    'Docker': ['Writing production Dockerfiles', 'Multi-stage builds for small images', 'Docker Compose multi-container stacks'],
    'Git & GitHub': ['Branching strategies (Git Flow)', 'Pull requests and code reviews', 'Resolving merge conflicts and git rebase'],
    'API Testing & Postman': ['Writing automated test assertions', 'Environment variables and pre-request scripts', 'Running collections in CI/CD pipelines with Newman'],
    'System Design Fundamentals': ['Load balancers and reverse proxies', 'Caching strategies with Redis', 'Database replication and CAP theorem'],
    'Redis': ['In-memory key-value caching', 'Cache invalidation strategies', 'Rate limiting and session storage']
  };
  return map[skillName] || [`Fundamentals and core syntax of ${skillName}`, `Practical exercises and mini-projects`, `Integration into production tech stacks`];
}

module.exports = {
  calculateSkillGap
};
