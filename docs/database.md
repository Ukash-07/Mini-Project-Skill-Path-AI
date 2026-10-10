# Database Schema Documentation

## Relational Entity Model (MySQL 8)

The system relies on a fully normalized relational database `learning_path_db`:

### Core Entity Tables
- `users`: Stores user accounts with bcrypt password hashes and roles (`student`, `admin`).
- `student_profiles`: One-to-one relationship with `users` storing target career and onboarding state.
- `student_preferences`: Learning pace and target timeframe settings.
- `careers`: Catalog of tech career pathways.
- `skills`: Catalog of skills with categories and base difficulties.
- `career_skills`: Benchmark required proficiency (0-100) and importance weights (0.00 - 1.00) per career.
- `skill_prerequisites`: Hierarchical dependency graph between skills.
- `student_skills`: Current assessed skill proficiency matrix per student.
- `courses`: Published courses linked to primary skills.
- `course_prerequisites`: Course and skill prerequisites required before unlocking.
- `modules` & `lessons`: Course syllabus structure.
- `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`: Post-module assessments.
- `assessments`, `assessment_questions`, `assessment_options`, `assessment_attempts`: Career skill diagnostic benchmarks.
- `enrollments`, `lesson_progress`, `course_progress`: Live learning progress tracking.
- `learning_paths` & `learning_path_items`: Dynamically generated student roadmaps.
- `recommendations`: Saved top 10 course recommendations with hybrid score breakdowns and natural language explanations.
