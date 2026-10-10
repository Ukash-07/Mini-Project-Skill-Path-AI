/**
 * Modular TF-IDF & Cosine Similarity Service
 * Computes content relevance scores between student target profiles/queries and course metadata.
 * Designed to be easily swapped with an external Python ML microservice if needed.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in',
  'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
  'about', 'above', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'course', 'learn', 'master', 'understanding', 'using', 'build', 'create'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  if (total === 0) return tf;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }
  return tf;
}

function computeIDF(documentsTokens) {
  const idf = {};
  const totalDocs = documentsTokens.length;
  if (totalDocs === 0) return idf;

  const docFrequency = {};
  for (const tokens of documentsTokens) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
    }
  }

  for (const token in docFrequency) {
    idf[token] = Math.log(1 + totalDocs / (1 + docFrequency[token])) + 1;
  }

  return idf;
}

function computeTFIDFVector(tf, idf) {
  const vector = {};
  for (const token in tf) {
    if (idf[token]) {
      vector[token] = tf[token] * idf[token];
    }
  }
  return vector;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key in vecA) {
    const valA = vecA[key];
    normA += valA * valA;
    if (vecB[key]) {
      dotProduct += valA * vecB[key];
    }
  }

  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculates relevance score (0-100) for courses against user target context
 */
function calculateCourseRelevance(userContextText, courses) {
  const queryTokens = tokenize(userContextText);
  const docsTokens = courses.map(c => tokenize(`${c.title} ${c.description} ${c.category} ${c.primary_skill_name || ''}`));

  const idf = computeIDF([queryTokens, ...docsTokens]);
  const queryVector = computeTFIDFVector(computeTF(queryTokens), idf);

  return courses.map((course, index) => {
    const courseVector = computeTFIDFVector(computeTF(docsTokens[index]), idf);
    const sim = cosineSimilarity(queryVector, courseVector);
    // Scale 0-1 similarity to 0-100 score with minimum baseline
    const score = Math.round(Math.min(100, Math.max(0, sim * 100 * 1.5 + 20)));
    return {
      courseId: course.id,
      relevanceScore: score
    };
  });
}

module.exports = {
  tokenize,
  calculateCourseRelevance
};
