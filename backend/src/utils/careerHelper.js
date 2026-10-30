/**
 * Career Helper Utilities
 * Maps interest domains to canonical target careers and resolves default career roles.
 */

const INTEREST_TO_CAREER_MAP = {
  'mobile development': 7, // Mobile App Developer
  'mobile': 7,
  'ai/ml': 11, // AI Engineer
  'artificial intelligence': 11,
  'machine learning': 10, // Machine Learning Engineer
  'data science': 9, // Data Scientist
  'data analyst': 8,
  'cybersecurity': 17, // Cybersecurity Analyst
  'security': 17,
  'cloud computing': 15, // Cloud Engineer
  'cloud': 15,
  'devops': 14, // DevOps Engineer
  'web development': 1, // Frontend Developer (or 3 Full Stack)
  'web': 1,
  'software engineering': 6 // Software Engineer
};

function resolveCareerFromInterests(interests) {
  if (!interests) return null;

  let list = interests;
  if (typeof interests === 'string') {
    try {
      list = JSON.parse(interests);
    } catch (e) {
      list = [interests];
    }
  }

  if (!Array.isArray(list) || list.length === 0) return null;

  for (const item of list) {
    if (!item || typeof item !== 'string') continue;
    const key = item.toLowerCase().trim();
    if (INTEREST_TO_CAREER_MAP[key]) {
      return INTEREST_TO_CAREER_MAP[key];
    }
    // Substring checks
    for (const [mapKey, careerId] of Object.entries(INTEREST_TO_CAREER_MAP)) {
      if (key.includes(mapKey) || mapKey.includes(key)) {
        return careerId;
      }
    }
  }

  return null;
}

module.exports = {
  INTEREST_TO_CAREER_MAP,
  resolveCareerFromInterests
};

