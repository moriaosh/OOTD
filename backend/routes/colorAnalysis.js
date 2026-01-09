const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const colorAnalysisController = require('../controllers/colorAnalysisController');

// Configure multer for image uploads (memory storage for AI processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// POST /api/color-analysis/analyze - Analyze uploaded selfie
router.post('/analyze', verifyToken, upload.single('image'), colorAnalysisController.analyzeColors);

// GET /api/color-analysis/my-analyses - Get all user's analyses
router.get('/my-analyses', verifyToken, colorAnalysisController.getMyAnalyses);

// GET /api/color-analysis/latest - Get latest analysis
router.get('/latest', verifyToken, colorAnalysisController.getLatestAnalysis);

// DELETE /api/color-analysis/:id - Delete analysis
router.delete('/:id', verifyToken, colorAnalysisController.deleteAnalysis);

module.exports = router;
