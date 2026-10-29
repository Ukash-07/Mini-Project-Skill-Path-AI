const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware, requireRole('admin'));

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Students
router.get('/students', adminController.getStudents);
router.delete('/students/:id', adminController.deleteStudent);

// Careers
router.post('/careers', adminController.createCareer);
router.put('/careers/:id', adminController.updateCareer);
router.delete('/careers/:id', adminController.deleteCareer);

// Skills
router.post('/skills', adminController.createSkill);
router.put('/skills/:id', adminController.updateSkill);
router.delete('/skills/:id', adminController.deleteSkill);

// Courses
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Assessments & Questions
router.post('/assessments', adminController.createAssessment);
router.delete('/assessments/:id', adminController.deleteAssessment);
router.post('/questions', adminController.createQuestion);

module.exports = router;
