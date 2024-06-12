const express = require('express');
const multer = require('multer');
const { predictImage } = require('../controllers/predictionController');
const { getPredictionHistory } = require('../controllers/historyController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/predict', authMiddleware, upload.single('image'), predictImage);
router.get('/history', authMiddleware, getPredictionHistory);

module.exports = router;