const express = require('express');
const itineraryRouter = require('./routes/itinerary');
const logger = require('./lib/log/logger');
const Sentry = require('@sentry/node');

const app = express();
app.use(express.json());

// Sentry init (only if DSN present)
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
  app.use(Sentry.Handlers.requestHandler());
}

// Request ID + structured logging
app.use((req, res, next) => {
  const reqId = (req.headers['x-request-id'] || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`).toString();
  req.id = reqId;
  res.set('X-Request-Id', reqId);
  const start = Date.now();
  logger.info('request.start', { reqId, method: req.method, path: req.originalUrl });
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('request.finish', { reqId, status: res.statusCode, durationMs });
  });
  next();
});

app.use('/api/itinerary', itineraryRouter);

// Basic health
app.get('/health', (req, res) => {
  res.json({ ok: true, requestId: req.id });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => {
    logger.info('server.start', { port });
  });
}

// Sentry error handler and fallback
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('unhandled.error', { message: err?.message, stack: err?.stack });
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Unexpected error', details: null });
});

module.exports = app;
