const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', courseController.getCourses);
router.get('/:id', authMiddleware, courseController.getCourseById);
router.post('/:id/enroll', authMiddleware, courseController.enrollCourse);
router.post('/lessons/:lessonId/complete', authMiddleware, courseController.completeLesson);

module.exports = router;
