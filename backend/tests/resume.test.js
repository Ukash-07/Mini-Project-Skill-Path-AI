const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const resumeService = require('../src/services/resumeService');
const db = require('../src/config/database');

after(async () => {
  await db.end();
});

test('Resume Analyzer: Extracts skills and matches career roles from text', async () => {
  const sampleResumeText = `
    Alex Morgan
    Email: alex.morgan@example.com | Phone: 555-123-4567 | github.com/alexm
    Senior Full Stack Software Engineer with 4 years of experience.
    
    Technical Skills:
    - Programming Languages: JavaScript, TypeScript, Python
    - Frontend Development: React, Next.js, HTML & CSS, Tailwind CSS
    - Backend Development: Node.js, Express.js, REST API Architecture, JWT & Authentication
    - Databases: SQL, PostgreSQL, MongoDB
    - DevOps & Tools: Docker, Git, AWS
    
    Experience:
    Built high-scale web platforms using React, Node.js, and PostgreSQL.
    Designed microservices with Docker and deployed to AWS.
  `;

  const result = await resumeService.analyzeResume({ rawText: sampleResumeText });

  assert.ok(result);
  assert.ok(result.detected_skills.length > 0);
  assert.equal(result.metadata.detected_email, 'alex.morgan@example.com');
  assert.ok(result.job_matches.length > 0);

  // Check that detected skills include React, Node.js, JavaScript
  const skillNames = result.detected_skills.map((s) => s.name);
  assert.ok(skillNames.includes('React'));
  assert.ok(skillNames.includes('JavaScript'));
  assert.ok(skillNames.includes('Node.js'));

  // Top match should have a high match percentage (>= 50%)
  const topMatch = result.job_matches[0];
  assert.ok(topMatch.match_percentage >= 50);
  assert.ok(topMatch.matched_skills.length > 0);
  assert.ok(topMatch.match_reason);
});

test('Resume Analyzer: Successfully imports detected skills into student profile', async () => {
  // Get an existing student or create a temporary one
  let [students] = await db.query(`SELECT id FROM users WHERE role = 'student' LIMIT 1`);
  let studentId;
  if (students.length > 0) {
    studentId = students[0].id;
  } else {
    const [res] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ('Test Student', 'test_resume_student@example.com', 'fakehash', 'student')`
    );
    studentId = res.insertId;
  }

  const skillsToImport = [
    { id: 2, name: 'JavaScript', estimated_proficiency: 80 },
    { id: 4, name: 'React', estimated_proficiency: 75 }
  ];

  const result = await resumeService.importSkillsToProfile(studentId, skillsToImport);
  assert.ok(result.importedCount >= 2);

  // Check in student_skills table
  const [rows] = await db.query(
    `SELECT * FROM student_skills WHERE user_id = ? AND skill_id IN (2, 4)`,
    [studentId]
  );
  assert.ok(rows.length >= 2);
});
