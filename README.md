# SkillPath AI — AI-Based Personalized Learning Path Recommendation Engine

**SkillPath AI** is a complete, modern, responsive full-stack web application that helps students identify suitable technical career roles based on their existing skills and recommends the precise skills they need to learn to become job-ready.

---

## 🚀 Key Highlights & Capabilities

1. **23 Comprehensive Technical Career Roles Across 5 Domains**:
   - **Web & Software Development**: Frontend Developer, Backend Developer, Full Stack Developer, Java Developer, Python Developer, Software Engineer, Mobile App Developer.
   - **Data & Artificial Intelligence**: Data Analyst, Data Scientist, Machine Learning Engineer, AI Engineer, Generative AI Developer, Data Engineer.
   - **Cloud & Infrastructure**: DevOps Engineer, Cloud Engineer, Site Reliability Engineer.
   - **Security & Testing**: Cybersecurity Analyst, Ethical Security Testing Learner, Software Test Engineer, Automation Test Engineer.
   - **Other Technical Roles**: Database Administrator, UI/UX Designer, Business Intelligence Developer.

2. **Explainable AI Career Recommendation Engine**:
   - Computes transparent mathematical compatibility percentages (e.g. Backend Developer 85%, Full Stack 75%, API Developer 90%, DevOps 55%) derived from genuine skill proficiencies, partial mastery, domain interest alignment bonuses, and career benchmark requirements.
   - Explains *why* each role is recommended in plain English.

3. **Personalized Skill Gap Diagnostics (No Redundant Relearning)**:
   - Compares student's current skills against industry role benchmarks.
   - Categorizes skills into:
     - **Mastered Skills**: Already known at target benchmark. Never asks students to relearn what they already know.
     - **Partially Known Skills**: Foundational knowledge exists. Recommends targeted advanced revision topics.
     - **Missing Skills**: Core requirements to master from fundamentals.
   - Generates exact curriculum topic recommendations (e.g. REST API architecture, JWT authentication, SQL joins/indexing, Docker, System design).

4. **5-Phase Personalized Learning Roadmap**:
   - Sequenced by prerequisites and difficulty:
     - Phase 1: Core Fundamentals & Prerequisite Foundations
     - Phase 2: Primary Tech Stack Mastery & Architecture
     - Phase 3: Database Design, Storage & Optimization
     - Phase 4: Professional Development, Security & Tooling
     - Phase 5: Production Deployment, Scalability & Capstone Projects
   - For every skill provides: Current vs Target proficiency, Priority, Estimated study hours, Prerequisites, Curated working resource URLs (MDN, Node.js, freeCodeCamp, Docker), Practical exercises, Mini-project/Assessment, and interactive completion toggle.

5. **AI Career & Learning Chat Assistant**:
   - Context-aware chatbot utilizing student's saved skills, active target role, and roadmap.
   - Handles queries such as:
     - *"What should I learn next?"*
     - *"Can I become a Full Stack Developer with my current skills?"*
     - *"What skills am I missing for a Backend Developer role?"*
     - *"Which project should I build next?"*
     - *"How can I improve my proficiency in Node.js?"*

6. **Interactive Role Explorer & Details**:
   - Dedicated `/roles` explorer with search, domain tabs, difficulty filters, prep time estimates, and role detail deep-dives at `/roles/:id`.

7. **Portfolio Projects & Skill Assessments**:
   - Track completed projects with GitHub repositories and live demo URLs.
   - Take 10-question skill benchmark assessments that dynamically update student proficiency in MySQL.

8. **Custom Skills & Profile Settings**:
   - Search technical catalog, adjust proficiency sliders (Beginner / Intermediate / Advanced), and add custom skills directly to profile.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, RESTful Architecture, JWT Authentication, bcryptjs, MySQL2, dotenv, cors.
- **Database**: MySQL 8+ Relational Schema with foreign keys, constraints, and automatic migration seeding.
- **UI Design**: Modern SaaS dashboard with crisp white/light theme tokens (`bg-slate-50`, `bg-white`, `border-slate-200`, `text-slate-900`, `text-indigo-600`).

---

## 📁 Application Pages & Routes

| Page # | Route | Feature Description |
|---|---|---|
| 1 | `/` | **Landing Page** with SkillPath AI branding, 5 domains showcase, and feature highlights |
| 2 | `/login` & `/register` | **Authentication** with bcrypt hashing and education level selection |
| 3 | `/onboarding` | **4-Step Student Onboarding Wizard**: Academic info, skills selection with custom skill adder, 7 interest domains, and learning preferences |
| 4 | `/dashboard` | **Main Student Dashboard**: Welcome info, top recommended roles (85%, 75%), 4 summary stats, weekly study chart, recommended next skill, and roadmap CTA |
| 5 | `/recommendations` | **AI Career Recommendations**: Ranked career matches with compatibility percentages, known/partial/missing skills, estimated preparation weeks, and explainable AI reasons |
| 6 | `/skill-gap` | **Skill Gap Analysis**: Role selector, visual benchmark comparison chart, 3-category diagnostics (Mastered, Partial, Missing), and targeted topic curriculum |
| 7 | `/roadmap` | **5-Phase Learning Roadmap**: Sequential phases, working resource URLs, exercises, mini-projects, and live completion checkbox toggles |
| 8 | `/roles` | **Explore All Career Roles**: Catalog of all 23 roles across 5 domain tabs with search and filters |
| 9 | `/roles/:id` | **Career Role Details**: Required skills checklist, prerequisites, capstone projects, and "Set as My Target Goal" action |
| 10 | `/assistant` | **AI Career Assistant**: Context-aware chat with quick-prompt chips ("What should I learn next?", "Can I become Full Stack?", etc.) |
| 11 | `/resources` | **Learning Resources Directory**: Verified documentation, interactive courses, and project guides with direct links |
| 12 | `/projects` | **Projects & Assessments**: Portfolio project manager (GitHub/Demo links) and skill assessment quizes |
| 13 | `/profile` | **Student Profile & Settings**: Background details, target career goal, interest domains, and technical skills manager with custom skill creation |

---

## ⚙️ Quick Start Instructions

### 1. Database Setup
Make sure local MySQL is running on port 3306.
Configure `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=learning_path_db
JWT_SECRET=super_secret_jwt_key_learning_path_2026
NODE_ENV=development
```

Initialize and seed the database with all 23 roles, 60 skills, and resources:
```bash
cd backend
npm install
node ../database/setup.js
```

### 2. Run the Backend API Server
```bash
cd backend
npm run dev
```
Backend API will be running at `http://localhost:5000`.

### 3. Run the Frontend React Application
```bash
cd frontend
npm install
npm run dev
```
Frontend application will be running at `http://localhost:3000`.

### 4. Demo Login Credentials
- **Student User**: `student@learningpath.ai` / `Student@12345`
- **Admin User**: `admin@learningpath.ai` / `Admin@12345`
- Or register a new student account to experience the onboarding wizard from scratch!
