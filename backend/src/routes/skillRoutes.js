const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

router.get('/', skillController.getSkills);
router.get('/:id', skillController.getSkillById);

module.exports = router;
