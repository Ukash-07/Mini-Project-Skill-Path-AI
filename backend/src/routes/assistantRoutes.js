const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/chat', assistantController.sendMessage);
router.get('/history', assistantController.getHistory);

module.exports = router;
