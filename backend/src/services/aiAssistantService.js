const db = require('../config/database');
const { calculateCareerRecommendations } = require('./careerRecommendationService');
const { calculateSkillGap } = require('./skillGapService');
const learningPathService = require('./learningPathService');
const { resolveCareerFromInterests } = require('../utils/careerHelper');

function getRoleSpecificProjects(targetRole) {
  const rLower = (targetRole || '').toLowerCase();

  if (rLower.includes('mobile')) {
    return [
      `1. **Cross-Platform Mobile App with React Native / Flutter**: Build an iOS and Android app with native navigation, camera/media upload, and local storage caching.`,
      `2. **Mobile E-Commerce & Service App with REST API**: Connect a native mobile client to cloud backend services with secure JWT authentication and order checkout.`,
      `3. **Real-Time Push Notification & Chat Application**: Integrate Firebase Cloud Messaging (FCM) or WebSockets for real-time messaging and device push alerts.`,
      `4. **Offline-First Habit & Task Manager**: Implement local SQLite / WatermelonDB storage with automatic cloud synchronization when network reconnects.`
    ].join('\n');
  }

  if (rLower.includes('ai') || rLower.includes('machine learning')) {
    return [
      `1. **End-to-End RAG Knowledge Assistant**: Build a Retrieval-Augmented Generation system using LangChain, vector embeddings, and LLM orchestration.`,
      `2. **Predictive ML Classification API**: Train and evaluate a Scikit-Learn / PyTorch model and serve predictions via a high-performance FastAPI microservice.`,
      `3. **Computer Vision & Object Detection Web Service**: Implement real-time image analysis using OpenCV and pre-trained deep learning weights.`
    ].join('\n');
  }

  if (rLower.includes('data')) {
    return [
      `1. **Automated ETL Data Pipeline**: Extract multi-source data, perform transformations using Pandas, and load into a normalized data warehouse.`,
      `2. **Interactive Business Analytics Dashboard**: Build a comprehensive KPI tracking dashboard with SQL aggregation and visual metrics.`,
      `3. **Customer Churn & Behavior Prediction Model**: Perform exploratory data analysis, feature engineering, and predictive modeling.`
    ].join('\n');
  }

  if (rLower.includes('frontend') || rLower.includes('ui')) {
    return [
      `1. **Production SaaS Dashboard with React & Tailwind CSS**: Build a responsive web application with dark/light themes, chart analytics, and modal workflows.`,
      `2. **Reusable Design System & Component Library**: Create accessible, keyboard-navigable UI components published with Storybook.`,
      `3. **Real-Time Collaboration Canvas**: Develop an interactive canvas application with state management and live updates.`
    ].join('\n');
  }

  if (rLower.includes('cloud') || rLower.includes('devops')) {
    return [
      `1. **Multi-Service Microservices Deployment with Docker & Kubernetes**: Containerize client-server applications and deploy with Helm charts.`,
      `2. **Automated CI/CD Pipeline with GitHub Actions**: Build, test, and deploy automated releases to AWS with zero-downtime rolling updates.`,
      `3. **Infrastructure as Code with Terraform**: Provision VPCs, load balancers, and managed databases automatically.`
    ].join('\n');
  }

  if (rLower.includes('security') || rLower.includes('cyber')) {
    return [
      `1. **Web Vulnerability Scanner & Security Audit Tool**: Automated scanner checking for OWASP Top 10 vulnerabilities (SQL injection, XSS, CSRF).`,
      `2. **Zero-Trust Role-Based Authentication Gateway**: Secure authentication proxy with multi-factor authentication, JWT rotation, and rate limiting.`,
      `3. **Security Information & Event Log Analyzer**: Python log parser detecting anomalous IP traffic and brute-force login attempts.`
    ].join('\n');
  }

  // Default to Software Engineering / Backend
  return [
    `1. **Production REST API with JWT Auth & Role-Based Access**: Build an API with user registration, password hashing with bcrypt, JWT token refresh, and input validation.`,
    `2. **Scalable E-Commerce Inventory & Order Service**: Design normalized MySQL tables, handle relational database transactions, and implement search indexing.`,
    `3. **Real-Time Notification Microservice**: Utilize Redis and WebSockets for real-time pub/sub delivery.`
  ].join('\n');
}

class AiAssistantService {
  /**
   * Generates a context-aware personalized response using the student's real profile,
   * skills, target role, roadmap, and gap analysis.
   */
  async processMessage(userId, userMessage) {
    // 1. Gather comprehensive student context
    const [userRows] = await db.query(
      `SELECT u.full_name, sp.education_level, sp.experience_level, sp.target_career_id, sp.interests, c.name as target_career_name
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN careers c ON sp.target_career_id = c.id
       WHERE u.id = ?`,
      [userId]
    );

    let effectiveCareerId = userRows[0]?.target_career_id;
    let targetRole = userRows[0]?.target_career_name;

    if (!effectiveCareerId) {
      effectiveCareerId = resolveCareerFromInterests(userRows[0]?.interests) || 7;
      const [cRow] = await db.query(`SELECT name FROM careers WHERE id = ?`, [effectiveCareerId]);
      targetRole = cRow[0]?.name || 'Mobile App Developer';
    }

    const user = {
      full_name: userRows[0]?.full_name || 'Student',
      target_career_id: effectiveCareerId,
      target_career_name: targetRole || 'Mobile App Developer'
    };

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
    const skillGap = await calculateSkillGap(userId, effectiveCareerId);
    const roadmap = await learningPathService.getRoadmap(userId, effectiveCareerId);

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
          `Completing this will directly close your skill gap for ${targetRole} and move you closer to job readiness.`;
      } else {
        reply = `You have completed all primary skills mapped to **${targetRole}**! Consider working on a production-grade Capstone Project from your portfolio or exploring advanced specializations.`;
      }
    } else if (qLower.includes('can i become') || qLower.includes('become a') || qLower.includes('role match')) {
      // Find matched role or default to student's target role
      const matchedRec = recommendations.find(r => qLower.includes(r.role_title.toLowerCase())) ||
                         recommendations.find(r => r.role_id === effectiveCareerId) ||
                         recommendations[0] || {};

      const roleName = matchedRec.role_title || targetRole;
      const matchScore = matchedRec.compatibility_score || skillGap.readinessScore || 70;
      const knownCount = (matchedRec.known_skills || []).length;

      reply = `Yes! With your current skill profile, your compatibility for **${roleName}** is **${matchScore}%**.\n\n` +
        `• **Skills you already master / have touched**: ${knownCount > 0 ? (matchedRec.known_skills || []).map(s => s.name).slice(0, 3).join(', ') : (skillRows.slice(0, 3).map(s => s.name).join(', ') || 'Foundational Programming')}\n` +
        `• **Remaining focus areas to be job-ready**: ${(matchedRec.missing_skills || []).slice(0, 3).map(s => s.name).join(', ') || 'Advanced architecture & portfolio projects'}\n\n` +
        `With consistent practice (~${matchedRec.estimated_weeks_to_ready || 8} weeks), you will be fully prepared for junior-to-mid ${roleName} positions!`;
    } else if (qLower.includes('what skills am i missing') || qLower.includes('missing skills') || qLower.includes('gap')) {
      const missingList = (skillGap.missingSkills || []).slice(0, 5).map(s => `• **${s.skill_name}** (Target: ${s.required_proficiency}%, Priority: ${s.priority})`).join('\n');
      const partialList = (skillGap.partialSkills || []).slice(0, 3).map(s => `• **${s.skill_name}** (Currently at ${s.current_proficiency}%, Need: ${s.required_proficiency}%)`).join('\n');

      reply = `For your chosen career goal as a **${targetRole}** (Current Readiness: **${skillGap.readinessScore}%**):\n\n` +
        `**Skills you are currently missing completely:**\n${missingList || 'None! You have touched all required benchmark skills.'}\n\n` +
        `**Skills you already know that need revision or deepening:**\n${partialList || 'All existing skills are at target proficiency.'}\n\n` +
        `*Notice that our engine never asks you to restart skills from scratch—we only recommend targeted advanced revision where your level requires it.*`;
    } else if (qLower.includes('project') || qLower.includes('build next') || qLower.includes('portfolio')) {
      const projectIdeas = getRoleSpecificProjects(targetRole);
      reply = `Based on your goal to become a **${targetRole}** and your knowledge of ${knownSkillsList.slice(0, 3).join(', ') || 'core fundamentals'}, here are the best projects to build:\n\n` +
        `${projectIdeas}\n\n` +
        `You can add completed projects to your portfolio in the **Projects & Assessments** portal!`;
    } else if (qLower.includes('react native') || qLower.includes('mobile')) {
      reply = `To excel in **React Native & Mobile Development**:\n\n` +
        `1. **Master React Fundamentals**: Components, Props, State, useEffect hooks, and Context API for global state.\n` +
        `2. **Core Mobile Primitives**: Learn \`View\`, \`Text\`, \`Image\`, \`ScrollView\`, and \`FlatList\` performance optimization.\n` +
        `3. **Native Navigation**: Use React Navigation (Native Stack, Bottom Tabs) for fluid iOS and Android screen flows.\n` +
        `4. **API Integration & Persistence**: Connect mobile apps to REST APIs, store tokens securely in AsyncStorage or Keychain, and handle offline states.`;
    } else if (qLower.includes('node.js') || qLower.includes('node')) {
      const nodeSkill = skillRows.find(s => s.name.toLowerCase() === 'node.js');
      const currentLevel = nodeSkill ? nodeSkill.proficiency_level : 60;

      reply = `To take your Node.js proficiency from **${currentLevel}%** to an Advanced **85%+**:\n\n` +
        `1. **Master the Event Loop**: Understand timers, I/O callbacks, and microtask vs macrotask execution order.\n` +
        `2. **Work with Streams & Buffers**: Practice streaming data with \`fs.createReadStream\` without overflowing memory.\n` +
        `3. **Production Middleware Patterns**: Build structured error-handling middlewares and JWT verification.\n` +
        `4. **Database Indexing**: Optimize asynchronous MySQL/MongoDB queries and prevent unhandled promise rejections.`;
    } else {
      reply = `Hello ${user.full_name}! As your **SkillPath AI** career advisor, I'm here to help you become job-ready for **${targetRole}**.\n\n` +
        `Currently, your readiness is **${skillGap.readinessScore}%** based on ${skillRows.length} assessed skills. ` +
        `Your top recommended roles right now are **${recommendations.slice(0, 3).map(r => `${r.role_title} (${r.compatibility_score}%)`).join(', ')}**.\n\n` +
        `Feel free to ask me:\n` +
        `• *"What should I learn next for ${targetRole}?"*\n` +
        `• *"What skills am I missing for ${targetRole}?"*\n` +
        `• *"Can I become a ${targetRole} with my current skills?"*\n` +
        `• *"Which project should I build next for my portfolio?"*`;
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
        target_career_id: effectiveCareerId,
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
