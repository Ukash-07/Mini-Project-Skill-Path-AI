const aiAssistantService = require('../services/aiAssistantService');

exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const response = await aiAssistantService.processMessage(userId, message.trim());
    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await aiAssistantService.getChatHistory(userId);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};
