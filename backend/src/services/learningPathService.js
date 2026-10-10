const db = require('../config/database');

class LearningPathService {
  /**
   * Generates or fetches the comprehensive 5-phase personalized roadmap
   * for a student's chosen career role.
   */
  async getRoadmap(userId, careerIdParam = null) {
    // 1. Determine career ID
    let careerId = careerIdParam;
    if (!careerId) {
      const [profileRows] = await db.query(
        `SELECT target_career_id FROM student_profiles WHERE user_id = ?`,
        [userId]
      );
      if (profileRows.length > 0 && profileRows[0].target_career_id) {
        careerId = profileRows[0].target_career_id;
      } else {
        careerId = 2; // Default to Backend Developer
      }
    }

    // 2. Fetch Career Role Info
    const [careerRows] = await db.query(`SELECT * FROM careers WHERE id = ?`, [careerId]);
    if (careerRows.length === 0) {
      return { career: null, phases: [], overall_progress: 0 };
    }
    const career = careerRows[0];

    // 3. Fetch Student's Current Skills
    const [studentSkills] = await db.query(
      `SELECT skill_id, proficiency_level, status FROM student_skills WHERE user_id = ?`,
      [userId]
    );
    const studentSkillMap = new Map();
    studentSkills.forEach(s => {
      studentSkillMap.set(s.skill_id, parseFloat(s.proficiency_level) || 0);
    });

    // 4. Fetch Role Skills
    const [roleSkills] = await db.query(
      `SELECT cs.*, s.name as skill_name, s.category, s.difficulty, s.description as skill_description
       FROM career_skills cs
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.career_id = ?
       ORDER BY cs.phase_order ASC, cs.importance_weight DESC`,
      [careerId]
    );

    // 5. Fetch Learning Resources
    const [allResources] = await db.query(`SELECT * FROM learning_resources ORDER BY id ASC`);
    const resourceMap = new Map();
    allResources.forEach(res => {
      if (!resourceMap.has(res.skill_id)) {
        resourceMap.set(res.skill_id, []);
      }
      resourceMap.get(res.skill_id).push(res);
    });

    // 6. Define Phase Titles for Career Roadmap
    const phaseNames = {
      1: 'Phase 1: Core Fundamentals & Prerequisite Foundations',
      2: 'Phase 2: Primary Tech Stack Mastery & Architecture',
      3: 'Phase 3: Database Design, Storage & Optimization',
      4: 'Phase 4: Professional Development, Security & Tooling',
      5: 'Phase 5: Production Deployment, Scalability & Capstone Projects'
    };

    const phaseDescriptions = {
      1: 'Build unshakeable core programming literacy and conceptual foundations.',
      2: 'Deep dive into frameworks, API patterns, and server-side engineering.',
      3: 'Master data storage, relational queries, normalization, indexing, and NoSQL.',
      4: 'Implement authentication, security best practices, testing suites, and git.',
      5: 'Ship containerized, production-ready capstone systems to the cloud.'
    };

    const phases = [];
    let totalSkillsCount = 0;
    let completedSkillsCount = 0;
    let firstIncompleteFound = false;

    // Group into 5 phases
    for (let phaseNum = 1; phaseNum <= 5; phaseNum++) {
      const skillsInPhase = roleSkills.filter(s => (s.phase_order || 1) === phaseNum);
      if (skillsInPhase.length === 0) continue;

      const phaseSkillItems = [];

      for (const item of skillsInPhase) {
        totalSkillsCount++;
        const currentProf = studentSkillMap.get(item.skill_id) || 0;
        const targetProf = parseFloat(item.required_proficiency) || 75;
        const isCompleted = currentProf >= targetProf;

        if (isCompleted) {
          completedSkillsCount++;
        }

        let status = 'recommended';
        if (isCompleted) {
          status = 'completed';
        } else if (!firstIncompleteFound) {
          status = 'current'; // Active recommended target
          firstIncompleteFound = true;
        } else {
          status = 'upcoming';
        }

        // Curated practical exercises & mini-projects per skill
        const practicalExercises = getExercisesForSkill(item.skill_name);
        const miniProject = getMiniProjectForSkill(item.skill_name);
        const resources = resourceMap.get(item.skill_id) || [
          {
            title: `${item.skill_name} Official Documentation & Learning Guide`,
            url: `https://www.google.com/search?q=${encodeURIComponent(item.skill_name + ' documentation tutorial')}`,
            type: 'Documentation',
            platform: 'Official Docs'
          }
        ];

        phaseSkillItems.push({
          skill_id: item.skill_id,
          skill_name: item.skill_name,
          category: item.category,
          difficulty: item.difficulty,
          current_proficiency: currentProf,
          target_proficiency: targetProf,
          priority: item.priority || 'High',
          estimated_hours: Math.max(6, Math.round(targetProf * 0.15)),
          prerequisites: item.prerequisites || 'Basic computer literacy',
          status,
          is_completed: isCompleted,
          resources,
          practical_exercises: practicalExercises,
          mini_project: miniProject
        });
      }

      phases.push({
        phase_number: phaseNum,
        title: phaseNames[phaseNum] || `Phase ${phaseNum}`,
        description: phaseDescriptions[phaseNum] || '',
        skills: phaseSkillItems
      });
    }

    const overallProgress = totalSkillsCount > 0 ? Math.round((completedSkillsCount / totalSkillsCount) * 100) : 0;

    return {
      career,
      target_career_name: career.name,
      overall_progress: overallProgress,
      total_skills: totalSkillsCount,
      completed_skills: completedSkillsCount,
      remaining_skills: totalSkillsCount - completedSkillsCount,
      phases
    };
  }

  /**
   * Toggles a skill as completed / in-progress on the roadmap
   */
  async toggleSkillCompletion(userId, skillId) {
    // Check current level
    const [rows] = await db.query(
      `SELECT proficiency_level FROM student_skills WHERE user_id = ? AND skill_id = ?`,
      [userId, skillId]
    );

    const current = rows.length > 0 ? parseFloat(rows[0].proficiency_level) : 0;
    // Toggle: if >= 80, set to 40; if < 80, mark completed with 85
    const newProf = current >= 80 ? 40 : 85;
    const status = newProf >= 70 ? 'Advanced' : newProf >= 40 ? 'Intermediate' : 'Beginner';

    await db.query(
      `INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE proficiency_level = ?, status = ?`,
      [userId, skillId, newProf, status, newProf, status]
    );

    return {
      success: true,
      skill_id: skillId,
      new_proficiency: newProf,
      is_completed: newProf >= 80
    };
  }
}

function getExercisesForSkill(name) {
  const map = {
    'JavaScript': ['Implement a custom Promise.all polyfill', 'Write a debounced search input function', 'Deep clone a nested object without JSON.stringify'],
    'Node.js': ['Create a simple HTTP server using core http module', 'Read a 50MB log file with Streams and count keywords', 'Build a CLI tool that parses command arguments'],
    'Express.js': ['Implement request validation middleware with Joi/Zod', 'Create centralized error handling with custom AppError class', 'Configure CORS and rate-limiting using express-rate-limit'],
    'MySQL': ['Write a query with 3 table JOINs and GROUP BY aggregation', 'Create an indexing strategy and verify performance with EXPLAIN', 'Implement a multi-statement database transaction with rollback'],
    'HTML & CSS': ['Build a responsive CSS Grid product dashboard', 'Implement a mobile navigation drawer with CSS transitions', 'Create accessible forms with aria attributes'],
    'React': ['Build a reusable Modal component with React Portal', 'Implement infinite scrolling with custom useIntersectionObserver hook', 'Manage shopping cart state using useReducer and Context API'],
    'JWT & Authentication': ['Generate and sign JWT access & refresh tokens', 'Create verifyToken middleware that extracts Bearer token', 'Hash passwords with bcrypt salt rounds = 10'],
    'Docker': ['Write a multi-stage Dockerfile for a Node.js web app', 'Set up docker-compose with Node app and MySQL container', 'Mount persistent volume for database data']
  };
  return map[name] || [
    `Complete 3 interactive coding challenges on ${name}`,
    `Implement a practical mini-feature demonstrating core concepts`,
    `Refactor code to meet clean architecture best practices`
  ];
}

function getMiniProjectForSkill(name) {
  const map = {
    'JavaScript': 'Build an Asynchronous Weather & News Aggregator Widget',
    'Node.js': 'Build a File Upload & Image Resizing Microservice',
    'Express.js': 'Build a Production-Ready Bookstore REST API',
    'MySQL': 'Design an E-Commerce Relational Schema with Order History',
    'HTML & CSS': 'Build a Pixel-Perfect Responsive SaaS Landing Page',
    'React': 'Build a Kanban Drag-and-Drop Task Management Board',
    'JWT & Authentication': 'Build a Secure Role-Based Member Authentication Service',
    'Docker': 'Containerize a Full Stack App with Redis Caching'
  };
  return map[name] || `Build a Capstone Mini-Application showcasing ${name}`;
}

module.exports = new LearningPathService();
