// Central Config for Hybrid Recommendation Engine
module.exports = {
  WEIGHTS: {
    SKILL_GAP: 0.30,
    PREREQUISITE_MATCH: 0.25,
    COURSE_RELEVANCE: 0.20,
    PERFORMANCE: 0.15,
    DIFFICULTY_FIT: 0.10
  },
  PROFICIENCY_LEVELS: {
    BEGINNER: { min: 0, max: 39, label: 'Beginner' },
    INTERMEDIATE: { min: 40, max: 69, label: 'Intermediate' },
    ADVANCED: { min: 70, max: 100, label: 'Advanced' }
  },
  DEFAULT_PASS_THRESHOLD: 60
};
