const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// Multer memory storage configuration (5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.match(/\.(pdf|txt|md|doc|docx)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF or Text file (.pdf, .txt, .md).'));
    }
  }
});

// Analyze resume (can be accessed with auth or optional auth)
router.post('/analyze', optionalAuth, upload.single('resume'), resumeController.analyzeResume);

// Import detected skills into student profile (requires authentication)
router.post('/import-skills', authMiddleware, resumeController.importSkills);

module.exports = router;

