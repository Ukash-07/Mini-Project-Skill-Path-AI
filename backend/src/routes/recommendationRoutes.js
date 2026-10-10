const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', recommendationController.getRecommendations);
router.get('/next', recommendationController.getNextRecommendation);
router.post('/refresh', recommendationController.refreshRecommendations);
router.get('/:courseId/explanation', recommendationController.getExplanation);

module.exports = router;
