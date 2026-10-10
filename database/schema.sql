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
