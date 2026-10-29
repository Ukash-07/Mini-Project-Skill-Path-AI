const { PDFParse } = require('pdf-parse');
const db = require('../config/database');
const { tokenize } = require('./tfidfService');

/**
 * Common tech aliases / synonyms for skill matching
 */
const SKILL_ALIASES = {
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'vanilla js'],
  'typescript': ['ts'],
  'react': ['reactjs', 'react.js'],
  'next.js': ['nextjs', 'next'],
  'node.js': ['nodejs', 'node'],
  'express.js': ['expressjs', 'express'],
  'html & css': ['html', 'css', 'html5', 'css3', 'sass', 'scss'],
  'tailwind css': ['tailwind', 'tailwindcss'],
  'python': ['py', 'python3'],
  'django': ['django rest framework', 'drf'],
  'fastapi': ['fast api'],
  'sql': ['rdbms', 'relational database'],
  'mysql': ['mariadb'],
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo', 'nosql document'],
  'docker': ['docker & containers', 'containerization'],
  'kubernetes': ['k8s'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
  'machine learning': ['ml', 'scikit-learn', 'deep learning'],
  'data structures & algorithms': ['dsa', 'data structures', 'algorithms'],
  'rest api architecture': ['rest', 'restful api', 'rest api', 'rest apis'],
  'jwt & authentication': ['jwt', 'oauth', 'authentication', 'auth0']
};

/**
 * Extract plain text from uploaded file buffer or direct text
 */
async function extractTextFromResume(file, rawText) {
  if (rawText && typeof rawText === 'string' && rawText.trim().length > 0) {
    return rawText.trim();
  }

  if (!file || !file.buffer) {
    throw new Error('Please upload a resume file (PDF or text) or paste your resume content.');
  }

  const mimeType = file.mimetype || '';
  const originalName = (file.originalname || '').toLowerCase();

  if (mimeType.includes('pdf') || originalName.endsWith('.pdf')) {
    try {
      const parser = new PDFParse({ data: file.buffer });
      const parsed = await parser.getText();
      if (parsed && parsed.text && parsed.text.trim().length > 0) {
        return parsed.text.trim();
      }
    } catch (pdfErr) {
      console.warn('PDFParse failed, falling back to text buffer conversion:', pdfErr.message);
    }
  }

  // Fallback to text decoding
  const decoded = file.buffer.toString('utf-8');
  // Strip non-printable binary characters if raw binary was read
  const cleaned = decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
  if (cleaned.length < 20) {
    throw new Error('Could not extract readable text from the uploaded file. Please paste your resume text directly or upload a valid PDF/text document.');
  }
  return cleaned;
}

/**
 * Detect contact / header info from resume
 */
function extractResumeMetadata(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const phoneRegex = /(\+?[0-9]{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;
  const githubRegex = /(github\.com\/[a-zA-Z0-9_-]+)/i;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  const githubMatch = text.match(githubRegex);

  // Guess experience level
  const lower = text.toLowerCase();
  let estimatedLevel = 'Entry / Junior';
  if (/senior|lead|principal|architect|5\+\s*years|6\+\s*years|7\+\s*years|8\+\s*years/i.test(lower)) {
    estimatedLevel = 'Senior Level';
  } else if (/mid-level|mid level|2\+\s*years|3\+\s*years|4\+\s*years/i.test(lower)) {
    estimatedLevel = 'Mid Level';
  } else if (/intern|student|fresh graduate|junior|fresher|entry-level|entry level/i.test(lower)) {
    estimatedLevel = 'Entry / Junior';
  }

  // Word count & estimated reading time
  const words = text.split(/\s+/).filter(Boolean);

  return {
    detected_email: emailMatch ? emailMatch[1] : null,
    detected_phone: phoneMatch ? phoneMatch[0] : null,
    detected_linkedin: linkedinMatch ? linkedinMatch[1] : null,
    detected_github: githubMatch ? githubMatch[1] : null,
    estimated_level: estimatedLevel,
    word_count: words.length
  };
}

/**
 * Identify skills present in resume text by comparing against DB skills catalog
 */
function extractSkillsFromText(text, allSkills) {
  const lowerText = text.toLowerCase();
  const detectedSkills = [];
  const detectedSkillIds = new Set();

  for (const skill of allSkills) {
    const skillNameLower = skill.name.toLowerCase();
    const aliases = SKILL_ALIASES[skillNameLower] || [];
    const searchTerms = [skillNameLower, ...aliases];

    let isMatched = false;
    let matchEvidence = '';

    for (const term of searchTerms) {
      // Escape regex special chars
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // If term is short (<= 3 chars, e.g. "js", "ts", "ml", "aws"), require strict word boundaries
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');

      if (regex.test(lowerText)) {
        isMatched = true;
        matchEvidence = term;
        break;
      }
    }

    if (isMatched && !detectedSkillIds.has(skill.id)) {
      detectedSkillIds.add(skill.id);

      // Estimate initial proficiency (65-85)
      // Boost if mentioned multiple times or near keywords like "experience", "built", "production"
      let proficiency = 70;
      if (lowerText.includes(`senior ${matchEvidence}`) || lowerText.includes(`advanced ${matchEvidence}`)) {
        proficiency = 90;
      } else if (lowerText.includes(`proficient in ${matchEvidence}`) || lowerText.includes(`experienced with ${matchEvidence}`)) {
        proficiency = 80;
      }

      detectedSkills.push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        difficulty: skill.difficulty,
        detected_via: matchEvidence,
        estimated_proficiency: proficiency
      });
    }
  }

  return detectedSkills;
}

/**
 * Compute cosine similarity between query text tokens and target text tokens
 */
function computeCosineSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (!tokensA.length || !tokensB.length) return 0;

  const freqA = {};
  const freqB = {};

  for (const t of tokensA) freqA[t] = (freqA[t] || 0) + 1;
  for (const t of tokensB) freqB[t] = (freqB[t] || 0) + 1;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const t in freqA) {
    normA += freqA[t] * freqA[t];
    if (freqB[t]) {
      dotProduct += freqA[t] * freqB[t];
    }
  }
  for (const t in freqB) {
    normB += freqB[t] * freqB[t];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Analyze resume text, extract skills, and compute match against all careers
 */
async function analyzeResume({ file, rawText, userId }) {
  // 1. Extract text
  const text = await extractTextFromResume(file, rawText);
  const metadata = extractResumeMetadata(text);

  // 2. Load all skills from DB
  const [allSkills] = await db.query(`SELECT id, name, category, difficulty FROM skills ORDER BY name ASC`);

  // 3. Extract matching skills
  const extractedSkills = extractSkillsFromText(text, allSkills);
  const extractedSkillMap = new Map();
  extractedSkills.forEach((s) => extractedSkillMap.set(s.id, s));

  // 4. Load all careers and their required skills
  const [careers] = await db.query(`SELECT * FROM careers ORDER BY domain ASC, name ASC`);
  const [careerSkills] = await db.query(`
    SELECT cs.career_id, cs.skill_id, cs.required_proficiency, cs.importance_weight, cs.priority, cs.phase_order,
           s.name as skill_name, s.category as skill_category, s.difficulty as skill_difficulty
    FROM career_skills cs
    JOIN skills s ON cs.skill_id = s.id
    ORDER BY cs.career_id ASC, cs.phase_order ASC, cs.importance_weight DESC
  `);

  // Group career skills
  const careerSkillsMap = new Map();
  for (const cs of careerSkills) {
    if (!careerSkillsMap.has(cs.career_id)) {
      careerSkillsMap.set(cs.career_id, []);
    }
    careerSkillsMap.get(cs.career_id).push(cs);
  }

  // 5. Calculate match for each career
  const careerMatches = [];

  for (const career of careers) {
    const required = careerSkillsMap.get(career.id) || [];
    if (required.length === 0) continue;

    const matchedSkills = [];
    const missingSkills = [];

    let totalWeight = 0;
    let earnedWeight = 0;
    let missingWeight = 0;

    for (const req of required) {
      const weight = parseFloat(req.importance_weight) || 0.5;
      totalWeight += weight;

      if (extractedSkillMap.has(req.skill_id)) {
        const studentSkill = extractedSkillMap.get(req.skill_id);
        earnedWeight += weight;
        matchedSkills.push({
          id: req.skill_id,
          name: req.skill_name,
          category: req.skill_category,
          priority: req.priority,
          phase: req.phase_order,
          proficiency: studentSkill.estimated_proficiency
        });
      } else {
        missingWeight += weight;
        missingSkills.push({
          id: req.skill_id,
          name: req.skill_name,
          category: req.skill_category,
          priority: req.priority,
          phase: req.phase_order,
          required_proficiency: req.required_proficiency
        });
      }
    }

    // Skill match score (0 - 100)
    const skillScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;

    // Content TF-IDF similarity between resume text and career description/domain
    const careerContext = `${career.name} ${career.domain} ${career.category} ${career.description || ''} ${career.prerequisites || ''}`;
    const similarity = computeCosineSimilarity(text, careerContext);
    const contentScore = Math.min(100, Math.round(similarity * 100 * 1.8));

    // Blended overall match score (80% skills + 20% semantic context)
    let rawFinalScore = Math.round(skillScore * 0.8 + contentScore * 0.2);

    // If candidate has matched high-priority skills, apply realistic baseline
    if (matchedSkills.length > 0 && rawFinalScore < 20) {
      rawFinalScore = Math.min(35, Math.round((matchedSkills.length / required.length) * 100));
    }

    const matchPercentage = Math.min(98, Math.max(10, rawFinalScore));

    // Determine Job Readiness Level
    let readinessLevel = 'Exploratory Match';
    let readinessBadgeColor = 'slate';
    if (matchPercentage >= 80) {
      readinessLevel = 'Job Ready / High Match';
      readinessBadgeColor = 'emerald';
    } else if (matchPercentage >= 60) {
      readinessLevel = 'Strong Candidate / Near Ready';
      readinessBadgeColor = 'indigo';
    } else if (matchPercentage >= 40) {
      readinessLevel = 'Developing / Foundation Match';
      readinessBadgeColor = 'amber';
    }

    // Natural language explanation
    let matchReason = '';
    if (matchedSkills.length === required.length) {
      matchReason = `Outstanding 100% skill match! Your resume covers all ${required.length} required skills for ${career.name}.`;
    } else if (matchedSkills.length > 0) {
      const topMatchedNames = matchedSkills.slice(0, 3).map((s) => s.name).join(', ');
      matchReason = `Your resume demonstrates core capabilities in ${topMatchedNames}. Bridging ${missingSkills.length} remaining skill${missingSkills.length > 1 ? 's' : ''} (${missingSkills.slice(0, 2).map((s) => s.name).join(', ')}) will make you a prime candidate.`;
    } else {
      matchReason = `Entry-friendly career in ${career.domain}. Learn the key phase 1 skills to begin your transition into this role.`;
    }

    // Estimated preparation weeks to bridge missing skills
    const estimatedWeeks = Math.max(2, Math.ceil(missingSkills.length * 2.5));

    careerMatches.push({
      career_id: career.id,
      career_name: career.name,
      domain: career.domain,
      category: career.category,
      difficulty: career.difficulty,
      estimated_prep_months: career.estimated_prep_months,
      match_percentage: matchPercentage,
      readiness_level: readinessLevel,
      readiness_badge_color: readinessBadgeColor,
      matched_skills_count: matchedSkills.length,
      total_skills_count: required.length,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      match_reason: matchReason,
      estimated_weeks_to_ready: estimatedWeeks,
      description: career.description
    });
  }

  // Sort descending by match percentage
  careerMatches.sort((a, b) => b.match_percentage - a.match_percentage);

  return {
    metadata: {
      ...metadata,
      total_skills_detected: extractedSkills.length,
      top_job_match: careerMatches[0] ? careerMatches[0].career_name : null,
      top_match_percentage: careerMatches[0] ? careerMatches[0].match_percentage : 0
    },
    detected_skills: extractedSkills,
    job_matches: careerMatches,
    top_matches: careerMatches.slice(0, 5),
    resume_preview: text.slice(0, 600) + (text.length > 600 ? '...' : '')
  };
}

/**
 * Import detected skills into student's profile (student_skills table)
 */
async function importSkillsToProfile(userId, skillsToImport) {
  if (!Array.isArray(skillsToImport) || skillsToImport.length === 0) {
    throw new Error('No skills selected for import.');
  }

  let importedCount = 0;
  for (const skill of skillsToImport) {
    const skillId = skill.id || skill.skill_id;
    const prof = parseInt(skill.proficiency || skill.estimated_proficiency || 70);
    const status = prof >= 70 ? 'Advanced' : prof >= 40 ? 'Intermediate' : 'Beginner';

    if (skillId) {
      await db.query(
        `INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level), status = VALUES(status)`,
        [userId, skillId, prof, status]
      );
      importedCount++;
    }
  }

  return { importedCount };
}

module.exports = {
  extractTextFromResume,
  analyzeResume,
  importSkillsToProfile
};

