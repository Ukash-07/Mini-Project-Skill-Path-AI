const db = require('../config/database');

/**
 * Career Role Recommendation Engine
 * Calculates real compatibility percentages based on student's actual skills,
 * proficiency levels, interest domains, and career role requirements.
 */
async function calculateCareerRecommendations(userId) {
  // 1. Get student profile & interests
  const [profiles] = await db.query(
    `SELECT sp.*, u.full_name
     FROM student_profiles sp
     JOIN users u ON sp.user_id = u.id
     WHERE sp.user_id = ?`,
    [userId]
  );
  const profile = profiles[0] || {};
  let interests = [];
  try {
    interests = profile.interests ? JSON.parse(profile.interests) : [];
  } catch (e) {
    interests = [];
  }
  const weeklyHours = profile.weekly_learning_hours || 10;
  const targetCareerId = profile.target_career_id || null;

  // 2. Get student's current skills
  const [studentSkillsRows] = await db.query(
    `SELECT ss.skill_id, ss.proficiency_level, ss.status, s.name as skill_name, s.category
     FROM student_skills ss
     JOIN skills s ON ss.skill_id = s.id
     WHERE ss.user_id = ?`,
    [userId]
  );
  const studentSkillMap = new Map();
  studentSkillsRows.forEach(row => {
    studentSkillMap.set(row.skill_id, {
      proficiency: parseFloat(row.proficiency_level) || 0,
      name: row.skill_name,
      category: row.category,
      status: row.status
    });
  });

  // 3. Get all careers with their required skills
  const [careers] = await db.query(`SELECT * FROM careers ORDER BY id ASC`);
  const [careerSkills] = await db.query(
    `SELECT cs.*, s.name as skill_name, s.category as skill_category
     FROM career_skills cs
     JOIN skills s ON cs.skill_id = s.id
     ORDER BY cs.career_id ASC, cs.phase_order ASC, cs.importance_weight DESC`
  );

  const careerSkillGroup = new Map();
  careerSkills.forEach(cs => {
    if (!careerSkillGroup.has(cs.career_id)) {
      careerSkillGroup.set(cs.career_id, []);
    }
    careerSkillGroup.get(cs.career_id).push(cs);
  });

  // 4. Calculate compatibility for each career role
  const recommendations = [];

  for (const career of careers) {
    const requiredSkills = careerSkillGroup.get(career.id) || [];
    if (requiredSkills.length === 0) continue;

    let totalWeight = 0;
    let earnedWeight = 0;

    const knownSkills = [];
    const partialSkills = [];
    const missingSkills = [];
    let totalMissingPoints = 0;

    for (const req of requiredSkills) {
      const weight = parseFloat(req.importance_weight) || 0.5;
      const targetProf = parseFloat(req.required_proficiency) || 70;
      totalWeight += weight;

      const studentHas = studentSkillMap.get(req.skill_id);

      if (studentHas && studentHas.proficiency >= targetProf) {
        // Fully known / Mastered
        earnedWeight += weight * 1.0;
        knownSkills.push({
          skill_id: req.skill_id,
          name: req.skill_name,
          category: req.skill_category,
          current_proficiency: studentHas.proficiency,
          required_proficiency: targetProf,
          priority: req.priority,
          phase: req.phase_order
        });
      } else if (studentHas && studentHas.proficiency > 0) {
        // Partially known
        const matchRatio = studentHas.proficiency / targetProf;
        earnedWeight += weight * matchRatio;
        const gap = Math.round(targetProf - studentHas.proficiency);
        totalMissingPoints += gap;
        partialSkills.push({
          skill_id: req.skill_id,
          name: req.skill_name,
          category: req.skill_category,
          current_proficiency: studentHas.proficiency,
          required_proficiency: targetProf,
          gap,
          priority: req.priority,
          phase: req.phase_order
        });
      } else {
        // Missing completely
        totalMissingPoints += targetProf;
        missingSkills.push({
          skill_id: req.skill_id,
          name: req.skill_name,
          category: req.skill_category,
          required_proficiency: targetProf,
          priority: req.priority,
          phase: req.phase_order
        });
      }
    }

    // Base score from weighted skill matching
    let rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;

    // Bonus for interest domain alignment (+5% to +8%)
    let interestMatched = false;
    if (interests && interests.length > 0) {
      const cDomain = (career.domain || '').toLowerCase();
      const cCategory = (career.category || '').toLowerCase();
      for (const interest of interests) {
        const iLower = interest.toLowerCase();
        if (cDomain.includes(iLower) || cCategory.includes(iLower) || iLower.includes(cCategory)) {
          rawScore += 6;
          interestMatched = true;
          break;
        }
      }
    }

    // Target career alignment bonus
    if (targetCareerId && parseInt(targetCareerId) === career.id) {
      rawScore += 5;
    }

    // Clamp score
    const compatibilityScore = Math.min(98, Math.max(15, Math.round(rawScore)));

    // Realistic time to job-ready calculation
    // Assume 1 proficiency point requires ~0.75 study hours
    const estimatedStudyHours = Math.max(20, Math.round(totalMissingPoints * 0.75));
    const estimatedWeeks = Math.max(3, Math.ceil(estimatedStudyHours / Math.max(5, weeklyHours)));

    // Explainable natural language reason
    let whyRecommended = '';
    if (knownSkills.length > 0 && partialSkills.length > 0) {
      whyRecommended = `Strong match: You already master ${knownSkills.length} prerequisite skill${knownSkills.length > 1 ? 's' : ''} (${knownSkills.map(s => s.name).slice(0, 2).join(', ')}) and have foundational experience in ${partialSkills.length} others.`;
    } else if (knownSkills.length > 0) {
      whyRecommended = `Direct foundation: You have solid mastery in ${knownSkills.length} key skill${knownSkills.length > 1 ? 's' : ''} needed for this role.`;
    } else if (partialSkills.length > 0) {
      whyRecommended = `Good starter role: You already have partial knowledge in ${partialSkills.map(s => s.name).slice(0, 2).join(', ')}.`;
    } else if (interestMatched) {
      whyRecommended = `Aligned with your stated interest in ${career.domain}. A high-demand career path with structured learning milestones.`;
    } else {
      whyRecommended = `Structured career path with comprehensive 5-phase roadmap available for beginner-to-advanced progression.`;
    }

    let sampleProjects = [];
    try {
      sampleProjects = career.sample_projects ? JSON.parse(career.sample_projects) : [];
    } catch (e) {
      sampleProjects = [];
    }

    recommendations.push({
      role_id: career.id,
      role_title: career.name,
      description: career.description,
      domain: career.domain,
      category: career.category,
      difficulty: career.difficulty,
      estimated_prep_months: career.estimated_prep_months,
      compatibility_score: compatibilityScore,
      known_skills: knownSkills,
      partial_skills: partialSkills,
      missing_skills: missingSkills,
      total_required_skills: requiredSkills.length,
      estimated_study_hours: estimatedStudyHours,
      estimated_weeks_to_ready: estimatedWeeks,
      why_recommended: whyRecommended,
      prerequisites: career.prerequisites,
      sample_projects: sampleProjects,
      is_current_target: targetCareerId && parseInt(targetCareerId) === career.id
    });
  }

  // Sort descending by compatibility score
  recommendations.sort((a, b) => b.compatibility_score - a.compatibility_score);

  return recommendations;
}

module.exports = {
  calculateCareerRecommendations
};
