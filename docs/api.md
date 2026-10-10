# REST API Specification

## Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register new student account.
- `POST /api/auth/login`: Authenticate and return JWT token.
- `GET  /api/auth/me`: Get current authenticated user profile.

## Student Endpoints (`/api/students`)
- `GET  /api/students/profile`: Get profile & preferences.
- `PUT  /api/students/profile`: Update profile & target career.
- `GET  /api/students/skills`: Get student's current skill matrix.
- `PUT  /api/students/skills`: Update student's skills & self-assessed proficiency.
- `GET  /api/students/progress`: Get overall learning metrics.

## Careers & Skills (`/api/careers`, `/api/skills`)
- `GET /api/careers`: List all target careers.
- `GET /api/careers/:id`: Get career details & benchmark skills.
- `GET /api/skills`: List all skills database.

## Courses (`/api/courses`)
- `GET  /api/courses`: Search catalog with filters.
- `GET  /api/courses/:id`: Get course details, syllabus, & enrollment status.
- `POST /api/courses/:id/enroll`: Enroll student in course.
- `POST /api/courses/lessons/:lessonId/complete`: Mark lesson complete & update progress.

## Recommendations & Learning Path (`/api/recommendations`, `/api/learning-path`)
- `GET  /api/recommendations`: Get top ranked course recommendations.
- `GET  /api/recommendations/next`: Get single top recommended next step.
- `POST /api/recommendations/refresh`: Force recalculation of engine scoring.
- `GET  /api/learning-path`: Get active learning roadmap.
- `POST /api/learning-path/generate`: Re-generate dynamic learning path steps.

## Assessments & Quizzes (`/api/assessments`, `/api/quizzes`)
- `GET  /api/assessments`: List career/skill assessments.
- `GET  /api/assessments/:id`: Fetch questions (without revealing answers).
- `POST /api/assessments/:id/submit`: Submit assessment answers, auto-grade, & update skills.
- `POST /api/quizzes/:id/submit`: Submit module quiz answers.

## Admin Endpoints (`/api/admin/*`)
- `GET    /api/admin/analytics`: System-wide statistics.
- `GET    /api/admin/students`: Manage student directory.
- `POST/PUT/DELETE /api/admin/careers`: Career CRUD.
- `POST/PUT/DELETE /api/admin/skills`: Skill CRUD.
- `POST/PUT/DELETE /api/admin/courses`: Course CRUD.
