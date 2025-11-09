const { Router } = require('express');
const { generateItinerary } = require('../services/itineraryService');
const Sentry = require('@sentry/node');
const logger = require('../lib/log/logger');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await generateItinerary(req.body);
    return res.status(200).json(result);
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500 && process.env.SENTRY_DSN) {
      Sentry.captureException(e);
    }
    if (status >= 500) {
      logger.error('route.itinerary.error', { message: e.message, stack: e.stack });
    }
    return res.status(status).json({
      code: e.code || 'INTERNAL_ERROR',
      message: e.message || 'Unexpected error',
      details: e.details || null,
    });
  }
});

module.exports = router;
