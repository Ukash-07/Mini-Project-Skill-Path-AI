const path = require('path');
const backendNodeModules = path.join(__dirname, '../backend/node_modules');
const mysql = require(path.join(backendNodeModules, 'mysql2/promise'));
const bcrypt = require(path.join(backendNodeModules, 'bcryptjs'));
const fs = require('fs');
require(path.join(backendNodeModules, 'dotenv')).config({ path: path.join(__dirname, '../backend/.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ukash12bit',
  multipleStatements: true
};

async function setupDatabase() {
  console.log('--- Starting SkillPath AI Database Setup ---');
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server on host:', config.host);

    // Recreate clean database
    console.log('Recreating fresh learning_path_db schema...');
    await connection.query('DROP DATABASE IF EXISTS learning_path_db;');
    await connection.query('CREATE DATABASE learning_path_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.changeUser({ database: 'learning_path_db' });

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('Schema created successfully.');

    // Seed Core Data
    console.log('Seeding SkillPath AI core data...');
    
    // 1. Create Default Admin & Sample Student
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const studentPasswordHash = await bcrypt.hash('Student@12345', 10);

    await connection.query(`
      INSERT INTO users (id, full_name, email, password_hash, role) VALUES
      (1, 'System Admin', 'admin@learningpath.ai', ?, 'admin'),
      (2, 'Alex Morgan', 'student@learningpath.ai', ?, 'student')
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role);
    `, [adminPasswordHash, studentPasswordHash]);

    // 2. Comprehensive Career Roles (23 Roles across 5 Domains)
    const careers = [
      // Web and Software Development
      [
        1, 'Frontend Developer',
        'Craft intuitive, high-performance responsive web user interfaces using modern JavaScript, React, Next.js, and CSS design systems.',
        'Web Development', 'Web and Software Development', 'Beginner-Friendly', 4,
        'Basic HTML/CSS knowledge and logical thinking.',
        JSON.stringify(['E-commerce Product Showcase UI', 'Interactive SaaS Dashboard', 'Real-Time Social Feed Component'])
      ],
      [
        2, 'Backend Developer',
        'Architect scalable server architectures, secure RESTful & GraphQL APIs, microservices, and high-throughput relational/NoSQL databases.',
        'Backend Development', 'Web and Software Development', 'Intermediate', 5,
        'Basic programming syntax and understanding of client-server model.',
        JSON.stringify(['Production REST API with JWT Auth', 'Scalable URL Shortener with Redis', 'E-Commerce Order Processing Engine'])
      ],
      [
        3, 'Full Stack Developer',
        'Architect and deliver end-to-end modern web applications bridging user experience, backend services, database transactions, and cloud deployments.',
        'Software Engineering', 'Web and Software Development', 'Intermediate', 6,
        'Basic web literacy and programming fundamentals.',
        JSON.stringify(['Collaborative Project Management App', 'Full Stack Marketplace Portal', 'Real-Time Chat & Notification System'])
      ],
      [
        4, 'Java Developer',
        'Build robust enterprise-grade applications, microservices, and distributed backend systems with Core Java, Spring Boot, and JPA/Hibernate.',
        'Software Engineering', 'Web and Software Development', 'Intermediate', 5,
        'Object-oriented programming concepts and algorithm basics.',
        JSON.stringify(['Banking Transaction Service with Spring Boot', 'Inventory Management Microservice', 'JWT Authentication Resource Server'])
      ],
      [
        5, 'Python Developer',
        'Build rapid web applications, automated scripting pipelines, and backend APIs utilizing Python, Django, FastAPI, and data manipulation tools.',
        'Software Engineering', 'Web and Software Development', 'Beginner-Friendly', 4,
        'Basic computational logic and scripting interest.',
        JSON.stringify(['FastAPI Asynchronous Microservice', 'Web Scraping & ETL Data Pipeline', 'Django Customer Portal with PostgreSQL'])
      ],
      [
        6, 'Software Engineer',
        'Design reliable computer software, apply rigorous data structures and algorithms, system design patterns, and maintain production code quality.',
        'Software Engineering', 'Web and Software Development', 'Intermediate', 6,
        'Foundational programming knowledge in any language.',
        JSON.stringify(['Distributed Task Scheduler', 'High-Concurrency In-Memory Cache', 'File Storage & Sync Engine'])
      ],
      [
        7, 'Mobile App Developer',
        'Develop cross-platform and native iOS & Android applications with fluid gesture interactions using Flutter or React Native.',
        'Mobile Development', 'Web and Software Development', 'Beginner-Friendly', 5,
        'Basic JavaScript or Dart programming concepts.',
        JSON.stringify(['Fitness & Habit Tracking App', 'E-Commerce Mobile Storefront', 'Real-Time Offline-First Messaging App'])
      ],

      // Data and Artificial Intelligence
      [
        8, 'Data Analyst',
        'Transform complex organizational datasets into actionable business intelligence dashboards using SQL, Excel, Python, Power BI, and Tableau.',
        'Data Science', 'Data and Artificial Intelligence', 'Beginner-Friendly', 3,
        'Basic math, spreadsheet familiarity, and analytical curiosity.',
        JSON.stringify(['Executive Sales Performance Dashboard', 'Customer Churn Analysis Report', 'Cohort Retention & LTV Diagnostic'])
      ],
      [
        9, 'Data Scientist',
        'Apply advanced statistical inference, machine learning algorithms, and predictive modeling to solve high-impact exploratory data problems.',
        'Data Science', 'Data and Artificial Intelligence', 'Intermediate', 6,
        'College-level algebra, statistics, and Python scripting.',
        JSON.stringify(['Credit Card Fraud Detection Classifier', 'Customer Segmentation Clustering Model', 'House Price Regression Forecaster'])
      ],
      [
        10, 'Machine Learning Engineer',
        'Bridge data science and software engineering by designing, training, deploying, and maintaining production-scale ML models.',
        'Artificial Intelligence', 'Data and Artificial Intelligence', 'Advanced', 6,
        'Solid Python, linear algebra, and data manipulation skills.',
        JSON.stringify(['End-to-End Recommendation Engine API', 'Automated ML Training & Drift Detection Pipeline', 'Image Classification Service Containerized in Docker'])
      ],
      [
        11, 'AI Engineer',
        'Integrate state-of-the-art foundation models, neural networks, computer vision, and NLP APIs into production consumer applications.',
        'Artificial Intelligence', 'Data and Artificial Intelligence', 'Intermediate', 5,
        'Python programming and familiarity with REST APIs.',
        JSON.stringify(['Multimodal Visual Assistant', 'Semantic Search & QA Engine with Vector DB', 'Voice AI Transcription & Summarizer'])
      ],
      [
        12, 'Generative AI Developer',
        'Build production generative AI applications using Large Language Models (LLMs), LangChain, LlamaIndex, Prompt Engineering, and RAG pipelines.',
        'Artificial Intelligence', 'Data and Artificial Intelligence', 'Intermediate', 4,
        'Python or JavaScript API development experience.',
        JSON.stringify(['Enterprise Document RAG Knowledge Bot', 'Autonomous Multi-Agent Researcher', 'Code Refactoring & Unit Test Generator'])
      ],
      [
        13, 'Data Engineer',
        'Construct reliable big-data pipelines, warehousing solutions, ETL architectures, and distributed streaming workflows with SQL, Spark, and Airflow.',
        'Data Science', 'Data and Artificial Intelligence', 'Advanced', 6,
        'Strong SQL and procedural programming fundamentals.',
        JSON.stringify(['Streaming Clickstream Ingestion with Kafka', 'Automated ETL Orchestration with Airflow', 'Snowflake Analytics Data Warehouse'])
      ],

      // Cloud and Infrastructure
      [
        14, 'DevOps Engineer',
        'Automate continuous integration and continuous deployment (CI/CD) pipelines, infrastructure as code (IaC), containerization, and cloud delivery.',
        'DevOps & Cloud', 'Cloud and Infrastructure', 'Intermediate', 5,
        'Linux command line familiarity and basic networking concepts.',
        JSON.stringify(['GitHub Actions CI/CD to AWS ECS', 'Terraform Automated Cloud VPC Setup', 'Multi-Environment Docker Compose Pipeline'])
      ],
      [
        15, 'Cloud Engineer',
        'Architect, migrate, and secure scalable multi-tenant infrastructure and serverless workloads on major cloud providers like AWS, Azure, and GCP.',
        'DevOps & Cloud', 'Cloud and Infrastructure', 'Intermediate', 5,
        'Basic OS knowledge and computer networking principles.',
        JSON.stringify(['Highly Available Auto-Scaling Web App on AWS', 'Serverless Event-Driven Image Processor', 'Zero-Trust Cloud IAM Security Architecture'])
      ],
      [
        16, 'Site Reliability Engineer',
        'Ensure system uptime, resilience, latency optimization, observability, automated incident remediation, and disaster recovery.',
        'DevOps & Cloud', 'Cloud and Infrastructure', 'Advanced', 6,
        'System administration, networking, and scripting skills.',
        JSON.stringify(['Prometheus & Grafana Observability Stack', 'Chaos Engineering Fault Injection Suite', 'Automated Failover & Canary Deployment Controller'])
      ],

      // Security and Testing
      [
        17, 'Cybersecurity Analyst',
        'Defend corporate infrastructure, monitor security event logs (SIEM), mitigate vulnerability threats, and enforce network compliance.',
        'Security', 'Security and Testing', 'Intermediate', 5,
        'TCP/IP networking, operating systems, and security basics.',
        JSON.stringify(['Threat Incident Response Simulation', 'Network Intrusion Detection System (Snort)', 'Vulnerability Assessment Audit Report'])
      ],
      [
        18, 'Ethical Security Testing Learner',
        'Master ethical hacking methodologies, penetration testing, web vulnerability exploit analysis (OWASP Top 10), and bug bounty reconnaissance.',
        'Security', 'Security and Testing', 'Intermediate', 5,
        'Basic HTTP protocol, Linux terminal, and networking.',
        JSON.stringify(['Web Application Penetration Test Audit', 'Automated Security Scanner Script', 'Burp Suite API Vulnerability Assessment'])
      ],
      [
        19, 'Software Test Engineer',
        'Create robust software verification plans, write test specifications, execute regression testing suites, and guarantee defect-free deployments.',
        'Quality Assurance', 'Security and Testing', 'Beginner-Friendly', 3,
        'Understanding of software lifecycle and analytical detail.',
        JSON.stringify(['End-to-End Test Plan for SaaS Portal', 'API Integration Test Suite in Postman', 'Cross-Browser Compatibility Test Matrix'])
      ],
      [
        20, 'Automation Test Engineer',
        'Program automated regression testing suites, CI/CD quality gates, and UI/API automation frameworks with Selenium, Cypress, Playwright, and PyTest.',
        'Quality Assurance', 'Security and Testing', 'Intermediate', 4,
        'Basic scripting in Python, Java, or JavaScript.',
        JSON.stringify(['Cypress E2E Automation Framework for E-Commerce', 'Selenium Parallel Test Runner with PyTest', 'Automated Postman Collection in GitHub Actions'])
      ],

      // Other Technical Roles
      [
        21, 'Database Administrator',
        'Administer relational databases, configure replication clusters, perform performance tuning, indexing optimizations, and disaster recovery.',
        'Databases', 'Other Technical Roles', 'Intermediate', 5,
        'Strong SQL and relational data model understanding.',
        JSON.stringify(['High-Availability MySQL Primary-Replica Cluster', 'Query Performance Optimization & Index Tuning Audit', 'Automated Database Backup & Restore Automation'])
      ],
      [
        22, 'UI/UX Designer',
        'Design user-centric digital experiences, conduct wireframing, build interactive Figma prototypes, and establish scalable design systems.',
        'Design', 'Other Technical Roles', 'Beginner-Friendly', 3,
        'Empathy for user experience, aesthetics, and design curiosity.',
        JSON.stringify(['Full Mobile Banking App Design in Figma', 'Design System & Component Library with Auto-Layout', 'Usability Study & Interactive Wireframe Flow'])
      ],
      [
        23, 'Business Intelligence Developer',
        'Build dimensional data models, enterprise reporting warehouses, and executive analytics pipelines with Power BI, DAX, and SQL.',
        'Data Science', 'Other Technical Roles', 'Beginner-Friendly', 4,
        'Spreadsheet reporting and basic database query knowledge.',
        JSON.stringify(['Enterprise Financial KPI Dashboard in Power BI', 'Star Schema Dimensional Data Model', 'Automated Scheduled Executive Email Reports'])
      ]
    ];

    for (const [id, name, desc, cat, domain, diff, prep, prereq, proj] of careers) {
      await connection.query(
        `INSERT INTO careers (id, name, description, category, domain, difficulty, estimated_prep_months, prerequisites, sample_projects)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name), description=VALUES(description), category=VALUES(category),
           domain=VALUES(domain), difficulty=VALUES(difficulty), estimated_prep_months=VALUES(estimated_prep_months),
           prerequisites=VALUES(prerequisites), sample_projects=VALUES(sample_projects);`,
        [id, name, desc, cat, domain, diff, prep, prereq, proj]
      );
    }
    console.log(`Seeded ${careers.length} comprehensive career roles.`);

    // 3. Technical Skills Catalog (60+ Skills)
    const skills = [
      // Web & Programming
      [1, 'HTML & CSS', 'Semantic HTML5 structure and responsive CSS flexbox/grid layout designs.', 'Web Development', 'Beginner'],
      [2, 'JavaScript', 'Modern ECMAScript programming, async/await, closures, and browser APIs.', 'Programming', 'Beginner'],
      [3, 'TypeScript', 'Static typing, interfaces, generics, and compile-time type safety for JS.', 'Programming', 'Intermediate'],
      [4, 'React', 'Component-based UI development, hooks, state management, and virtual DOM.', 'Web Development', 'Intermediate'],
      [5, 'Next.js', 'React framework for server-side rendering, static site generation, and full-stack routing.', 'Web Development', 'Intermediate'],
      [6, 'Tailwind CSS', 'Utility-first CSS framework for rapid modern responsive UI construction.', 'Web Development', 'Beginner'],
      [7, 'Node.js', 'Event-driven server-side JavaScript runtime environment.', 'Backend Development', 'Intermediate'],
      [8, 'Express.js', 'Minimalist web framework for Node.js REST API creation and middleware.', 'Backend Development', 'Intermediate'],
      [9, 'REST API Architecture', 'API design principles, endpoints, HTTP status codes, and JSON schema.', 'Backend Development', 'Intermediate'],
      [10, 'GraphQL', 'Schema-driven query language for flexible API data fetching and mutations.', 'Backend Development', 'Intermediate'],
      [11, 'JWT & Authentication', 'JSON Web Tokens, session handling, OAuth2, and password hashing security.', 'Backend Development', 'Intermediate'],
      [12, 'Python', 'Core Python programming language syntax, data structures, and OOP.', 'Programming', 'Beginner'],
      [13, 'Django', 'High-level Python web framework with ORM, built-in admin, and security.', 'Backend Development', 'Intermediate'],
      [14, 'FastAPI', 'Modern, high-performance web framework for building APIs with Python 3.8+ typing.', 'Backend Development', 'Intermediate'],
      [15, 'Java', 'Object-oriented programming, JVM memory model, multi-threading, and streams.', 'Programming', 'Intermediate'],
      [16, 'Spring Boot', 'Enterprise Java framework for production microservices and dependency injection.', 'Backend Development', 'Intermediate'],

      // Databases
      [17, 'SQL', 'Relational database query language for data retrieval, filtering, joins, and aggregates.', 'Databases', 'Beginner'],
      [18, 'MySQL', 'Relational database management system with ACID compliance and indexing.', 'Databases', 'Beginner'],
      [19, 'PostgreSQL', 'Advanced open-source relational database supporting JSONB and full-text search.', 'Databases', 'Intermediate'],
      [20, 'MongoDB', 'NoSQL document database, aggregation pipelines, and flexible schema design.', 'Databases', 'Intermediate'],
      [21, 'Redis', 'In-memory data structure store used for caching, pub/sub, and session storage.', 'Databases', 'Intermediate'],
      [22, 'Database Indexing & Optimization', 'B-trees, query execution plans, normalization, and performance tuning.', 'Databases', 'Advanced'],

      // DevOps, Cloud & Tools
      [23, 'Git & GitHub', 'Distributed version control, branching workflows, PRs, and merge conflict resolution.', 'DevOps', 'Beginner'],
      [24, 'Linux Basics', 'Bash command line navigation, shell scripts, permissions, process management, and SSH.', 'DevOps', 'Beginner'],
      [25, 'Docker', 'Containerizing applications, Dockerfiles, compose stacks, and volume mounts.', 'DevOps', 'Intermediate'],
      [26, 'Kubernetes', 'Container orchestration, pods, services, ingress, config maps, and deployments.', 'Cloud Computing', 'Advanced'],
      [27, 'CI/CD Pipelines', 'Automated testing and continuous delivery workflows with GitHub Actions.', 'DevOps', 'Intermediate'],
      [28, 'AWS Fundamentals', 'Amazon Web Services core services: EC2, S3, IAM, Lambda, RDS, VPC.', 'Cloud Computing', 'Intermediate'],
      [29, 'Terraform', 'Infrastructure as Code (IaC) for declaring cloud resources declaratively.', 'DevOps', 'Advanced'],
      [30, 'System Design Fundamentals', 'Horizontal scaling, load balancing, caching, microservices, and CAP theorem.', 'Software Engineering', 'Advanced'],

      // Data Science & AI
      [31, 'Statistics & Probability', 'Probability distributions, hypothesis testing, variance, and Bayesian inference.', 'Data Science', 'Beginner'],
      [32, 'Linear Algebra', 'Vectors, matrices, eigenvalues, eigenvectors, and dimensionality reduction.', 'Mathematics', 'Intermediate'],
      [33, 'NumPy', 'Multidimensional arrays, vectorization, and numerical operations in Python.', 'Data Science', 'Intermediate'],
      [34, 'Pandas', 'Data manipulation, cleaning, filtering, and aggregation with DataFrames.', 'Data Science', 'Intermediate'],
      [35, 'Data Visualization', 'Creating compelling visual dashboards with Matplotlib, Seaborn, or Plotly.', 'Data Science', 'Beginner'],
      [36, 'Power BI & Tableau', 'Building interactive business intelligence reports, DAX queries, and KPI charts.', 'Data Science', 'Beginner'],
      [37, 'Machine Learning', 'Supervised and unsupervised algorithms, model evaluation, and cross-validation.', 'Artificial Intelligence', 'Intermediate'],
      [38, 'Deep Learning', 'Neural networks, backpropagation, CNNs, RNNs, PyTorch, and TensorFlow.', 'Artificial Intelligence', 'Advanced'],
      [39, 'Natural Language Processing', 'Text tokenization, embeddings, sentiment analysis, and Transformer architectures.', 'Artificial Intelligence', 'Advanced'],
      [40, 'Large Language Models (LLMs)', 'Foundation models, prompt engineering, fine-tuning, embeddings, and context windows.', 'Artificial Intelligence', 'Intermediate'],
      [41, 'LangChain & RAG', 'Retrieval-Augmented Generation, vector databases (Pinecone, Chroma), and agentic workflows.', 'Artificial Intelligence', 'Intermediate'],
      [42, 'ML Deployment & MLOps', 'Serving models via REST APIs, containerization, model monitoring, and MLflow.', 'Artificial Intelligence', 'Advanced'],
      [43, 'Big Data & Spark', 'Distributed data processing, PySpark, data lakes, and ETL pipelines.', 'Data Science', 'Advanced'],

      // Security & Testing
      [44, 'Network Security', 'Firewalls, TCP/IP protocols, DNS, TLS/SSL certificates, and subnetting.', 'Security', 'Intermediate'],
      [45, 'Web Security (OWASP Top 10)', 'SQL injection, XSS, CSRF, security headers, CORS, and sanitization.', 'Security', 'Intermediate'],
      [46, 'Ethical Hacking & Pen Testing', 'Reconnaissance, vulnerability scanning, exploit frameworks, and Burp Suite.', 'Security', 'Advanced'],
      [47, 'Manual QA & Test Planning', 'Test cases, bug reporting, boundary value analysis, and equivalence partitioning.', 'Quality Assurance', 'Beginner'],
      [48, 'Selenium & E2E Testing', 'Browser automation, WebDriver APIs, page object models, and test reporting.', 'Quality Assurance', 'Intermediate'],
      [49, 'Cypress & Playwright', 'Modern JavaScript end-to-end and component automated testing frameworks.', 'Quality Assurance', 'Intermediate'],
      [50, 'API Testing & Postman', 'HTTP request automation, test assertions, environment variables, and Newman runner.', 'Quality Assurance', 'Beginner'],
      [51, 'Unit Testing (Jest/PyTest)', 'Unit testing principles, test-driven development (TDD), mocking, and code coverage.', 'Quality Assurance', 'Intermediate'],

      // Mobile & Design
      [52, 'Flutter & Dart', 'Cross-platform mobile UI development, widget lifecycle, and state management.', 'Mobile Development', 'Intermediate'],
      [53, 'React Native', 'Mobile app development with JavaScript/React targeting iOS and Android.', 'Mobile Development', 'Intermediate'],
      [54, 'UI/UX Design & Figma', 'User flows, wireframing, high-fidelity prototypes, components, and auto-layout.', 'Design', 'Beginner'],
      [55, 'User Research & Usability', 'User personas, heuristic evaluations, usability testing, and accessibility.', 'Design', 'Beginner'],
      [56, 'Data Warehousing & Modeling', 'Star schema, snowflake schema, dimensional modeling, and ETL architecture.', 'Data Science', 'Intermediate'],
      [57, 'Site Reliability & Monitoring', 'SLOs, SLIs, error budgets, Prometheus, Grafana, and incident triage.', 'DevOps', 'Advanced'],
      [58, 'Database Administration (DBA)', 'Replication topologies, point-in-time recovery, user access privileges, and vacuuming.', 'Databases', 'Advanced'],
      [59, 'Microservices Architecture', 'Service discovery, API gateways, event-driven messaging, and domain-driven design.', 'Software Engineering', 'Advanced'],
      [60, 'Asynchronous Programming', 'Event loop, callbacks, promises, async/await, and non-blocking I/O patterns.', 'Programming', 'Intermediate']
    ];

    for (const [id, name, desc, cat, diff] of skills) {
      await connection.query(
        `INSERT INTO skills (id, name, description, category, difficulty)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), category=VALUES(category), difficulty=VALUES(difficulty);`,
        [id, name, desc, cat, diff]
      );
    }
    console.log(`Seeded ${skills.length} technical skills.`);

    // 4. Map Required Skills per Career Role (with Phase Order, Priority & Weight)
    // Helper to insert career skills
    const roleSkillMap = [
      // 1. Frontend Developer
      [1, 1, 85, 0.90, 'High', 1, 'Web layout fundamentals'], // HTML & CSS
      [1, 2, 85, 1.00, 'High', 1, 'Prerequisite for React'],   // JavaScript
      [1, 6, 80, 0.70, 'Medium', 2, 'Requires CSS'],          // Tailwind CSS
      [1, 4, 85, 1.00, 'High', 2, 'Requires JavaScript'],      // React
      [1, 3, 75, 0.80, 'Medium', 3, 'Requires JavaScript'],    // TypeScript
      [1, 5, 75, 0.80, 'Medium', 4, 'Requires React'],         // Next.js
      [1, 23, 75, 0.70, 'Medium', 4, 'Essential tooling'],     // Git & GitHub
      [1, 51, 70, 0.60, 'Low', 5, 'Component unit testing'],   // Unit Testing

      // 2. Backend Developer (Node.js focus)
      [2, 2, 85, 0.90, 'High', 1, 'Core language'],            // JavaScript
      [2, 60, 85, 0.95, 'High', 1, 'Asynchronous JS'],         // Async Programming
      [2, 7, 85, 1.00, 'High', 2, 'Requires JavaScript'],      // Node.js
      [2, 8, 85, 0.95, 'High', 2, 'Requires Node.js'],         // Express.js
      [2, 9, 90, 1.00, 'High', 2, 'REST Design'],              // REST API
      [2, 17, 80, 0.90, 'High', 3, 'Query basics'],            // SQL
      [2, 18, 80, 0.90, 'High', 3, 'Relational DB'],           // MySQL
      [2, 20, 75, 0.80, 'Medium', 3, 'NoSQL DB'],              // MongoDB
      [2, 11, 85, 0.90, 'High', 4, 'Security & Tokens'],       // JWT & Auth
      [2, 21, 75, 0.75, 'Medium', 4, 'Caching layer'],         // Redis
      [2, 50, 75, 0.70, 'Medium', 4, 'Postman testing'],       // API Testing
      [2, 23, 80, 0.75, 'Medium', 4, 'Version control'],       // Git & GitHub
      [2, 25, 75, 0.80, 'Medium', 5, 'Containerization'],      // Docker
      [2, 30, 75, 0.85, 'Medium', 5, 'System Design'],         // System Design

      // 3. Full Stack Developer
      [3, 1, 80, 0.80, 'High', 1, 'HTML/CSS basics'],
      [3, 2, 85, 0.95, 'High', 1, 'JavaScript core'],
      [3, 4, 85, 0.95, 'High', 2, 'React UI'],
      [3, 7, 85, 0.95, 'High', 2, 'Node.js backend'],
      [3, 8, 80, 0.90, 'High', 2, 'Express.js'],
      [3, 18, 80, 0.85, 'High', 3, 'MySQL'],
      [3, 20, 75, 0.80, 'Medium', 3, 'MongoDB'],
      [3, 11, 85, 0.90, 'High', 4, 'JWT Auth'],
      [3, 23, 80, 0.80, 'High', 4, 'Git & GitHub'],
      [3, 25, 75, 0.75, 'Medium', 5, 'Docker'],
      [3, 28, 70, 0.70, 'Low', 5, 'AWS Deployment'],

      // 4. Java Developer
      [4, 15, 90, 1.00, 'High', 1, 'Core Java OOP'],
      [4, 17, 85, 0.90, 'High', 2, 'Relational queries'],
      [4, 18, 80, 0.85, 'High', 2, 'MySQL / PostgreSQL'],
      [4, 16, 90, 1.00, 'High', 3, 'Spring Boot Framework'],
      [4, 9, 85, 0.90, 'High', 3, 'REST APIs'],
      [4, 11, 80, 0.85, 'High', 4, 'Spring Security & JWT'],
      [4, 25, 75, 0.75, 'Medium', 5, 'Docker'],
      [4, 59, 75, 0.80, 'Medium', 5, 'Microservices'],

      // 5. Python Developer
      [5, 12, 90, 1.00, 'High', 1, 'Python basics'],
      [5, 17, 80, 0.85, 'High', 2, 'SQL queries'],
      [5, 14, 85, 0.95, 'High', 3, 'FastAPI / Django'],
      [5, 9, 85, 0.90, 'High', 3, 'REST APIs'],
      [5, 19, 80, 0.80, 'Medium', 4, 'PostgreSQL'],
      [5, 25, 75, 0.75, 'Medium', 5, 'Docker container'],

      // 6. Software Engineer
      [6, 2, 80, 0.85, 'High', 1, 'Algorithms & Scripting'],
      [6, 12, 80, 0.85, 'High', 1, 'Python / Core language'],
      [6, 17, 80, 0.85, 'High', 2, 'Relational databases'],
      [6, 23, 85, 0.80, 'High', 2, 'Git workflows'],
      [6, 30, 85, 1.00, 'High', 3, 'System Design & Scalability'],
      [6, 25, 75, 0.75, 'Medium', 4, 'Docker'],
      [6, 51, 80, 0.80, 'Medium', 4, 'Unit testing & TDD'],

      // 7. Mobile App Developer
      [7, 2, 80, 0.85, 'High', 1, 'JavaScript / Dart basics'],
      [7, 53, 90, 1.00, 'High', 2, 'React Native / Flutter'],
      [7, 9, 80, 0.85, 'High', 3, 'Consuming REST APIs'],
      [7, 11, 75, 0.80, 'Medium', 4, 'Mobile Authentication'],
      [7, 23, 75, 0.75, 'Medium', 4, 'Git & GitHub'],

      // 8. Data Analyst
      [8, 17, 85, 1.00, 'High', 1, 'SQL Joins & Aggregates'],
      [8, 12, 75, 0.80, 'Medium', 2, 'Python basics'],
      [8, 34, 85, 0.95, 'High', 2, 'Pandas manipulation'],
      [8, 35, 85, 0.90, 'High', 3, 'Data Visualization'],
      [8, 36, 90, 1.00, 'High', 4, 'Power BI & Tableau'],
      [8, 31, 75, 0.75, 'Medium', 4, 'Business Statistics'],

      // 9. Data Scientist
      [9, 12, 90, 1.00, 'High', 1, 'Python programming'],
      [9, 31, 85, 0.95, 'High', 1, 'Statistics & Probability'],
      [9, 33, 85, 0.90, 'High', 2, 'NumPy'],
      [9, 34, 90, 0.95, 'High', 2, 'Pandas'],
      [9, 17, 80, 0.85, 'High', 2, 'SQL queries'],
      [9, 37, 90, 1.00, 'High', 3, 'Machine Learning algorithms'],
      [9, 38, 80, 0.85, 'High', 4, 'Deep Learning (PyTorch)'],
      [9, 39, 75, 0.80, 'Medium', 5, 'NLP fundamentals'],

      // 10. Machine Learning Engineer
      [10, 12, 90, 1.00, 'High', 1, 'Python OOP'],
      [10, 31, 80, 0.85, 'High', 1, 'Math & Statistics'],
      [10, 34, 85, 0.90, 'High', 2, 'Pandas & Preprocessing'],
      [10, 37, 90, 1.00, 'High', 3, 'ML Algorithms'],
      [10, 38, 85, 0.95, 'High', 3, 'Deep Learning (PyTorch/TF)'],
      [10, 25, 80, 0.85, 'High', 4, 'Docker containerization'],
      [10, 42, 85, 0.95, 'High', 5, 'MLOps & Model Serving'],

      // 11. AI Engineer
      [11, 12, 85, 0.95, 'High', 1, 'Python APIs'],
      [11, 37, 80, 0.85, 'High', 2, 'ML concepts'],
      [11, 38, 80, 0.85, 'High', 3, 'Neural networks'],
      [11, 40, 90, 1.00, 'High', 4, 'Foundation LLMs & APIs'],
      [11, 41, 90, 1.00, 'High', 4, 'LangChain & Vector DBs'],
      [11, 25, 75, 0.75, 'Medium', 5, 'Container deployment'],

      // 12. Generative AI Developer
      [12, 12, 85, 0.95, 'High', 1, 'Python scripting'],
      [12, 9, 80, 0.85, 'High', 2, 'REST APIs'],
      [12, 40, 95, 1.00, 'High', 3, 'LLM Prompt Engineering'],
      [12, 41, 95, 1.00, 'High', 4, 'LangChain & RAG Architecture'],
      [12, 20, 80, 0.80, 'Medium', 4, 'Vector Databases (Pinecone)'],
      [12, 25, 75, 0.75, 'Medium', 5, 'Docker deployment'],

      // 13. Data Engineer
      [13, 17, 95, 1.00, 'High', 1, 'Advanced SQL'],
      [13, 12, 85, 0.90, 'High', 1, 'Python data pipelines'],
      [13, 19, 85, 0.90, 'High', 2, 'PostgreSQL & Indexing'],
      [13, 56, 90, 0.95, 'High', 3, 'Data Warehousing & Star Schema'],
      [13, 43, 85, 0.95, 'High', 4, 'Apache Spark & Big Data'],
      [13, 27, 80, 0.80, 'Medium', 5, 'CI/CD & Orchestration'],

      // 14. DevOps Engineer
      [14, 24, 90, 1.00, 'High', 1, 'Linux Bash & SSH'],
      [14, 23, 85, 0.85, 'High', 1, 'Git versioning'],
      [14, 25, 90, 1.00, 'High', 2, 'Docker containerization'],
      [14, 27, 90, 1.00, 'High', 3, 'GitHub Actions CI/CD'],
      [14, 28, 85, 0.90, 'High', 4, 'AWS Cloud Core'],
      [14, 26, 85, 0.95, 'High', 4, 'Kubernetes Orchestration'],
      [14, 29, 80, 0.85, 'High', 5, 'Terraform IaC'],

      // 15. Cloud Engineer
      [15, 24, 85, 0.90, 'High', 1, 'Linux system administration'],
      [15, 44, 80, 0.85, 'High', 2, 'Networking & DNS'],
      [15, 28, 95, 1.00, 'High', 3, 'AWS Cloud Architecture'],
      [15, 25, 80, 0.85, 'High', 3, 'Docker containers'],
      [15, 29, 80, 0.85, 'High', 4, 'Terraform infrastructure'],
      [15, 26, 75, 0.80, 'Medium', 5, 'Kubernetes'],

      // 16. Site Reliability Engineer (SRE)
      [16, 24, 90, 1.00, 'High', 1, 'Linux kernel & processes'],
      [16, 25, 85, 0.90, 'High', 2, 'Docker'],
      [16, 26, 90, 0.95, 'High', 3, 'Kubernetes in production'],
      [16, 57, 95, 1.00, 'High', 4, 'Observability (Prometheus/Grafana)'],
      [16, 27, 85, 0.85, 'High', 4, 'CI/CD deployment gates'],
      [16, 30, 85, 0.90, 'High', 5, 'System reliability architecture'],

      // 17. Cybersecurity Analyst
      [17, 44, 90, 1.00, 'High', 1, 'Network Security Protocols'],
      [17, 24, 85, 0.85, 'High', 1, 'Linux security administration'],
      [17, 45, 90, 1.00, 'High', 2, 'OWASP Top 10 web vulnerabilities'],
      [17, 46, 80, 0.85, 'High', 3, 'Penetration testing basics'],
      [17, 23, 70, 0.65, 'Low', 4, 'Git auditing'],

      // 18. Ethical Security Testing Learner
      [18, 44, 85, 0.90, 'High', 1, 'Network & Port Scanning'],
      [18, 24, 85, 0.90, 'High', 1, 'Linux tools (Kali/Bash)'],
      [18, 45, 95, 1.00, 'High', 2, 'OWASP Web Attacks'],
      [18, 46, 95, 1.00, 'High', 3, 'Burp Suite & Penetration Testing'],
      [18, 50, 80, 0.80, 'Medium', 4, 'API Vulnerability Assessment'],

      // 19. Software Test Engineer
      [19, 47, 90, 1.00, 'High', 1, 'Manual Testing & Test Plans'],
      [19, 50, 85, 0.95, 'High', 2, 'API Testing with Postman'],
      [19, 17, 75, 0.80, 'Medium', 2, 'SQL verification queries'],
      [19, 23, 75, 0.75, 'Medium', 3, 'Git & Version Control'],
      [19, 48, 70, 0.70, 'Low', 4, 'Selenium basics'],

      // 20. Automation Test Engineer
      [20, 2, 80, 0.85, 'High', 1, 'JavaScript / Python for QA'],
      [20, 48, 90, 1.00, 'High', 2, 'Selenium WebDriver framework'],
      [20, 49, 90, 1.00, 'High', 3, 'Cypress & Playwright E2E'],
      [20, 50, 85, 0.90, 'High', 3, 'Postman API automation'],
      [20, 51, 85, 0.85, 'High', 4, 'PyTest / Jest test runners'],
      [20, 27, 80, 0.80, 'Medium', 5, 'CI/CD pipeline test integration'],

      // 21. Database Administrator (DBA)
      [21, 17, 95, 1.00, 'High', 1, 'Complex SQL queries'],
      [21, 18, 95, 1.00, 'High', 2, 'MySQL administration'],
      [21, 19, 90, 0.95, 'High', 2, 'PostgreSQL configuration'],
      [21, 22, 95, 1.00, 'High', 3, 'Indexing & Query Optimization'],
      [21, 58, 95, 1.00, 'High', 4, 'Replication, Clustering & Backups'],
      [21, 24, 80, 0.80, 'Medium', 5, 'Linux server administration'],

      // 22. UI/UX Designer
      [22, 54, 95, 1.00, 'High', 1, 'Figma & UI Design Systems'],
      [22, 55, 90, 0.95, 'High', 2, 'User Research & Personas'],
      [22, 1, 75, 0.70, 'Medium', 3, 'HTML & CSS layout awareness'],
      [22, 6, 70, 0.65, 'Low', 4, 'Tailwind styling awareness'],

      // 23. Business Intelligence Developer
      [23, 17, 90, 1.00, 'High', 1, 'Advanced SQL queries & aggregations'],
      [23, 36, 95, 1.00, 'High', 2, 'Power BI & DAX Formulas'],
      [23, 56, 90, 0.95, 'High', 3, 'Dimensional Data Modeling'],
      [23, 35, 85, 0.85, 'High', 4, 'Data Visualization & Storytelling']
    ];

    for (const [cId, sId, reqProf, weight, prio, phase, prereq] of roleSkillMap) {
      await connection.query(
        `INSERT INTO career_skills (career_id, skill_id, required_proficiency, importance_weight, priority, phase_order, prerequisites)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           required_proficiency=VALUES(required_proficiency),
           importance_weight=VALUES(importance_weight),
           priority=VALUES(priority),
           phase_order=VALUES(phase_order),
           prerequisites=VALUES(prerequisites);`,
        [cId, sId, reqProf, weight, prio, phase, prereq]
      );
    }
    console.log(`Mapped ${roleSkillMap.length} role required skills.`);

    // 5. Seed Curated Learning Resources with Working URLs
    const resources = [
      [1, 'MDN: Getting Started with HTML & CSS', 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 'Documentation', 'MDN Web Docs', 'Beginner', 60],
      [1, 'freeCodeCamp: Responsive Web Design Certification', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', 'Interactive Courses', 'freeCodeCamp', 'Beginner', 300],
      [2, 'JavaScript.info: The Modern JavaScript Tutorial', 'https://javascript.info/', 'Documentation', 'JavaScript.info', 'Beginner', 180],
      [2, 'freeCodeCamp: JavaScript Algorithms and Data Structures', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/', 'Interactive Courses', 'freeCodeCamp', 'Intermediate', 240],
      [4, 'React Official Documentation (Learn React)', 'https://react.dev/learn', 'Documentation', 'React.dev', 'Intermediate', 120],
      [4, 'freeCodeCamp: React Full Course for Beginners', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 'Videos', 'YouTube', 'Beginner', 180],
      [7, 'Node.js Official Getting Started Guide', 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', 'Documentation', 'Node.js Docs', 'Intermediate', 90],
      [8, 'Express.js Framework Guide & Middleware Tutorial', 'https://expressjs.com/en/starter/installing.html', 'Documentation', 'Express.js', 'Intermediate', 90],
      [9, 'RESTful API Design Best Practices (Microsoft Learn)', 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design', 'Documentation', 'Microsoft Docs', 'Intermediate', 45],
      [11, 'JWT.io: Introduction to JSON Web Tokens', 'https://jwt.io/introduction', 'Documentation', 'Auth0 / JWT.io', 'Intermediate', 45],
      [17, 'SQLBolt: Interactive SQL Lessons & Exercises', 'https://sqlbolt.com/', 'Interactive Courses', 'SQLBolt', 'Beginner', 90],
      [18, 'MySQL 8.0 Reference Manual: Core Concepts & Queries', 'https://dev.mysql.com/doc/refman/8.0/en/tutorial.html', 'Documentation', 'MySQL Docs', 'Intermediate', 120],
      [20, 'MongoDB University: Introduction to MongoDB', 'https://learn.mongodb.com/', 'Interactive Courses', 'MongoDB University', 'Beginner', 120],
      [23, 'Pro Git Book (Official Git Documentation)', 'https://git-scm.com/book/en/v2', 'Documentation', 'Git SCM', 'Beginner', 90],
      [25, 'Docker Getting Started Tutorial & Container Lab', 'https://docs.docker.com/get-started/', 'Interactive Courses', 'Docker Docs', 'Intermediate', 90],
      [28, 'AWS Cloud Essentials Training (AWS Skill Builder)', 'https://explore.skillbuilder.aws/', 'Videos', 'AWS Training', 'Beginner', 150],
      [30, 'System Design Primer (GitHub Reference Architecture)', 'https://github.com/donnemartin/system-design-primer', 'Documentation', 'GitHub Open Source', 'Advanced', 240],
      [37, 'Scikit-Learn Machine Learning in Python Tutorial', 'https://scikit-learn.org/stable/tutorial/index.html', 'Documentation', 'Scikit-Learn', 'Intermediate', 150],
      [40, 'DeepLearning.AI: Prompt Engineering for Developers', 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', 'Interactive Courses', 'DeepLearning.AI', 'Beginner', 90],
      [41, 'LangChain Official Documentation & RAG Quickstart', 'https://python.langchain.com/docs/get_started/introduction', 'Documentation', 'LangChain Docs', 'Intermediate', 120],
      [45, 'OWASP Top 10 Web Application Security Risks', 'https://owasp.org/www-project-top-ten/', 'Documentation', 'OWASP Foundation', 'Intermediate', 90],
      [50, 'Postman API Learning Center & Automated Testing', 'https://learning.postman.com/docs/getting-started/introduction/', 'Interactive Courses', 'Postman Docs', 'Beginner', 60],
      [54, 'Figma for Beginners Tutorial Series', 'https://help.figma.com/hc/en-us/categories/360002051613-Figma-Design', 'Documentation', 'Figma Learn', 'Beginner', 90]
    ];

    for (const [sId, title, url, type, platform, diff, dur] of resources) {
      await connection.query(
        `INSERT INTO learning_resources (skill_id, title, url, type, platform, difficulty, duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), url=VALUES(url), type=VALUES(type);`,
        [sId, title, url, type, platform, diff, dur]
      );
    }
    console.log(`Seeded ${resources.length} curated learning resources with working links.`);

    // 6. Setup Sample Student Profile (Alex Morgan, ID: 2) Matching Prompt Example:
    // HTML, CSS, JavaScript, Node.js (Intermediate), Express.js, MySQL (Beginner)
    await connection.query(`
      INSERT INTO student_profiles (user_id, education_level, current_qualification, experience_level, target_career_id, interests, preferred_learning_style, weekly_learning_hours, onboarding_completed)
      VALUES (2, 'Undergraduate', 'Computer Science', 'Intermediate', 2, ?, 'Interactive Courses', 15, 1)
      ON DUPLICATE KEY UPDATE
        target_career_id=2,
        interests=VALUES(interests),
        preferred_learning_style=VALUES(preferred_learning_style),
        weekly_learning_hours=VALUES(weekly_learning_hours),
        onboarding_completed=1;
    `, [JSON.stringify(['Web Development', 'Software Engineering', 'Cloud Computing'])]);

    await connection.query(`
      INSERT INTO student_preferences (user_id, daily_learning_time_min, preferred_difficulty, preferred_format, target_completion_weeks)
      VALUES (2, 90, 'Intermediate', 'Interactive', 8)
      ON DUPLICATE KEY UPDATE daily_learning_time_min=90;
    `);

    // Student Skills:
    // HTML & CSS (Intermediate: 65), JavaScript (Intermediate: 70), Node.js (Intermediate: 60), Express.js (Beginner: 35), MySQL (Beginner: 30)
    const alexSkills = [
      [2, 1, 65, 'Intermediate'], // HTML & CSS
      [2, 2, 70, 'Intermediate'], // JavaScript
      [2, 7, 60, 'Intermediate'], // Node.js
      [2, 8, 35, 'Beginner'],     // Express.js
      [2, 18, 30, 'Beginner'],    // MySQL
      [2, 23, 60, 'Intermediate'] // Git & GitHub
    ];

    for (const [uId, sId, prof, status] of alexSkills) {
      await connection.query(`
        INSERT INTO student_skills (user_id, skill_id, proficiency_level, status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE proficiency_level=VALUES(proficiency_level), status=VALUES(status);
      `, [uId, sId, prof, status]);
    }
    console.log("Seeded sample student skills matching prompt baseline.");

    // 7. Seed Sample Portfolio Projects
    const sampleProjects = [
      [2, 2, 'Full Stack Authentication API', 'Robust Node.js and Express REST API featuring JWT authentication, refresh tokens, and bcrypt password hashing.', 'Node.js, Express.js, JWT, MySQL', 'https://github.com/alexmorgan/auth-rest-api', 'https://auth-api-demo.railway.app'],
      [2, 1, 'Responsive Portfolio Website', 'Clean, modern developer portfolio website built with HTML5 semantic tags, Tailwind CSS, and vanilla JavaScript animations.', 'HTML, CSS, JavaScript, Tailwind', 'https://github.com/alexmorgan/developer-portfolio', 'https://alexmorgan.dev']
    ];

    for (const [uId, cId, title, desc, skillsUsed, repo, demo] of sampleProjects) {
      await connection.query(`
        INSERT INTO student_projects (user_id, career_id, title, description, skills_used, repo_url, demo_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
        ON DUPLICATE KEY UPDATE title=VALUES(title);
      `, [uId, cId, title, desc, skillsUsed, repo, demo]);
    }
    console.log("Seeded sample portfolio projects.");

    // 8. Seed Core Course Catalog & Modules
    const sampleCourses = [
      [1, 'Complete Modern JavaScript & Asynchronous Programming', 'Master ES6+, Promises, async/await, closures, event loop, and asynchronous patterns essential for backend & frontend development.', 2, 'Beginner', 10.0, 'Programming', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80', 4.9],
      [2, 'Node.js & Express.js In-Depth API Masterclass', 'Architect production REST APIs, handle middleware, validation, error handling, file uploads, and scalable routing.', 7, 'Intermediate', 14.0, 'Backend Development', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', 4.8],
      [3, 'Relational Databases & MySQL: From Queries to Optimization', 'Master complex SQL joins, subqueries, relational schema design, transactions, indexing, and query performance tuning.', 18, 'Intermediate', 12.0, 'Databases', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80', 4.7],
      [4, 'Backend Security, JWT Authentication & Authorization', 'Implement industry-standard security protocols, OAuth2, JWT token lifecycle, rate limiting, and protection against OWASP Top 10 vulnerabilities.', 11, 'Intermediate', 8.0, 'Security', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80', 4.9],
      [5, 'Docker & Containerization for Web Developers', 'Containerize full stack Node and Python applications, configure multi-stage Dockerfiles, Docker Compose, and cloud deployment.', 25, 'Intermediate', 6.0, 'DevOps', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80', 4.8],
      [6, 'System Design Fundamentals for Scalable Applications', 'Learn horizontal scaling, distributed caching with Redis, load balancers, database sharding, and high-availability patterns.', 30, 'Advanced', 15.0, 'Software Engineering', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', 4.9]
    ];

    for (const [id, title, desc, pSkillId, diff, dur, cat, thumb, rat] of sampleCourses) {
      await connection.query(`
        INSERT INTO courses (id, title, description, primary_skill_id, difficulty, duration_hours, category, thumbnail_url, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);
      `, [id, title, desc, pSkillId, diff, dur, cat, thumb, rat]);
    }

    // Modules for Course 1
    await connection.query(`
      INSERT INTO modules (id, course_id, title, description, module_order) VALUES
      (1, 1, 'ES6+ Syntax & Scoping', 'Variables, arrow functions, destructuring, and rest/spread syntax.', 1),
      (2, 1, 'Asynchronous Programming & Promises', 'Event loop, callbacks, Promise chaining, and async/await error handling.', 2)
      ON DUPLICATE KEY UPDATE title=VALUES(title);
    `);

    // Lessons for Course 1
    await connection.query(`
      INSERT INTO lessons (id, module_id, title, content, duration_minutes, lesson_order) VALUES
      (1, 1, 'Let, Const, and Block Scoping in Depth', 'Understanding temporal dead zones, variable hoisting, and scope isolation in modern JavaScript runtimes.', 20, 1),
      (2, 2, 'Promises and Async/Await Mechanics', 'Detailed breakdown of microtask queues, rejected promises, try/catch blocks, and Promise.all concurrency.', 25, 1)
      ON DUPLICATE KEY UPDATE title=VALUES(title);
    `);

    // Assessments
    await connection.query(`
      INSERT INTO assessments (id, title, career_id, skill_id, total_marks, duration_minutes) VALUES
      (1, 'Backend JavaScript & Node.js Proficiency Benchmark', 2, 2, 50, 25),
      (2, 'SQL & Relational Database Mastery Assessment', 2, 17, 50, 25)
      ON DUPLICATE KEY UPDATE title=VALUES(title);
    `);

    // Assessment Questions
    const questions = [
      [1, 1, 2, 'Intermediate', 'Which statement accurately describes the JavaScript Event Loop when executing async/await code?', 10, 'Await suspends execution of the enclosing async function and queues the continuation as a microtask.'],
      [2, 1, 2, 'Intermediate', 'What will Promise.all([p1, p2]) do if p2 rejects while p1 is still pending?', 10, 'Promise.all immediately rejects with p2 error as soon as any promise in the array fails.'],
      [3, 1, 7, 'Intermediate', 'In Node.js, what is the primary benefit of Streams over buffer-based readFileSync?', 10, 'Streams process data piece-by-piece in memory chunks without buffering entire multi-gigabyte files into RAM.'],
      [4, 2, 17, 'Intermediate', 'What is the purpose of an INDEX on a foreign key column in MySQL?', 10, 'Indexes accelerate JOIN operations and foreign key constraint validations dramatically from O(N) to O(log N).'],
      [5, 2, 18, 'Intermediate', 'What isolation level prevents dirty reads, non-repeatable reads, and phantom reads?', 10, 'SERIALIZABLE is the highest isolation level that prevents all read anomalies.']
    ];

    for (const [id, aId, sId, diff, qText, marks, exp] of questions) {
      await connection.query(`
        INSERT INTO assessment_questions (id, assessment_id, skill_id, difficulty, question_text, marks, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE question_text=VALUES(question_text), explanation=VALUES(explanation);
      `, [id, aId, sId, diff, qText, marks, exp]);
    }

    // Assessment Options
    const options = [
      [1, 1, 'Await executes synchronous threads in background web workers', 0],
      [2, 1, 'Await suspends execution and queues continuation as a microtask', 1],
      [3, 1, 'Await converts asynchronous code into blocking OS kernel processes', 0],
      [4, 2, 'It waits for p1 to finish before reporting the error', 0],
      [5, 2, 'It immediately rejects with the first rejection reason', 1],
      [6, 3, 'Streams allow constant memory consumption regardless of file size', 1],
      [7, 3, 'Streams encrypt data before sending across networks', 0],
      [8, 4, 'To prevent duplicate primary keys in the child table', 0],
      [9, 4, 'To speed up JOIN lookups and cascade checks from linear to logarithmic time', 1],
      [10, 5, 'READ UNCOMMITTED', 0],
      [11, 5, 'READ COMMITTED', 0],
      [12, 5, 'SERIALIZABLE', 1]
    ];

    for (const [id, qId, optText, isCorr] of options) {
      await connection.query(`
        INSERT INTO assessment_options (id, question_id, option_text, is_correct)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE option_text=VALUES(option_text), is_correct=VALUES(is_correct);
      `, [id, qId, optText, isCorr]);
    }

    console.log('--- Database Setup & Seeding Completed Successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
