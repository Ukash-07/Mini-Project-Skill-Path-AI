const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, careerController.getCareers);
router.get('/recommendations', authMiddleware, careerController.getRecommendations);
router.get('/:id/skill-gap', authMiddleware, careerController.getSkillGap);
router.get('/:id/roadmap', authMiddleware, careerController.getRoadmap);
router.get('/:id', optionalAuth, careerController.getCareerById);

module.exports = router;
