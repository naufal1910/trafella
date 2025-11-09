const { Router } = require('express');
const { generateItinerary } = require('../services/itineraryService');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await generateItinerary(req.body);
    return res.status(200).json(result);
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({
      code: e.code || 'INTERNAL_ERROR',
      message: e.message || 'Unexpected error',
      details: e.details || null,
    });
  }
});

module.exports = router;
