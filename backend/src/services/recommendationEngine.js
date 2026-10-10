const db = require('../config/database');
const { WEIGHTS, PROFICIENCY_LEVELS } = require('../config/recommendationConfig');
const { calculateSkillGap } = require('./skillGapService');
const { calculateCourseRelevance } = require('./tfidfService');

class RecommendationEngine {
  /**
   * Main entry point to generate ranked course recommendations for a student
   */
  async generateRecommendations(userId) {
    // 1. Fetch Student Profile, Career, Skills, and Preferences
    const [profileRows] = await db.query(
      `SELECT sp.*, u.full_name, c.name as career_name, c.description as career_description
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN careers c ON sp.target_career_id = c.id
       WHERE sp.user_id = ?`,
      [userId]
    );

    if (profileRows.length === 0) {
      return { recommendations: [], message: 'Student profile not found' };
    }

    const studentProfile = profileRows[0];
    const targetCareerId = studentProfile.target_career_id;

    // 2. Fetch Skill Gap Analysis
    const skillGapAnalysis = await calculateSkillGap(userId, targetCareerId);
    const skillGapMap = {};
    skillGapAnalysis.skillGaps.forEach(sg => {
      skillGapMap[sg.skill_id] = sg;
    });

    // 3. Fetch Completed & Enrolled Courses
    const [enrollmentRows] = await db.query(
      `SELECT course_id, status FROM enrollments WHERE user_id = ?`,
      [userId]
    );
    const completedCourseIds = new Set(
      enrollmentRows.filter(e => e.status === 'completed').map(e => e.course_id)
    );
    const activeCourseIds = new Set(
      enrollmentRows.filter(e => e.status === 'active').map(e => e.course_id)
    );

    // 4. Fetch Student's Quiz and Assessment Performance History
    const [quizPerfRows] = await db.query(
      `SELECT q.module_id, m.course_id, c.primary_skill_id, qa.score_percentage
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN modules m ON q.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE qa.user_id = ?
       ORDER BY qa.attempted_at DESC`,
      [userId]
    );

    const skillPerformanceMap = {};
    quizPerfRows.forEach(row => {
      if (!skillPerformanceMap[row.primary_skill_id]) {
        skillPerformanceMap[row.primary_skill_id] = parseFloat(row.score_percentage);
      }
    });

    // 5. Fetch Full Course Catalog with Primary Skills
    const [courses] = await db.query(
      `SELECT c.*, s.name as primary_skill_name, s.difficulty as skill_difficulty, s.category as skill_category
       FROM courses c
       JOIN skills s ON c.primary_skill_id = s.id
       WHERE c.status = 'published'`
    );

    // 6. Compute Relevance using TF-IDF for all courses
    const userTargetContext = `${studentProfile.career_name || ''} ${studentProfile.career_description || ''} ${studentProfile.experience_level || ''}`;
    const relevanceScores = calculateCourseRelevance(userTargetContext, courses);
    const relevanceMap = {};
    relevanceScores.forEach(r => { relevanceMap[r.courseId] = r.relevanceScore; });

    // 7. Fetch All Course Prerequisites
    const [prereqRows] = await db.query(
      `SELECT cp.*, c.title as required_course_title, s.name as required_skill_name
       FROM course_prerequisites cp
       LEFT JOIN courses c ON cp.required_course_id = c.id
       LEFT JOIN skills s ON cp.required_skill_id = s.id`
    );

    const coursePrereqsMap = {};
    prereqRows.forEach(p => {
      if (!coursePrereqsMap[p.course_id]) coursePrereqsMap[p.course_id] = [];
      coursePrereqsMap[p.course_id].push(p);
    });

    // 8. Calculate Component Scores for Candidate Courses
    const candidateCourses = courses.filter(c => !completedCourseIds.has(c.id));

    const scoredCourses = candidateCourses.map(course => {
      const skillGapInfo = skillGapMap[course.primary_skill_id] || {
        gap: 0,
        required_proficiency: 50,
        current_proficiency: 0,
        importance_weight: 0.3
      };

      // Component 1: Skill Gap Score (0-100)
      const maxGap = Math.max(1, parseFloat(skillGapInfo.required_proficiency) || 50);
      const impWeight = parseFloat(skillGapInfo.importance_weight) || 0.5;
      const gapVal = parseFloat(skillGapInfo.gap) || 0;
      const skillGapScore = Math.min(100, Math.max(0, Math.round((gapVal / maxGap) * 100 * (0.5 + impWeight))));

      // Component 2: Prerequisite Match Score (0-100)
      const prereqs = coursePrereqsMap[course.id] || [];
      let missingPrereqCount = 0;
      let missingPrereqNames = [];

      prereqs.forEach(p => {
        if (p.required_course_id && !completedCourseIds.has(p.required_course_id)) {
          missingPrereqCount++;
          missingPrereqNames.push(p.required_course_title || 'Prerequisite Course');
        }
        if (p.required_skill_id) {
          const studentSkill = skillGapMap[p.required_skill_id];
          if (!studentSkill || studentSkill.current_proficiency < (p.min_proficiency || 40)) {
            missingPrereqCount++;
            missingPrereqNames.push(p.required_skill_name || 'Prerequisite Skill');
          }
        }
      });

      const prerequisiteMatchScore = prereqs.length === 0 ? 100 : Math.max(0, 100 - (missingPrereqCount * 40));

      // Component 3: Course Relevance Score (TF-IDF)
      const relevanceScore = relevanceMap[course.id] || 50;

      // Component 4: Performance Score (0-100)
      const pastPerf = skillPerformanceMap[course.primary_skill_id];
      let performanceScore = 60;
      if (pastPerf !== undefined) {
        if (pastPerf < 40) {
          // Weak quiz performance -> high priority for foundational/intermediate revision
          performanceScore = course.difficulty === 'Beginner' ? 95 : 40;
        } else if (pastPerf >= 70) {
          // Strong past performance -> higher priority for next level
          performanceScore = course.difficulty === 'Advanced' ? 90 : 65;
        } else {
          performanceScore = 75;
        }
      }

      // Component 5: Difficulty Fit Score (0-100)
      const currentProf = skillGapInfo.current_proficiency;
      let difficultyFitScore = 70;
      if (currentProf < 40) {
        difficultyFitScore = course.difficulty === 'Beginner' ? 100 : (course.difficulty === 'Intermediate' ? 60 : 30);
      } else if (currentProf < 70) {
        difficultyFitScore = course.difficulty === 'Intermediate' ? 100 : (course.difficulty === 'Beginner' ? 70 : 60);
      } else {
        difficultyFitScore = course.difficulty === 'Advanced' ? 100 : (course.difficulty === 'Intermediate' ? 80 : 50);
      }

      // Hybrid Recommendation Score Formula
      const rawTotal = (
        (WEIGHTS.SKILL_GAP || 0.3) * (skillGapScore || 0) +
        (WEIGHTS.PREREQUISITE_MATCH || 0.25) * (prerequisiteMatchScore || 0) +
        (WEIGHTS.COURSE_RELEVANCE || 0.20) * (relevanceScore || 0) +
        (WEIGHTS.PERFORMANCE || 0.15) * (performanceScore || 0) +
        (WEIGHTS.DIFFICULTY_FIT || 0.10) * (difficultyFitScore || 0)
      );
      const totalScore = isNaN(rawTotal) ? 50 : Math.min(100, Math.max(10, Math.round(rawTotal)));

      // Generate Natural Language Explanation
      const reasons = [];
      if (skillGapInfo.gap > 0) {
        reasons.push(`Your ${skillGapInfo.skill_name || 'core'} proficiency is currently ${skillGapInfo.current_proficiency || 0}% (Target: ${skillGapInfo.required_proficiency || 70}%).`);
      }
      if (studentProfile.career_name) {
        reasons.push(`${skillGapInfo.skill_name || course.primary_skill_name} is a high-priority skill for your career path (${studentProfile.career_name}).`);
      }
      if (prereqs.length > 0 && missingPrereqCount === 0) {
        reasons.push(`You have satisfied all prerequisite courses and skills for this course.`);
      } else if (missingPrereqCount > 0) {
        reasons.push(`Missing prerequisite: ${missingPrereqNames.join(', ')}.`);
      }
      if (pastPerf !== undefined && pastPerf < 40) {
        reasons.push(`Recommended to strengthen foundational skills after scoring ${pastPerf}% in recent quizzes.`);
      }
      reasons.push(`Course difficulty (${course.difficulty}) matches your current skill level.`);

      return {
        course,
        recommendation_score: totalScore,
        breakdown: {
          skill_gap_score: isNaN(skillGapScore) ? 0 : skillGapScore,
          prerequisite_match_score: isNaN(prerequisiteMatchScore) ? 100 : prerequisiteMatchScore,
          relevance_score: isNaN(relevanceScore) ? 50 : relevanceScore,
          performance_score: isNaN(performanceScore) ? 60 : performanceScore,
          difficulty_fit_score: isNaN(difficultyFitScore) ? 70 : difficultyFitScore
        },
        reasons,
        is_enrolled: activeCourseIds.has(course.id),
        has_missing_prerequisites: missingPrereqCount > 0,
        missing_prerequisites: missingPrereqNames
      };
    });

    // Sort by Recommendation Score descending
    scoredCourses.sort((a, b) => b.recommendation_score - a.recommendation_score);

    // Save Top Recommendations to Database
    for (const item of scoredCourses.slice(0, 10)) {
      await db.query(
        `INSERT INTO recommendations
         (user_id, course_id, recommendation_score, skill_gap_score, prerequisite_match_score, relevance_score, performance_score, difficulty_fit_score, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          recommendation_score = VALUES(recommendation_score),
          skill_gap_score = VALUES(skill_gap_score),
          prerequisite_match_score = VALUES(prerequisite_match_score),
          relevance_score = VALUES(relevance_score),
          performance_score = VALUES(performance_score),
          difficulty_fit_score = VALUES(difficulty_fit_score),
          explanation = VALUES(explanation)`,
        [
          userId,
          item.course.id,
          isNaN(item.recommendation_score) ? 50 : item.recommendation_score,
          isNaN(item.breakdown.skill_gap_score) ? 50 : item.breakdown.skill_gap_score,
          isNaN(item.breakdown.prerequisite_match_score) ? 50 : item.breakdown.prerequisite_match_score,
          isNaN(item.breakdown.relevance_score) ? 50 : item.breakdown.relevance_score,
          isNaN(item.breakdown.performance_score) ? 50 : item.breakdown.performance_score,
          isNaN(item.breakdown.difficulty_fit_score) ? 50 : item.breakdown.difficulty_fit_score,
          JSON.stringify(item.reasons || [])
        ]
      );
    }

    return {
      recommendations: scoredCourses,
      targetCareer: studentProfile.career_name,
      overallSkillGapPercentage: skillGapAnalysis.overallGapPercentage
    };
  }

  /**
   * Helper function for explanation breakdown endpoint
   */
  generateExplanation(recItem) {
    return {
      score: recItem.recommendation_score,
      reasons: recItem.reasons,
      breakdown: recItem.breakdown
    };
  }
}

module.exports = new RecommendationEngine();
