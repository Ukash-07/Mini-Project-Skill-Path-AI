-- SkillPath AI Full Database Schema & Seed Data
CREATE DATABASE IF NOT EXISTS learning_path_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learning_path_db;

-- Database Schema for SkillPath AI - AI-Based Personalized Learning Path Recommendation Engine
CREATE DATABASE IF NOT EXISTS learning_path_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learning_path_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Careers Table (Career Roles Catalog)
CREATE TABLE IF NOT EXISTS careers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Technology',
    domain VARCHAR(100) DEFAULT 'Web and Software Development',
    difficulty ENUM('Beginner-Friendly', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    estimated_prep_months INT DEFAULT 4,
    prerequisites TEXT,
    sample_projects TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_career_domain (domain)
) ENGINE=InnoDB;

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    is_custom TINYINT(1) DEFAULT 0,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_category (category)
) ENGINE=InnoDB;

-- 4. Career Skills (Target Benchmarks per Career Role)
CREATE TABLE IF NOT EXISTS career_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    career_id INT NOT NULL,
    skill_id INT NOT NULL,
    required_proficiency INT NOT NULL DEFAULT 70 COMMENT '0 to 100',
    importance_weight DECIMAL(3,2) DEFAULT 0.50 COMMENT '0.00 to 1.00',
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'High',
    phase_order INT DEFAULT 1 COMMENT 'Roadmap phase 1 to 5',
    prerequisites TEXT,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uk_career_skill (career_id, skill_id)
) ENGINE=InnoDB;

-- 5. Skill Prerequisites (Hierarchical Graph)
CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT NOT NULL,
    prerequisite_skill_id INT NOT NULL,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uk_skill_prereq (skill_id, prerequisite_skill_id)
) ENGINE=InnoDB;

-- 6. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    education_level VARCHAR(100),
    current_qualification VARCHAR(100),
    experience_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    target_career_id INT,
    interests TEXT COMMENT 'JSON array of selected interest domains',
    preferred_learning_style VARCHAR(50) DEFAULT 'Interactive Courses',
    weekly_learning_hours INT DEFAULT 10,
    onboarding_completed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_career_id) REFERENCES careers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Student Preferences
CREATE TABLE IF NOT EXISTS student_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    daily_learning_time_min INT DEFAULT 60,
    preferred_difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    preferred_format VARCHAR(50) DEFAULT 'Interactive',
    target_completion_weeks INT DEFAULT 12,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Student Skills (Current Assessed Skill Matrix)
CREATE TABLE IF NOT EXISTS student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level INT NOT NULL DEFAULT 0 COMMENT '0 to 100',
    status ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    last_assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_skill (user_id, skill_id)
) ENGINE=InnoDB;

-- 9. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(255) NOT NULL,
    type ENUM('Videos', 'Documentation', 'Projects', 'Interactive Courses') DEFAULT 'Documentation',
    platform VARCHAR(100) DEFAULT 'Official Docs',
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    duration_minutes INT DEFAULT 45,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_resource_skill (skill_id),
    INDEX idx_resource_type (type)
) ENGINE=InnoDB;

-- 10. Student Projects (Portfolio)
CREATE TABLE IF NOT EXISTS student_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    career_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    skills_used VARCHAR(255),
    repo_url VARCHAR(255),
    demo_url VARCHAR(255),
    status ENUM('in_progress', 'completed') DEFAULT 'completed',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. AI Assistant Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_user (user_id)
) ENGINE=InnoDB;

-- 12. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    primary_skill_id INT NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    duration_hours DECIMAL(4,1) NOT NULL DEFAULT 5.0,
    category VARCHAR(50) NOT NULL,
    thumbnail_url VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 4.5,
    status ENUM('published', 'draft') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_course_category (category),
    INDEX idx_course_difficulty (difficulty)
) ENGINE=InnoDB;

-- 13. Course Skills (Additional Skills Taught)
CREATE TABLE IF NOT EXISTS course_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_gain INT DEFAULT 20 COMMENT 'Level boost on completion',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uk_course_skill (course_id, skill_id)
) ENGINE=InnoDB;

-- 14. Course Prerequisites
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    required_course_id INT,
    required_skill_id INT,
    min_proficiency INT DEFAULT 40,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (required_course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (required_skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Modules Table
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    module_order INT DEFAULT 1,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    video_url VARCHAR(255),
    duration_minutes INT DEFAULT 15,
    lesson_order INT DEFAULT 1,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 17. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    pass_threshold INT DEFAULT 60,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. Quiz Options Table
CREATE TABLE IF NOT EXISTS quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 20. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    passed TINYINT(1) DEFAULT 0,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    career_id INT,
    skill_id INT,
    total_marks INT DEFAULT 100,
    duration_minutes INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 22. Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    skill_id INT NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    question_text TEXT NOT NULL,
    marks INT DEFAULT 10,
    explanation TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 23. Assessment Options Table
CREATE TABLE IF NOT EXISTS assessment_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 24. Assessment Attempts Table
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_id INT NOT NULL,
    score_raw INT NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    calculated_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 25. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_course (user_id, course_id)
) ENGINE=InnoDB;

-- 26. Lesson Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completed TINYINT(1) DEFAULT 1,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_lesson (user_id, lesson_id)
) ENGINE=InnoDB;

-- 27. Course Progress Table
CREATE TABLE IF NOT EXISTS course_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed TINYINT(1) DEFAULT 0,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_course_progress (user_id, course_id)
) ENGINE=InnoDB;

-- 28. Learning Paths Table
CREATE TABLE IF NOT EXISTS learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    target_career_id INT NOT NULL,
    overall_progress DECIMAL(5,2) DEFAULT 0.00,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_career_id) REFERENCES careers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 29. Learning Path Items Table
CREATE TABLE IF NOT EXISTS learning_path_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    learning_path_id INT NOT NULL,
    course_id INT NULL,
    skill_id INT NOT NULL,
    step_order INT NOT NULL,
    phase_number INT DEFAULT 1,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'High',
    status ENUM('completed', 'current', 'recommended', 'locked', 'needs_revision') DEFAULT 'recommended',
    reason_explanation TEXT,
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uk_path_step (learning_path_id, step_order)
) ENGINE=InnoDB;

-- 30. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    recommendation_score DECIMAL(5,2) NOT NULL,
    skill_gap_score DECIMAL(5,2) NOT NULL,
    prerequisite_match_score DECIMAL(5,2) NOT NULL,
    relevance_score DECIMAL(5,2) NOT NULL,
    performance_score DECIMAL(5,2) NOT NULL,
    difficulty_fit_score DECIMAL(5,2) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_rec_course (user_id, course_id)
) ENGINE=InnoDB;

-- 31. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    type VARCHAR(50) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (1, 1, 'Await executes synchronous threads in background web workers', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (2, 1, 'Await suspends execution and queues continuation as a microtask', 1) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (3, 1, 'Await converts asynchronous code into blocking OS kernel processes', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (4, 2, 'It waits for p1 to finish before reporting the error', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (5, 2, 'It immediately rejects with the first rejection reason', 1) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (6, 3, 'Streams allow constant memory consumption regardless of file size', 1) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (7, 3, 'Streams encrypt data before sending across networks', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (8, 4, 'To prevent duplicate primary keys in the child table', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (9, 4, 'To speed up JOIN lookups and cascade checks from linear to logarithmic time', 1) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (10, 5, 'READ UNCOMMITTED', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (11, 5, 'READ COMMITTED', 0) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES (12, 5, 'SERIALIZABLE', 1) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `assessment_questions` (`id`, `assessment_id`, `skill_id`, `difficulty`, `question_text`, `marks`, `explanation`) VALUES (1, 1, 2, 'Intermediate', 'Which statement accurately describes the JavaScript Event Loop when executing async/await code?', 10, 'Await suspends execution of the enclosing async function and queues the continuation as a microtask.') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_questions` (`id`, `assessment_id`, `skill_id`, `difficulty`, `question_text`, `marks`, `explanation`) VALUES (2, 1, 2, 'Intermediate', 'What will Promise.all([p1, p2]) do if p2 rejects while p1 is still pending?', 10, 'Promise.all immediately rejects with p2 error as soon as any promise in the array fails.') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_questions` (`id`, `assessment_id`, `skill_id`, `difficulty`, `question_text`, `marks`, `explanation`) VALUES (3, 1, 7, 'Intermediate', 'In Node.js, what is the primary benefit of Streams over buffer-based readFileSync?', 10, 'Streams process data piece-by-piece in memory chunks without buffering entire multi-gigabyte files into RAM.') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_questions` (`id`, `assessment_id`, `skill_id`, `difficulty`, `question_text`, `marks`, `explanation`) VALUES (4, 2, 17, 'Intermediate', 'What is the purpose of an INDEX on a foreign key column in MySQL?', 10, 'Indexes accelerate JOIN operations and foreign key constraint validations dramatically from O(N) to O(log N).') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessment_questions` (`id`, `assessment_id`, `skill_id`, `difficulty`, `question_text`, `marks`, `explanation`) VALUES (5, 2, 18, 'Intermediate', 'What isolation level prevents dirty reads, non-repeatable reads, and phantom reads?', 10, 'SERIALIZABLE is the highest isolation level that prevents all read anomalies.') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `assessments` (`id`, `title`, `career_id`, `skill_id`, `total_marks`, `duration_minutes`, `created_at`) VALUES (1, 'Backend JavaScript & Node.js Proficiency Benchmark', 2, 2, 50, 25, '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `assessments` (`id`, `title`, `career_id`, `skill_id`, `total_marks`, `duration_minutes`, `created_at`) VALUES (2, 'SQL & Relational Database Mastery Assessment', 2, 17, 50, 25, '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (1, 1, 1, 85, '0.90', 'High', 1, 'Web layout fundamentals') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (2, 1, 2, 85, '1.00', 'High', 1, 'Prerequisite for React') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (3, 1, 6, 80, '0.70', 'Medium', 2, 'Requires CSS') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (4, 1, 4, 85, '1.00', 'High', 2, 'Requires JavaScript') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (5, 1, 3, 75, '0.80', 'Medium', 3, 'Requires JavaScript') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (6, 1, 5, 75, '0.80', 'Medium', 4, 'Requires React') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (7, 1, 23, 75, '0.70', 'Medium', 4, 'Essential tooling') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (8, 1, 51, 70, '0.60', 'Low', 5, 'Component unit testing') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (9, 2, 2, 85, '0.90', 'High', 1, 'Core language') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (10, 2, 60, 85, '0.95', 'High', 1, 'Asynchronous JS') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (11, 2, 7, 85, '1.00', 'High', 2, 'Requires JavaScript') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (12, 2, 8, 85, '0.95', 'High', 2, 'Requires Node.js') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (13, 2, 9, 90, '1.00', 'High', 2, 'REST Design') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (14, 2, 17, 80, '0.90', 'High', 3, 'Query basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (15, 2, 18, 80, '0.90', 'High', 3, 'Relational DB') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (16, 2, 20, 75, '0.80', 'Medium', 3, 'NoSQL DB') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (17, 2, 11, 85, '0.90', 'High', 4, 'Security & Tokens') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (18, 2, 21, 75, '0.75', 'Medium', 4, 'Caching layer') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (19, 2, 50, 75, '0.70', 'Medium', 4, 'Postman testing') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (20, 2, 23, 80, '0.75', 'Medium', 4, 'Version control') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (21, 2, 25, 75, '0.80', 'Medium', 5, 'Containerization') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (22, 2, 30, 75, '0.85', 'Medium', 5, 'System Design') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (23, 3, 1, 80, '0.80', 'High', 1, 'HTML/CSS basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (24, 3, 2, 85, '0.95', 'High', 1, 'JavaScript core') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (25, 3, 4, 85, '0.95', 'High', 2, 'React UI') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (26, 3, 7, 85, '0.95', 'High', 2, 'Node.js backend') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (27, 3, 8, 80, '0.90', 'High', 2, 'Express.js') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (28, 3, 18, 80, '0.85', 'High', 3, 'MySQL') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (29, 3, 20, 75, '0.80', 'Medium', 3, 'MongoDB') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (30, 3, 11, 85, '0.90', 'High', 4, 'JWT Auth') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (31, 3, 23, 80, '0.80', 'High', 4, 'Git & GitHub') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (32, 3, 25, 75, '0.75', 'Medium', 5, 'Docker') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (33, 3, 28, 70, '0.70', 'Low', 5, 'AWS Deployment') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (34, 4, 15, 90, '1.00', 'High', 1, 'Core Java OOP') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (35, 4, 17, 85, '0.90', 'High', 2, 'Relational queries') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (36, 4, 18, 80, '0.85', 'High', 2, 'MySQL / PostgreSQL') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (37, 4, 16, 90, '1.00', 'High', 3, 'Spring Boot Framework') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (38, 4, 9, 85, '0.90', 'High', 3, 'REST APIs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (39, 4, 11, 80, '0.85', 'High', 4, 'Spring Security & JWT') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (40, 4, 25, 75, '0.75', 'Medium', 5, 'Docker') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (41, 4, 59, 75, '0.80', 'Medium', 5, 'Microservices') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (42, 5, 12, 90, '1.00', 'High', 1, 'Python basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (43, 5, 17, 80, '0.85', 'High', 2, 'SQL queries') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (44, 5, 14, 85, '0.95', 'High', 3, 'FastAPI / Django') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (45, 5, 9, 85, '0.90', 'High', 3, 'REST APIs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (46, 5, 19, 80, '0.80', 'Medium', 4, 'PostgreSQL') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (47, 5, 25, 75, '0.75', 'Medium', 5, 'Docker container') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (48, 6, 2, 80, '0.85', 'High', 1, 'Algorithms & Scripting') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (49, 6, 12, 80, '0.85', 'High', 1, 'Python / Core language') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (50, 6, 17, 80, '0.85', 'High', 2, 'Relational databases') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (51, 6, 23, 85, '0.80', 'High', 2, 'Git workflows') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (52, 6, 30, 85, '1.00', 'High', 3, 'System Design & Scalability') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (53, 6, 25, 75, '0.75', 'Medium', 4, 'Docker') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (54, 6, 51, 80, '0.80', 'Medium', 4, 'Unit testing & TDD') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (55, 7, 2, 80, '0.85', 'High', 1, 'JavaScript / Dart basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (56, 7, 53, 90, '1.00', 'High', 2, 'React Native / Flutter') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (57, 7, 9, 80, '0.85', 'High', 3, 'Consuming REST APIs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (58, 7, 11, 75, '0.80', 'Medium', 4, 'Mobile Authentication') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (59, 7, 23, 75, '0.75', 'Medium', 4, 'Git & GitHub') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (60, 8, 17, 85, '1.00', 'High', 1, 'SQL Joins & Aggregates') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (61, 8, 12, 75, '0.80', 'Medium', 2, 'Python basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (62, 8, 34, 85, '0.95', 'High', 2, 'Pandas manipulation') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (63, 8, 35, 85, '0.90', 'High', 3, 'Data Visualization') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (64, 8, 36, 90, '1.00', 'High', 4, 'Power BI & Tableau') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (65, 8, 31, 75, '0.75', 'Medium', 4, 'Business Statistics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (66, 9, 12, 90, '1.00', 'High', 1, 'Python programming') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (67, 9, 31, 85, '0.95', 'High', 1, 'Statistics & Probability') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (68, 9, 33, 85, '0.90', 'High', 2, 'NumPy') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (69, 9, 34, 90, '0.95', 'High', 2, 'Pandas') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (70, 9, 17, 80, '0.85', 'High', 2, 'SQL queries') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (71, 9, 37, 90, '1.00', 'High', 3, 'Machine Learning algorithms') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (72, 9, 38, 80, '0.85', 'High', 4, 'Deep Learning (PyTorch)') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (73, 9, 39, 75, '0.80', 'Medium', 5, 'NLP fundamentals') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (74, 10, 12, 90, '1.00', 'High', 1, 'Python OOP') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (75, 10, 31, 80, '0.85', 'High', 1, 'Math & Statistics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (76, 10, 34, 85, '0.90', 'High', 2, 'Pandas & Preprocessing') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (77, 10, 37, 90, '1.00', 'High', 3, 'ML Algorithms') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (78, 10, 38, 85, '0.95', 'High', 3, 'Deep Learning (PyTorch/TF)') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (79, 10, 25, 80, '0.85', 'High', 4, 'Docker containerization') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (80, 10, 42, 85, '0.95', 'High', 5, 'MLOps & Model Serving') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (81, 11, 12, 85, '0.95', 'High', 1, 'Python APIs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (82, 11, 37, 80, '0.85', 'High', 2, 'ML concepts') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (83, 11, 38, 80, '0.85', 'High', 3, 'Neural networks') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (84, 11, 40, 90, '1.00', 'High', 4, 'Foundation LLMs & APIs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (85, 11, 41, 90, '1.00', 'High', 4, 'LangChain & Vector DBs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (86, 11, 25, 75, '0.75', 'Medium', 5, 'Container deployment') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (87, 12, 12, 85, '0.95', 'High', 1, 'Python scripting') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (88, 12, 9, 80, '0.85', 'High', 2, 'REST APIs') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (89, 12, 40, 95, '1.00', 'High', 3, 'LLM Prompt Engineering') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (90, 12, 41, 95, '1.00', 'High', 4, 'LangChain & RAG Architecture') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (91, 12, 20, 80, '0.80', 'Medium', 4, 'Vector Databases (Pinecone)') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (92, 12, 25, 75, '0.75', 'Medium', 5, 'Docker deployment') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (93, 13, 17, 95, '1.00', 'High', 1, 'Advanced SQL') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (94, 13, 12, 85, '0.90', 'High', 1, 'Python data pipelines') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (95, 13, 19, 85, '0.90', 'High', 2, 'PostgreSQL & Indexing') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (96, 13, 56, 90, '0.95', 'High', 3, 'Data Warehousing & Star Schema') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (97, 13, 43, 85, '0.95', 'High', 4, 'Apache Spark & Big Data') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (98, 13, 27, 80, '0.80', 'Medium', 5, 'CI/CD & Orchestration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (99, 14, 24, 90, '1.00', 'High', 1, 'Linux Bash & SSH') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (100, 14, 23, 85, '0.85', 'High', 1, 'Git versioning') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (101, 14, 25, 90, '1.00', 'High', 2, 'Docker containerization') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (102, 14, 27, 90, '1.00', 'High', 3, 'GitHub Actions CI/CD') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (103, 14, 28, 85, '0.90', 'High', 4, 'AWS Cloud Core') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (104, 14, 26, 85, '0.95', 'High', 4, 'Kubernetes Orchestration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (105, 14, 29, 80, '0.85', 'High', 5, 'Terraform IaC') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (106, 15, 24, 85, '0.90', 'High', 1, 'Linux system administration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (107, 15, 44, 80, '0.85', 'High', 2, 'Networking & DNS') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (108, 15, 28, 95, '1.00', 'High', 3, 'AWS Cloud Architecture') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (109, 15, 25, 80, '0.85', 'High', 3, 'Docker containers') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (110, 15, 29, 80, '0.85', 'High', 4, 'Terraform infrastructure') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (111, 15, 26, 75, '0.80', 'Medium', 5, 'Kubernetes') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (112, 16, 24, 90, '1.00', 'High', 1, 'Linux kernel & processes') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (113, 16, 25, 85, '0.90', 'High', 2, 'Docker') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (114, 16, 26, 90, '0.95', 'High', 3, 'Kubernetes in production') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (115, 16, 57, 95, '1.00', 'High', 4, 'Observability (Prometheus/Grafana)') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (116, 16, 27, 85, '0.85', 'High', 4, 'CI/CD deployment gates') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (117, 16, 30, 85, '0.90', 'High', 5, 'System reliability architecture') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (118, 17, 44, 90, '1.00', 'High', 1, 'Network Security Protocols') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (119, 17, 24, 85, '0.85', 'High', 1, 'Linux security administration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (120, 17, 45, 90, '1.00', 'High', 2, 'OWASP Top 10 web vulnerabilities') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (121, 17, 46, 80, '0.85', 'High', 3, 'Penetration testing basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (122, 17, 23, 70, '0.65', 'Low', 4, 'Git auditing') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (123, 18, 44, 85, '0.90', 'High', 1, 'Network & Port Scanning') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (124, 18, 24, 85, '0.90', 'High', 1, 'Linux tools (Kali/Bash)') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (125, 18, 45, 95, '1.00', 'High', 2, 'OWASP Web Attacks') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (126, 18, 46, 95, '1.00', 'High', 3, 'Burp Suite & Penetration Testing') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (127, 18, 50, 80, '0.80', 'Medium', 4, 'API Vulnerability Assessment') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (128, 19, 47, 90, '1.00', 'High', 1, 'Manual Testing & Test Plans') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (129, 19, 50, 85, '0.95', 'High', 2, 'API Testing with Postman') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (130, 19, 17, 75, '0.80', 'Medium', 2, 'SQL verification queries') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (131, 19, 23, 75, '0.75', 'Medium', 3, 'Git & Version Control') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (132, 19, 48, 70, '0.70', 'Low', 4, 'Selenium basics') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (133, 20, 2, 80, '0.85', 'High', 1, 'JavaScript / Python for QA') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (134, 20, 48, 90, '1.00', 'High', 2, 'Selenium WebDriver framework') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (135, 20, 49, 90, '1.00', 'High', 3, 'Cypress & Playwright E2E') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (136, 20, 50, 85, '0.90', 'High', 3, 'Postman API automation') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (137, 20, 51, 85, '0.85', 'High', 4, 'PyTest / Jest test runners') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (138, 20, 27, 80, '0.80', 'Medium', 5, 'CI/CD pipeline test integration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (139, 21, 17, 95, '1.00', 'High', 1, 'Complex SQL queries') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (140, 21, 18, 95, '1.00', 'High', 2, 'MySQL administration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (141, 21, 19, 90, '0.95', 'High', 2, 'PostgreSQL configuration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (142, 21, 22, 95, '1.00', 'High', 3, 'Indexing & Query Optimization') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (143, 21, 58, 95, '1.00', 'High', 4, 'Replication, Clustering & Backups') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (144, 21, 24, 80, '0.80', 'Medium', 5, 'Linux server administration') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (145, 22, 54, 95, '1.00', 'High', 1, 'Figma & UI Design Systems') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (146, 22, 55, 90, '0.95', 'High', 2, 'User Research & Personas') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (147, 22, 1, 75, '0.70', 'Medium', 3, 'HTML & CSS layout awareness') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (148, 22, 6, 70, '0.65', 'Low', 4, 'Tailwind styling awareness') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (149, 23, 17, 90, '1.00', 'High', 1, 'Advanced SQL queries & aggregations') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (150, 23, 36, 95, '1.00', 'High', 2, 'Power BI & DAX Formulas') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (151, 23, 56, 90, '0.95', 'High', 3, 'Dimensional Data Modeling') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `career_skills` (`id`, `career_id`, `skill_id`, `required_proficiency`, `importance_weight`, `priority`, `phase_order`, `prerequisites`) VALUES (152, 23, 35, 85, '0.85', 'High', 4, 'Data Visualization & Storytelling') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (1, 'Frontend Developer', 'Craft intuitive, high-performance responsive web user interfaces using modern JavaScript, React, Next.js, and CSS design systems.', 'Web Development', 'Web and Software Development', 'Beginner-Friendly', 4, 'Basic HTML/CSS knowledge and logical thinking.', '[\"E-commerce Product Showcase UI\",\"Interactive SaaS Dashboard\",\"Real-Time Social Feed Component\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (2, 'Backend Developer', 'Architect scalable server architectures, secure RESTful & GraphQL APIs, microservices, and high-throughput relational/NoSQL databases.', 'Backend Development', 'Web and Software Development', 'Intermediate', 5, 'Basic programming syntax and understanding of client-server model.', '[\"Production REST API with JWT Auth\",\"Scalable URL Shortener with Redis\",\"E-Commerce Order Processing Engine\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (3, 'Full Stack Developer', 'Architect and deliver end-to-end modern web applications bridging user experience, backend services, database transactions, and cloud deployments.', 'Software Engineering', 'Web and Software Development', 'Intermediate', 6, 'Basic web literacy and programming fundamentals.', '[\"Collaborative Project Management App\",\"Full Stack Marketplace Portal\",\"Real-Time Chat & Notification System\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (4, 'Java Developer', 'Build robust enterprise-grade applications, microservices, and distributed backend systems with Core Java, Spring Boot, and JPA/Hibernate.', 'Software Engineering', 'Web and Software Development', 'Intermediate', 5, 'Object-oriented programming concepts and algorithm basics.', '[\"Banking Transaction Service with Spring Boot\",\"Inventory Management Microservice\",\"JWT Authentication Resource Server\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (5, 'Python Developer', 'Build rapid web applications, automated scripting pipelines, and backend APIs utilizing Python, Django, FastAPI, and data manipulation tools.', 'Software Engineering', 'Web and Software Development', 'Beginner-Friendly', 4, 'Basic computational logic and scripting interest.', '[\"FastAPI Asynchronous Microservice\",\"Web Scraping & ETL Data Pipeline\",\"Django Customer Portal with PostgreSQL\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (6, 'Software Engineer', 'Design reliable computer software, apply rigorous data structures and algorithms, system design patterns, and maintain production code quality.', 'Software Engineering', 'Web and Software Development', 'Intermediate', 6, 'Foundational programming knowledge in any language.', '[\"Distributed Task Scheduler\",\"High-Concurrency In-Memory Cache\",\"File Storage & Sync Engine\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (7, 'Mobile App Developer', 'Develop cross-platform and native iOS & Android applications with fluid gesture interactions using Flutter or React Native.', 'Mobile Development', 'Web and Software Development', 'Beginner-Friendly', 5, 'Basic JavaScript or Dart programming concepts.', '[\"Fitness & Habit Tracking App\",\"E-Commerce Mobile Storefront\",\"Real-Time Offline-First Messaging App\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (8, 'Data Analyst', 'Transform complex organizational datasets into actionable business intelligence dashboards using SQL, Excel, Python, Power BI, and Tableau.', 'Data Science', 'Data and Artificial Intelligence', 'Beginner-Friendly', 3, 'Basic math, spreadsheet familiarity, and analytical curiosity.', '[\"Executive Sales Performance Dashboard\",\"Customer Churn Analysis Report\",\"Cohort Retention & LTV Diagnostic\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (9, 'Data Scientist', 'Apply advanced statistical inference, machine learning algorithms, and predictive modeling to solve high-impact exploratory data problems.', 'Data Science', 'Data and Artificial Intelligence', 'Intermediate', 6, 'College-level algebra, statistics, and Python scripting.', '[\"Credit Card Fraud Detection Classifier\",\"Customer Segmentation Clustering Model\",\"House Price Regression Forecaster\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (10, 'Machine Learning Engineer', 'Bridge data science and software engineering by designing, training, deploying, and maintaining production-scale ML models.', 'Artificial Intelligence', 'Data and Artificial Intelligence', 'Advanced', 6, 'Solid Python, linear algebra, and data manipulation skills.', '[\"End-to-End Recommendation Engine API\",\"Automated ML Training & Drift Detection Pipeline\",\"Image Classification Service Containerized in Docker\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (11, 'AI Engineer', 'Integrate state-of-the-art foundation models, neural networks, computer vision, and NLP APIs into production consumer applications.', 'Artificial Intelligence', 'Data and Artificial Intelligence', 'Intermediate', 5, 'Python programming and familiarity with REST APIs.', '[\"Multimodal Visual Assistant\",\"Semantic Search & QA Engine with Vector DB\",\"Voice AI Transcription & Summarizer\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (12, 'Generative AI Developer', 'Build production generative AI applications using Large Language Models (LLMs), LangChain, LlamaIndex, Prompt Engineering, and RAG pipelines.', 'Artificial Intelligence', 'Data and Artificial Intelligence', 'Intermediate', 4, 'Python or JavaScript API development experience.', '[\"Enterprise Document RAG Knowledge Bot\",\"Autonomous Multi-Agent Researcher\",\"Code Refactoring & Unit Test Generator\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (13, 'Data Engineer', 'Construct reliable big-data pipelines, warehousing solutions, ETL architectures, and distributed streaming workflows with SQL, Spark, and Airflow.', 'Data Science', 'Data and Artificial Intelligence', 'Advanced', 6, 'Strong SQL and procedural programming fundamentals.', '[\"Streaming Clickstream Ingestion with Kafka\",\"Automated ETL Orchestration with Airflow\",\"Snowflake Analytics Data Warehouse\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (14, 'DevOps Engineer', 'Automate continuous integration and continuous deployment (CI/CD) pipelines, infrastructure as code (IaC), containerization, and cloud delivery.', 'DevOps & Cloud', 'Cloud and Infrastructure', 'Intermediate', 5, 'Linux command line familiarity and basic networking concepts.', '[\"GitHub Actions CI/CD to AWS ECS\",\"Terraform Automated Cloud VPC Setup\",\"Multi-Environment Docker Compose Pipeline\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (15, 'Cloud Engineer', 'Architect, migrate, and secure scalable multi-tenant infrastructure and serverless workloads on major cloud providers like AWS, Azure, and GCP.', 'DevOps & Cloud', 'Cloud and Infrastructure', 'Intermediate', 5, 'Basic OS knowledge and computer networking principles.', '[\"Highly Available Auto-Scaling Web App on AWS\",\"Serverless Event-Driven Image Processor\",\"Zero-Trust Cloud IAM Security Architecture\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (16, 'Site Reliability Engineer', 'Ensure system uptime, resilience, latency optimization, observability, automated incident remediation, and disaster recovery.', 'DevOps & Cloud', 'Cloud and Infrastructure', 'Advanced', 6, 'System administration, networking, and scripting skills.', '[\"Prometheus & Grafana Observability Stack\",\"Chaos Engineering Fault Injection Suite\",\"Automated Failover & Canary Deployment Controller\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (17, 'Cybersecurity Analyst', 'Defend corporate infrastructure, monitor security event logs (SIEM), mitigate vulnerability threats, and enforce network compliance.', 'Security', 'Security and Testing', 'Intermediate', 5, 'TCP/IP networking, operating systems, and security basics.', '[\"Threat Incident Response Simulation\",\"Network Intrusion Detection System (Snort)\",\"Vulnerability Assessment Audit Report\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (18, 'Ethical Security Testing Learner', 'Master ethical hacking methodologies, penetration testing, web vulnerability exploit analysis (OWASP Top 10), and bug bounty reconnaissance.', 'Security', 'Security and Testing', 'Intermediate', 5, 'Basic HTTP protocol, Linux terminal, and networking.', '[\"Web Application Penetration Test Audit\",\"Automated Security Scanner Script\",\"Burp Suite API Vulnerability Assessment\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (19, 'Software Test Engineer', 'Create robust software verification plans, write test specifications, execute regression testing suites, and guarantee defect-free deployments.', 'Quality Assurance', 'Security and Testing', 'Beginner-Friendly', 3, 'Understanding of software lifecycle and analytical detail.', '[\"End-to-End Test Plan for SaaS Portal\",\"API Integration Test Suite in Postman\",\"Cross-Browser Compatibility Test Matrix\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (20, 'Automation Test Engineer', 'Program automated regression testing suites, CI/CD quality gates, and UI/API automation frameworks with Selenium, Cypress, Playwright, and PyTest.', 'Quality Assurance', 'Security and Testing', 'Intermediate', 4, 'Basic scripting in Python, Java, or JavaScript.', '[\"Cypress E2E Automation Framework for E-Commerce\",\"Selenium Parallel Test Runner with PyTest\",\"Automated Postman Collection in GitHub Actions\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (21, 'Database Administrator', 'Administer relational databases, configure replication clusters, perform performance tuning, indexing optimizations, and disaster recovery.', 'Databases', 'Other Technical Roles', 'Intermediate', 5, 'Strong SQL and relational data model understanding.', '[\"High-Availability MySQL Primary-Replica Cluster\",\"Query Performance Optimization & Index Tuning Audit\",\"Automated Database Backup & Restore Automation\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (22, 'UI/UX Designer', 'Design user-centric digital experiences, conduct wireframing, build interactive Figma prototypes, and establish scalable design systems.', 'Design', 'Other Technical Roles', 'Beginner-Friendly', 3, 'Empathy for user experience, aesthetics, and design curiosity.', '[\"Full Mobile Banking App Design in Figma\",\"Design System & Component Library with Auto-Layout\",\"Usability Study & Interactive Wireframe Flow\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `careers` (`id`, `name`, `description`, `category`, `domain`, `difficulty`, `estimated_prep_months`, `prerequisites`, `sample_projects`, `created_at`) VALUES (23, 'Business Intelligence Developer', 'Build dimensional data models, enterprise reporting warehouses, and executive analytics pipelines with Power BI, DAX, and SQL.', 'Data Science', 'Other Technical Roles', 'Beginner-Friendly', 4, 'Spreadsheet reporting and basic database query knowledge.', '[\"Enterprise Financial KPI Dashboard in Power BI\",\"Star Schema Dimensional Data Model\",\"Automated Scheduled Executive Email Reports\"]', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (1, 2, 'user', 'What should I learn next?', '2026-10-10 04:50:25') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (2, 2, 'assistant', 'Hi Alex Morgan! Based on your current progress toward **Backend Developer**, your next recommended focus is **Asynchronous Programming**.\n\n• **Current Level**: 0\% (Target: 85\%)\n• **Priority**: High\n• **Estimated Effort**: ~13 hours\n\n**Why this next?** It is part of **your active roadmap phase**. Completing this will directly close your skill gap for Backend Developer and prepare you for subsequent database & architecture modules.', '2026-10-10 04:50:25') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (3, 3, 'user', 'What should I learn next?', '2026-10-10 06:07:46') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (4, 3, 'assistant', 'Hi Nikil! Based on your current progress toward **Cloud Engineer**, your next recommended focus is **Linux Basics**.\n\n• **Current Level**: 0\% (Target: 85\%)\n• **Priority**: High\n• **Estimated Effort**: ~13 hours\n\n**Why this next?** It is part of **your active roadmap phase**. Completing this will directly close your skill gap for Cloud Engineer and prepare you for subsequent database & architecture modules.', '2026-10-10 06:07:46') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (5, 3, 'user', 'What should I learn next?', '2026-10-10 06:07:47') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (6, 3, 'assistant', 'Hi Nikil! Based on your current progress toward **Cloud Engineer**, your next recommended focus is **Linux Basics**.\n\n• **Current Level**: 0\% (Target: 85\%)\n• **Priority**: High\n• **Estimated Effort**: ~13 hours\n\n**Why this next?** It is part of **your active roadmap phase**. Completing this will directly close your skill gap for Cloud Engineer and prepare you for subsequent database & architecture modules.', '2026-10-10 06:07:47') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (7, 3, 'user', 'Can I become a Full Stack Developer with my current skills?', '2026-10-10 06:07:50') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `chat_messages` (`id`, `user_id`, `sender`, `message`, `created_at`) VALUES (8, 3, 'assistant', 'Yes, absolutely! With your current skill profile, your compatibility for **Full Stack Developer** is **20\%**.\n\n• **Skills you already have**: JavaScript, HTML & CSS\n• **What\'s needed to be job-ready**: Deepen React UI development, connect client-server REST APIs with JWT authentication, and learn containerized deployment with Docker.\n\nYou are only about **54 weeks** of consistent practice away from being job-ready for junior-to-mid Full Stack roles!', '2026-10-10 06:07:50') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `courses` (`id`, `title`, `description`, `primary_skill_id`, `difficulty`, `duration_hours`, `category`, `thumbnail_url`, `rating`, `status`, `created_at`) VALUES (1, 'Complete Modern JavaScript & Asynchronous Programming', 'Master ES6+, Promises, async/await, closures, event loop, and asynchronous patterns essential for backend & frontend development.', 2, 'Beginner', '10.0', 'Programming', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80', '4.9', 'published', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `courses` (`id`, `title`, `description`, `primary_skill_id`, `difficulty`, `duration_hours`, `category`, `thumbnail_url`, `rating`, `status`, `created_at`) VALUES (2, 'Node.js & Express.js In-Depth API Masterclass', 'Architect production REST APIs, handle middleware, validation, error handling, file uploads, and scalable routing.', 7, 'Intermediate', '14.0', 'Backend Development', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', '4.8', 'published', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `courses` (`id`, `title`, `description`, `primary_skill_id`, `difficulty`, `duration_hours`, `category`, `thumbnail_url`, `rating`, `status`, `created_at`) VALUES (3, 'Relational Databases & MySQL: From Queries to Optimization', 'Master complex SQL joins, subqueries, relational schema design, transactions, indexing, and query performance tuning.', 18, 'Intermediate', '12.0', 'Databases', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80', '4.7', 'published', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `courses` (`id`, `title`, `description`, `primary_skill_id`, `difficulty`, `duration_hours`, `category`, `thumbnail_url`, `rating`, `status`, `created_at`) VALUES (4, 'Backend Security, JWT Authentication & Authorization', 'Implement industry-standard security protocols, OAuth2, JWT token lifecycle, rate limiting, and protection against OWASP Top 10 vulnerabilities.', 11, 'Intermediate', '8.0', 'Security', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80', '4.9', 'published', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `courses` (`id`, `title`, `description`, `primary_skill_id`, `difficulty`, `duration_hours`, `category`, `thumbnail_url`, `rating`, `status`, `created_at`) VALUES (5, 'Docker & Containerization for Web Developers', 'Containerize full stack Node and Python applications, configure multi-stage Dockerfiles, Docker Compose, and cloud deployment.', 25, 'Intermediate', '6.0', 'DevOps', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80', '4.8', 'published', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `courses` (`id`, `title`, `description`, `primary_skill_id`, `difficulty`, `duration_hours`, `category`, `thumbnail_url`, `rating`, `status`, `created_at`) VALUES (6, 'System Design Fundamentals for Scalable Applications', 'Learn horizontal scaling, distributed caching with Redis, load balancers, database sharding, and high-availability patterns.', 30, 'Advanced', '15.0', 'Software Engineering', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', '4.9', 'published', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (1, 1, 'MDN: Getting Started with HTML & CSS', 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 'Documentation', 'MDN Web Docs', 'Beginner', 60) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (2, 1, 'freeCodeCamp: Responsive Web Design Certification', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', 'Interactive Courses', 'freeCodeCamp', 'Beginner', 300) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (3, 2, 'JavaScript.info: The Modern JavaScript Tutorial', 'https://javascript.info/', 'Documentation', 'JavaScript.info', 'Beginner', 180) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (4, 2, 'freeCodeCamp: JavaScript Algorithms and Data Structures', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/', 'Interactive Courses', 'freeCodeCamp', 'Intermediate', 240) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (5, 4, 'React Official Documentation (Learn React)', 'https://react.dev/learn', 'Documentation', 'React.dev', 'Intermediate', 120) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (6, 4, 'freeCodeCamp: React Full Course for Beginners', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 'Videos', 'YouTube', 'Beginner', 180) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (7, 7, 'Node.js Official Getting Started Guide', 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', 'Documentation', 'Node.js Docs', 'Intermediate', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (8, 8, 'Express.js Framework Guide & Middleware Tutorial', 'https://expressjs.com/en/starter/installing.html', 'Documentation', 'Express.js', 'Intermediate', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (9, 9, 'RESTful API Design Best Practices (Microsoft Learn)', 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design', 'Documentation', 'Microsoft Docs', 'Intermediate', 45) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (10, 11, 'JWT.io: Introduction to JSON Web Tokens', 'https://jwt.io/introduction', 'Documentation', 'Auth0 / JWT.io', 'Intermediate', 45) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (11, 17, 'SQLBolt: Interactive SQL Lessons & Exercises', 'https://sqlbolt.com/', 'Interactive Courses', 'SQLBolt', 'Beginner', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (12, 18, 'MySQL 8.0 Reference Manual: Core Concepts & Queries', 'https://dev.mysql.com/doc/refman/8.0/en/tutorial.html', 'Documentation', 'MySQL Docs', 'Intermediate', 120) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (13, 20, 'MongoDB University: Introduction to MongoDB', 'https://learn.mongodb.com/', 'Interactive Courses', 'MongoDB University', 'Beginner', 120) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (14, 23, 'Pro Git Book (Official Git Documentation)', 'https://git-scm.com/book/en/v2', 'Documentation', 'Git SCM', 'Beginner', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (15, 25, 'Docker Getting Started Tutorial & Container Lab', 'https://docs.docker.com/get-started/', 'Interactive Courses', 'Docker Docs', 'Intermediate', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (16, 28, 'AWS Cloud Essentials Training (AWS Skill Builder)', 'https://explore.skillbuilder.aws/', 'Videos', 'AWS Training', 'Beginner', 150) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (17, 30, 'System Design Primer (GitHub Reference Architecture)', 'https://github.com/donnemartin/system-design-primer', 'Documentation', 'GitHub Open Source', 'Advanced', 240) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (18, 37, 'Scikit-Learn Machine Learning in Python Tutorial', 'https://scikit-learn.org/stable/tutorial/index.html', 'Documentation', 'Scikit-Learn', 'Intermediate', 150) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (19, 40, 'DeepLearning.AI: Prompt Engineering for Developers', 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', 'Interactive Courses', 'DeepLearning.AI', 'Beginner', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (20, 41, 'LangChain Official Documentation & RAG Quickstart', 'https://python.langchain.com/docs/get_started/introduction', 'Documentation', 'LangChain Docs', 'Intermediate', 120) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (21, 45, 'OWASP Top 10 Web Application Security Risks', 'https://owasp.org/www-project-top-ten/', 'Documentation', 'OWASP Foundation', 'Intermediate', 90) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (22, 50, 'Postman API Learning Center & Automated Testing', 'https://learning.postman.com/docs/getting-started/introduction/', 'Interactive Courses', 'Postman Docs', 'Beginner', 60) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `learning_resources` (`id`, `skill_id`, `title`, `url`, `type`, `platform`, `difficulty`, `duration_minutes`) VALUES (23, 54, 'Figma for Beginners Tutorial Series', 'https://help.figma.com/hc/en-us/categories/360002051613-Figma-Design', 'Documentation', 'Figma Learn', 'Beginner', 90) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `lessons` (`id`, `module_id`, `title`, `content`, `video_url`, `duration_minutes`, `lesson_order`) VALUES (1, 1, 'Let, Const, and Block Scoping in Depth', 'Understanding temporal dead zones, variable hoisting, and scope isolation in modern JavaScript runtimes.', NULL, 20, 1) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `lessons` (`id`, `module_id`, `title`, `content`, `video_url`, `duration_minutes`, `lesson_order`) VALUES (2, 2, 'Promises and Async/Await Mechanics', 'Detailed breakdown of microtask queues, rejected promises, try/catch blocks, and Promise.all concurrency.', NULL, 25, 1) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `module_order`) VALUES (1, 1, 'ES6+ Syntax & Scoping', 'Variables, arrow functions, destructuring, and rest/spread syntax.', 1) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `module_order`) VALUES (2, 1, 'Asynchronous Programming & Promises', 'Event loop, callbacks, Promise chaining, and async/await error handling.', 2) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (1, 3, 1, '48.00', '0.00', '100.00', '20.00', '60.00', '100.00', '[\"JavaScript is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Beginner) matches your current skill level.\"]', '2026-10-10 05:42:32') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (2, 3, 2, '46.00', '0.00', '100.00', '31.00', '60.00', '60.00', '[\"Node.js is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:42:32') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (3, 3, 3, '44.00', '0.00', '100.00', '20.00', '60.00', '60.00', '[\"MySQL is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:42:32') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (4, 3, 4, '44.00', '0.00', '100.00', '20.00', '60.00', '60.00', '[\"JWT & Authentication is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:42:32') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (81, 2, 1, '48.00', '0.00', '100.00', '20.00', '60.00', '100.00', '[\"JavaScript is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Beginner) matches your current skill level.\"]', '2026-10-10 05:49:57') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (82, 2, 2, '46.00', '0.00', '100.00', '31.00', '60.00', '60.00', '[\"Node.js is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:49:57') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (83, 2, 3, '44.00', '0.00', '100.00', '20.00', '60.00', '60.00', '[\"MySQL is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:49:57') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (84, 2, 4, '44.00', '0.00', '100.00', '20.00', '60.00', '60.00', '[\"JWT & Authentication is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:49:57') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (137, 2, 5, '77.00', '100.00', '100.00', '36.00', '60.00', '60.00', '[\"Your Docker proficiency is currently 0\% (Target: 80\%).\",\"Docker is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 05:55:21') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (142, 2, 6, '42.00', '0.00', '100.00', '24.00', '60.00', '30.00', '[\"System Design Fundamentals is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Advanced) matches your current skill level.\"]', '2026-10-10 05:55:21') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (143, 3, 5, '77.00', '100.00', '100.00', '36.00', '60.00', '60.00', '[\"Your Docker proficiency is currently 0\% (Target: 80\%).\",\"Docker is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Intermediate) matches your current skill level.\"]', '2026-10-10 06:04:49') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `recommendations` (`id`, `user_id`, `course_id`, `recommendation_score`, `skill_gap_score`, `prerequisite_match_score`, `relevance_score`, `performance_score`, `difficulty_fit_score`, `explanation`, `created_at`) VALUES (148, 3, 6, '42.00', '0.00', '100.00', '24.00', '60.00', '30.00', '[\"System Design Fundamentals is a high-priority skill for your career path (Cloud Engineer).\",\"Course difficulty (Advanced) matches your current skill level.\"]', '2026-10-10 06:04:49') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (1, 'HTML & CSS', 'Semantic HTML5 structure and responsive CSS flexbox/grid layout designs.', 'Web Development', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (2, 'JavaScript', 'Modern ECMAScript programming, async/await, closures, and browser APIs.', 'Programming', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (3, 'TypeScript', 'Static typing, interfaces, generics, and compile-time type safety for JS.', 'Programming', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (4, 'React', 'Component-based UI development, hooks, state management, and virtual DOM.', 'Web Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (5, 'Next.js', 'React framework for server-side rendering, static site generation, and full-stack routing.', 'Web Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (6, 'Tailwind CSS', 'Utility-first CSS framework for rapid modern responsive UI construction.', 'Web Development', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (7, 'Node.js', 'Event-driven server-side JavaScript runtime environment.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (8, 'Express.js', 'Minimalist web framework for Node.js REST API creation and middleware.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (9, 'REST API Architecture', 'API design principles, endpoints, HTTP status codes, and JSON schema.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (10, 'GraphQL', 'Schema-driven query language for flexible API data fetching and mutations.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (11, 'JWT & Authentication', 'JSON Web Tokens, session handling, OAuth2, and password hashing security.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (12, 'Python', 'Core Python programming language syntax, data structures, and OOP.', 'Programming', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (13, 'Django', 'High-level Python web framework with ORM, built-in admin, and security.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (14, 'FastAPI', 'Modern, high-performance web framework for building APIs with Python 3.8+ typing.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (15, 'Java', 'Object-oriented programming, JVM memory model, multi-threading, and streams.', 'Programming', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (16, 'Spring Boot', 'Enterprise Java framework for production microservices and dependency injection.', 'Backend Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (17, 'SQL', 'Relational database query language for data retrieval, filtering, joins, and aggregates.', 'Databases', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (18, 'MySQL', 'Relational database management system with ACID compliance and indexing.', 'Databases', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (19, 'PostgreSQL', 'Advanced open-source relational database supporting JSONB and full-text search.', 'Databases', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (20, 'MongoDB', 'NoSQL document database, aggregation pipelines, and flexible schema design.', 'Databases', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (21, 'Redis', 'In-memory data structure store used for caching, pub/sub, and session storage.', 'Databases', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (22, 'Database Indexing & Optimization', 'B-trees, query execution plans, normalization, and performance tuning.', 'Databases', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (23, 'Git & GitHub', 'Distributed version control, branching workflows, PRs, and merge conflict resolution.', 'DevOps', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (24, 'Linux Basics', 'Bash command line navigation, shell scripts, permissions, process management, and SSH.', 'DevOps', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (25, 'Docker', 'Containerizing applications, Dockerfiles, compose stacks, and volume mounts.', 'DevOps', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (26, 'Kubernetes', 'Container orchestration, pods, services, ingress, config maps, and deployments.', 'Cloud Computing', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (27, 'CI/CD Pipelines', 'Automated testing and continuous delivery workflows with GitHub Actions.', 'DevOps', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (28, 'AWS Fundamentals', 'Amazon Web Services core services: EC2, S3, IAM, Lambda, RDS, VPC.', 'Cloud Computing', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (29, 'Terraform', 'Infrastructure as Code (IaC) for declaring cloud resources declaratively.', 'DevOps', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (30, 'System Design Fundamentals', 'Horizontal scaling, load balancing, caching, microservices, and CAP theorem.', 'Software Engineering', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (31, 'Statistics & Probability', 'Probability distributions, hypothesis testing, variance, and Bayesian inference.', 'Data Science', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (32, 'Linear Algebra', 'Vectors, matrices, eigenvalues, eigenvectors, and dimensionality reduction.', 'Mathematics', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (33, 'NumPy', 'Multidimensional arrays, vectorization, and numerical operations in Python.', 'Data Science', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (34, 'Pandas', 'Data manipulation, cleaning, filtering, and aggregation with DataFrames.', 'Data Science', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (35, 'Data Visualization', 'Creating compelling visual dashboards with Matplotlib, Seaborn, or Plotly.', 'Data Science', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (36, 'Power BI & Tableau', 'Building interactive business intelligence reports, DAX queries, and KPI charts.', 'Data Science', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (37, 'Machine Learning', 'Supervised and unsupervised algorithms, model evaluation, and cross-validation.', 'Artificial Intelligence', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (38, 'Deep Learning', 'Neural networks, backpropagation, CNNs, RNNs, PyTorch, and TensorFlow.', 'Artificial Intelligence', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (39, 'Natural Language Processing', 'Text tokenization, embeddings, sentiment analysis, and Transformer architectures.', 'Artificial Intelligence', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (40, 'Large Language Models (LLMs)', 'Foundation models, prompt engineering, fine-tuning, embeddings, and context windows.', 'Artificial Intelligence', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (41, 'LangChain & RAG', 'Retrieval-Augmented Generation, vector databases (Pinecone, Chroma), and agentic workflows.', 'Artificial Intelligence', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (42, 'ML Deployment & MLOps', 'Serving models via REST APIs, containerization, model monitoring, and MLflow.', 'Artificial Intelligence', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (43, 'Big Data & Spark', 'Distributed data processing, PySpark, data lakes, and ETL pipelines.', 'Data Science', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (44, 'Network Security', 'Firewalls, TCP/IP protocols, DNS, TLS/SSL certificates, and subnetting.', 'Security', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (45, 'Web Security (OWASP Top 10)', 'SQL injection, XSS, CSRF, security headers, CORS, and sanitization.', 'Security', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (46, 'Ethical Hacking & Pen Testing', 'Reconnaissance, vulnerability scanning, exploit frameworks, and Burp Suite.', 'Security', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (47, 'Manual QA & Test Planning', 'Test cases, bug reporting, boundary value analysis, and equivalence partitioning.', 'Quality Assurance', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (48, 'Selenium & E2E Testing', 'Browser automation, WebDriver APIs, page object models, and test reporting.', 'Quality Assurance', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (49, 'Cypress & Playwright', 'Modern JavaScript end-to-end and component automated testing frameworks.', 'Quality Assurance', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (50, 'API Testing & Postman', 'HTTP request automation, test assertions, environment variables, and Newman runner.', 'Quality Assurance', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (51, 'Unit Testing (Jest/PyTest)', 'Unit testing principles, test-driven development (TDD), mocking, and code coverage.', 'Quality Assurance', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (52, 'Flutter & Dart', 'Cross-platform mobile UI development, widget lifecycle, and state management.', 'Mobile Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (53, 'React Native', 'Mobile app development with JavaScript/React targeting iOS and Android.', 'Mobile Development', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (54, 'UI/UX Design & Figma', 'User flows, wireframing, high-fidelity prototypes, components, and auto-layout.', 'Design', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (55, 'User Research & Usability', 'User personas, heuristic evaluations, usability testing, and accessibility.', 'Design', 'Beginner', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (56, 'Data Warehousing & Modeling', 'Star schema, snowflake schema, dimensional modeling, and ETL architecture.', 'Data Science', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (57, 'Site Reliability & Monitoring', 'SLOs, SLIs, error budgets, Prometheus, Grafana, and incident triage.', 'DevOps', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (58, 'Database Administration (DBA)', 'Replication topologies, point-in-time recovery, user access privileges, and vacuuming.', 'Databases', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (59, 'Microservices Architecture', 'Service discovery, API gateways, event-driven messaging, and domain-driven design.', 'Software Engineering', 'Advanced', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (60, 'Asynchronous Programming', 'Event loop, callbacks, promises, async/await, and non-blocking I/O patterns.', 'Programming', 'Intermediate', 0, NULL, '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `skills` (`id`, `name`, `description`, `category`, `difficulty`, `is_custom`, `created_by_user_id`, `created_at`) VALUES (61, 'GraphQL & Apollo', 'Custom skill added by student.', 'Web Development', 'Intermediate', 1, 2, '2026-10-10 04:51:02') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `student_preferences` (`id`, `user_id`, `daily_learning_time_min`, `preferred_difficulty`, `preferred_format`, `target_completion_weeks`) VALUES (1, 2, 60, 'Beginner', 'Interactive', 12) ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_preferences` (`id`, `user_id`, `daily_learning_time_min`, `preferred_difficulty`, `preferred_format`, `target_completion_weeks`) VALUES (2, 3, 60, 'Beginner', 'Interactive', 12) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `student_profiles` (`id`, `user_id`, `education_level`, `current_qualification`, `experience_level`, `target_career_id`, `interests`, `preferred_learning_style`, `weekly_learning_hours`, `onboarding_completed`, `created_at`, `updated_at`) VALUES (1, 2, 'Undergraduate', 'Computer Science', 'Beginner', 15, '[\"Web Development\"]', 'Interactive Courses', 10, 1, '2026-10-10 04:26:23', '2026-10-10 05:49:57') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_profiles` (`id`, `user_id`, `education_level`, `current_qualification`, `experience_level`, `target_career_id`, `interests`, `preferred_learning_style`, `weekly_learning_hours`, `onboarding_completed`, `created_at`, `updated_at`) VALUES (2, 3, 'Undergraduate', 'Computer Science', 'Beginner', 15, '[\"Web Development\",\"AI/ML\"]', 'Interactive Courses', 10, 1, '2026-10-10 05:41:59', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `student_projects` (`id`, `user_id`, `career_id`, `title`, `description`, `skills_used`, `repo_url`, `demo_url`, `status`, `submitted_at`) VALUES (1, 2, 2, 'Full Stack Authentication API', 'Robust Node.js and Express REST API featuring JWT authentication, refresh tokens, and bcrypt password hashing.', 'Node.js, Express.js, JWT, MySQL', 'https://github.com/alexmorgan/auth-rest-api', 'https://auth-api-demo.railway.app', 'completed', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_projects` (`id`, `user_id`, `career_id`, `title`, `description`, `skills_used`, `repo_url`, `demo_url`, `status`, `submitted_at`) VALUES (2, 2, 1, 'Responsive Portfolio Website', 'Clean, modern developer portfolio website built with HTML5 semantic tags, Tailwind CSS, and vanilla JavaScript animations.', 'HTML, CSS, JavaScript, Tailwind', 'https://github.com/alexmorgan/developer-portfolio', 'https://alexmorgan.dev', 'completed', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (1, 2, 1, 65, 'Intermediate', '2026-10-10 06:08:09') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (2, 2, 2, 70, 'Intermediate', '2026-10-10 06:08:09') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (3, 2, 7, 60, 'Intermediate', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (4, 2, 8, 35, 'Beginner', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (5, 2, 18, 30, 'Beginner', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (6, 2, 23, 60, 'Intermediate', '2026-10-10 04:26:24') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (8, 2, 61, 65, 'Intermediate', '2026-10-10 04:51:02') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (9, 3, 1, 65, 'Intermediate', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (10, 3, 2, 70, 'Advanced', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (11, 3, 3, 60, 'Intermediate', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (12, 3, 4, 35, 'Beginner', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (13, 3, 5, 30, 'Beginner', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (14, 3, 15, 50, 'Intermediate', '2026-10-10 12:04:39') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (131, 2, 3, 60, 'Intermediate', '2026-10-10 06:08:09') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (132, 2, 4, 35, 'Beginner', '2026-10-10 06:08:09') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `student_skills` (`id`, `user_id`, `skill_id`, `proficiency_level`, `status`, `last_assessed_at`) VALUES (133, 2, 5, 30, 'Beginner', '2026-10-10 06:08:09') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES (1, 'System Admin', 'admin@learningpath.ai', '$2a$10$l50ngapngVcYjfXlMPoKquFl.XptUHtRpcmXbq90/EOw/KLqnEQTO', 'admin', '2026-10-10 04:26:23', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES (2, 'Alex Morgan', 'student@learningpath.ai', '$2a$10$78bwwlH20VNMDxXsUSIopuCsNKhYJFBgCtuA4wksHylqTDT21xW22', 'student', '2026-10-10 04:26:23', '2026-10-10 04:26:23') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES (3, 'Nikil', 'nikil@bit.ac.in', '$2a$10$c7OF8yHWR.TDKMtSFMOQJuRU2BvF5Nz6RLnPoUlzEiErh5ozZUQj2', 'student', '2026-10-10 05:41:59', '2026-10-10 05:41:59') ON DUPLICATE KEY UPDATE id=id;

SET FOREIGN_KEY_CHECKS = 1;
