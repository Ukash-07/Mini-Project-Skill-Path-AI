const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, resourceController.getResources);

module.exports = router;
