const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Enable CORS & JSON parsing
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ success: true, app: 'SkillPath AI', status: 'API operational', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/learning-path', require('./routes/learningPathRoutes'));
app.use('/api/assistant', require('./routes/assistantRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Central Error Handler
app.use(errorMiddleware);

module.exports = app;
