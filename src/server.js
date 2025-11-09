const express = require('express');
const itineraryRouter = require('./routes/itinerary');

const app = express();
app.use(express.json());

app.use('/api/itinerary', itineraryRouter);

// Basic health
app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
}

module.exports = app;
