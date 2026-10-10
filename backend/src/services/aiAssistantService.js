const db = require('../config/database');
const { calculateCareerRecommendations } = require('./careerRecommendationService');
const { calculateSkillGap } = require('./skillGapService');
const learningPathService = require('./learningPathService');

class AiAssistantService {
  /**
   * Generates a context-aware personalized response using the student's real profile,
   * skills, target role, roadmap, and gap analysis.
   */
  async processMessage(userId, userMessage) {
    // 1. Gather comprehensive student context
    const [userRows] = await db.query(
      `SELECT u.full_name, sp.education_level, sp.experience_level, sp.target_career_id, c.name as target_career_name
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN careers c ON sp.target_career_id = c.id
       WHERE u.id = ?`,
      [userId]
    );

    const user = userRows[0] || { full_name: 'Student', target_career_name: 'Backend Developer' };
    const targetRole = user.target_career_name || 'Backend Developer';

    // Student skills
    const [skillRows] = await db.query(
      `SELECT s.name, ss.proficiency_level, ss.status
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.user_id = ?
       ORDER BY ss.proficiency_level DESC`,
      [userId]
    );
    const knownSkillsList = skillRows.map(s => `${s.name} (${s.proficiency_level}%)`);

    // Recommendations & Gaps
    const recommendations = await calculateCareerRecommendations(userId);
    const topRole = recommendations[0] || {};
    const skillGap = await calculateSkillGap(userId, user.target_career_id || 2);
    const roadmap = await learningPathService.getRoadmap(userId, user.target_career_id || 2);

    // Find next skill on roadmap
    let nextSkill = null;
    if (roadmap.phases) {
      for (const p of roadmap.phases) {
        for (const s of p.skills) {
          if (!s.is_completed) {
            nextSkill = s;
            break;
          }
        }
        if (nextSkill) break;
      }
    }

    // 2. Synthesize Contextual Answer
    const qLower = (userMessage || '').toLowerCase();
    let reply = '';

    if (qLower.includes('what should i learn next') || qLower.includes('learn next') || qLower.includes('next skill')) {
      if (nextSkill) {
        reply = `Hi ${user.full_name}! Based on your current progress toward **${targetRole}**, your next recommended focus is **${nextSkill.skill_name}**.\n\n` +
          `• **Current Level**: ${nextSkill.current_proficiency}% (Target: ${nextSkill.target_proficiency}%)\n` +
          `• **Priority**: ${nextSkill.priority}\n` +
          `• **Estimated Effort**: ~${nextSkill.estimated_hours} hours\n\n` +
          `**Why this next?** It is part of **${nextSkill.status === 'current' ? 'your active roadmap phase' : 'your upcoming milestones'}**. ` +
          `Completing this will directly close your skill gap for ${targetRole} and prepare you for subsequent database & architecture modules.`;
      } else {
        reply = `You have completed all primary skills mapped to **${targetRole}**! Consider working on a production-grade Capstone Project or exploring an adjacent role like **Full Stack Developer** or **DevOps Engineer**.`;
      }
    } else if (qLower.includes('can i become a full stack developer') || qLower.includes('full stack developer')) {
      const fsRec = recommendations.find(r => r.role_title.toLowerCase().includes('full stack')) || {};
      const matchScore = fsRec.compatibility_score || 75;
      const missing = (fsRec.missing_skills || []).map(s => s.name).slice(0, 3).join(', ');

      reply = `Yes, absolutely! With your current skill profile, your compatibility for **Full Stack Developer** is **${matchScore}%**.\n\n` +
        `• **Skills you already have**: ${skillRows.filter(s => ['HTML & CSS', 'JavaScript', 'Node.js', 'Express.js', 'MySQL'].includes(s.name)).map(s => s.name).join(', ') || 'HTML, JavaScript, Node.js'}\n` +
        `• **What's needed to be job-ready**: Deepen React UI development, connect client-server REST APIs with JWT authentication, and learn containerized deployment with Docker.\n\n` +
        `You are only about **${fsRec.estimated_weeks_to_ready || 8} weeks** of consistent practice away from being job-ready for junior-to-mid Full Stack roles!`;
    } else if (qLower.includes('what skills am i missing') || qLower.includes('missing skills') || qLower.includes('gap')) {
      const missingList = (skillGap.missingSkills || []).slice(0, 5).map(s => `• **${s.skill_name}** (Target: ${s.required_proficiency}%, Priority: ${s.priority})`).join('\n');
      const partialList = (skillGap.partialSkills || []).slice(0, 3).map(s => `• **${s.skill_name}** (Currently at ${s.current_proficiency}%, Need: ${s.required_proficiency}%)`).join('\n');

      reply = `For your chosen career goal as a **${targetRole}** (Current Readiness: **${skillGap.readinessScore}%**):\n\n` +
        `**Skills you are currently missing completely:**\n${missingList || 'None! You have touched all required areas.'}\n\n` +
        `**Skills you already know that need revision or deepening:**\n${partialList || 'All existing skills are at target proficiency.'}\n\n` +
        `*Notice that our engine never asks you to restart skills from scratch—we only recommend targeted advanced revision where your level requires it.*`;
    } else if (qLower.includes('project') || qLower.includes('build next') || qLower.includes('portfolio')) {
      reply = `Based on your goal to become a **${targetRole}** and your knowledge of ${knownSkillsList.slice(0, 3).join(', ')}, here are the best projects to build:\n\n` +
        `1. **Production REST API with JWT Auth & Role-Based Access**: Build an API with user registration, password hashing with bcrypt, JWT token refresh, and input validation.\n` +
        `2. **Scalable E-Commerce Inventory & Order Service**: Design normalized MySQL tables, handle relational database transactions, and implement search indexing.\n` +
        `3. **Real-Time Notification Microservice**: Utilize Redis and WebSockets for real-time pub/sub delivery.\n\n` +
        `You can add completed projects to your portfolio in the **Projects & Assessments** portal!`;
    } else if (qLower.includes('node.js') || qLower.includes('improve in node') || qLower.includes('node')) {
      const nodeSkill = skillRows.find(s => s.name.toLowerCase() === 'node.js');
      const currentLevel = nodeSkill ? nodeSkill.proficiency_level : 60;

      reply = `To take your Node.js proficiency from **${currentLevel}%** to an Advanced **85%+**:\n\n` +
        `1. **Master the Event Loop**: Understand timers, I/O callbacks, setImmediate vs process.nextTick, and microtask vs macrotask execution order.\n` +
        `2. **Work with Streams & Buffers**: Practice reading multi-gigabyte files using \`fs.createReadStream\` without running out of RAM.\n` +
        `3. **Production Middleware Patterns**: Build custom error-handling middlewares and request logging without memory leaks.\n` +
        `4. **Clustering & Performance**: Explore Node.js cluster module and worker threads to utilize multiple CPU cores.`;
    } else {
      reply = `Hello ${user.full_name}! As your **SkillPath AI** career advisor, I'm here to help you become job-ready for **${targetRole}**.\n\n` +
        `Currently, your readiness is **${skillGap.readinessScore}%** based on ${skillRows.length} assessed skills. ` +
        `Your top recommended roles right now are **${recommendations.slice(0, 3).map(r => `${r.role_title} (${r.compatibility_score}%)`).join(', ')}**.\n\n` +
        `Feel free to ask me:\n` +
        `• *"What should I learn next?"*\n` +
        `• *"What skills am I missing for Backend Developer?"*\n` +
        `• *"Can I become a Full Stack Developer with my current skills?"*\n` +
        `• *"Which project should I build next?"*`;
    }

    // 3. Save to database chat history
    try {
      await db.query(`INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'user', ?)`, [userId, userMessage]);
      await db.query(`INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'assistant', ?)`, [userId, reply]);
    } catch (err) {
      console.error('Error saving chat message:', err);
    }

    return {
      reply,
      context: {
        student_name: user.full_name,
        target_role: targetRole,
        readiness_score: skillGap.readinessScore,
        next_recommended_skill: nextSkill ? nextSkill.skill_name : null
      }
    };
  }

  async getChatHistory(userId) {
    const [rows] = await db.query(
      `SELECT id, sender, message, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50`,
      [userId]
    );
    return rows;
  }
}

module.exports = new AiAssistantService();
