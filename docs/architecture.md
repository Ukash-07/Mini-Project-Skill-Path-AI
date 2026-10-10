# Architecture & System Design Documentation

## System Architecture

```
[ React 18 + Vite SPA ] 
        │ (Axios REST API / JSON)
        ▼
[ Node.js + Express.js Backend ]
        │ 
        ├── [ Auth & Role Middleware ]
        ├── [ Modular Hybrid Recommendation Engine ]
        │       ├── TF-IDF Metadata Vectorizer (Content Similarity)
        │       ├── Skill Gap Diagnostic Calculator
        │       ├── Prerequisite Hierarchy Evaluator
        │       ├── Performance Adaptivity Handler
        │       └── Transparent Mathematical Ranking Engine
        └── [ MySQL 8 Database Pool (mysql2) ]
```

## System Workflow & Data Flow
1. **Student Registration & Onboarding**: Student registers, selects target career (e.g. Machine Learning Engineer), selects known skills, and configures learning preferences.
2. **Skill Assessment & Diagnostic**: Student takes skill assessments containing questions linked to specific career skills. Submissions are auto-graded and proficiency levels (0-39% Beginner, 40-69% Intermediate, 70-100% Advanced) stored in `student_skills`.
3. **Skill Gap Diagnostics**: System computes `Skill Gap = Required Proficiency - Current Proficiency` for each skill.
4. **Hybrid Course Ranking**: Candidate courses are ranked according to:
   $$\text{Score} = 0.30 \times S_{\text{gap}} + 0.25 \times S_{\text{prereq}} + 0.20 \times S_{\text{relevance}} + 0.15 \times S_{\text{perf}} + 0.10 \times S_{\text{diff}}$$
5. **Adaptive Roadmap Generation**: Step statuses (`completed`, `current`, `recommended`, `locked`, `needs_revision`) adapt dynamically after each quiz or lesson completion.
