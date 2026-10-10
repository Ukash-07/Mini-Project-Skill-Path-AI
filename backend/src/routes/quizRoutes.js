const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:id', quizController.getQuizById);
router.post('/:id/submit', quizController.submitQuiz);

module.exports = router;
