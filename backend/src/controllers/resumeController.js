const resumeService = require('../services/resumeService');

exports.analyzeResume = async (req, res, next) => {
  try {
    const file = req.file;
    const rawText = req.body ? req.body.resume_text : null;
    const userId = req.user ? req.user.id : null;

    if (!file && (!rawText || !rawText.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resume file (PDF, TXT) or enter your resume text to analyze.'
      });
    }

    const analysisResult = await resumeService.analyzeResume({ file, rawText, userId });

    res.json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: analysisResult
    });
  } catch (err) {
    next(err);
  }
};

exports.importSkills = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills provided for import.'
      });
    }

    const { importedCount } = await resumeService.importSkillsToProfile(userId, skills);

    res.json({
      success: true,
      message: `Successfully synchronized ${importedCount} skills into your learning profile matrix!`,
      data: { importedCount }
    });
  } catch (err) {
    next(err);
  }
};

