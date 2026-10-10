const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', assessmentController.getAssessments);
router.get('/results', assessmentController.getResults);
router.get('/:id', assessmentController.getAssessmentById);
router.post('/:id/submit', assessmentController.submitAssessment);

module.exports = router;
