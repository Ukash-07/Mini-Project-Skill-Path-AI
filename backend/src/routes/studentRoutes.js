const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/skills', studentController.getSkills);
router.put('/skills', studentController.updateSkills);
router.post('/custom-skill', studentController.addCustomSkill);
router.get('/progress', studentController.getProgress);

module.exports = router;
