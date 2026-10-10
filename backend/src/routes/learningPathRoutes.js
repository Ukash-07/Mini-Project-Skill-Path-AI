const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPathController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', learningPathController.getLearningPath);
router.post('/generate', learningPathController.generateLearningPath);
router.post('/skills/:skillId/toggle', learningPathController.toggleSkillCompletion);

module.exports = router;
