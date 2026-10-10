const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', projectController.getProjects);
router.post('/', projectController.addProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
