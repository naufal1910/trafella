const crypto = require('crypto');
const { normalize } = require('../lib/validation/itinerarySchema');
const { getPoisByDestinationAndInterests } = require('../lib/db/poi');
const cache = require('../lib/cache/redis');
const { haversineKm } = require('../lib/geo/distance');

function hashInput(input) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function clusterIntoDaysByProximity(pois, daysCount, capPerDay = 7, startDateStr) {
  const remaining = pois.slice();
  const days = [];
  const startDate = new Date(startDateStr);

  for (let d = 0; d < daysCount; d++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + d);
    if (remaining.length === 0) {
      days.push({ date: dayDate.toISOString().slice(0, 10), items: [] });
      continue;
    }

    // Seed = first remaining, then pick nearest neighbors up to cap
    const seed = remaining.shift();
    const withDist = remaining.map((p, idx) => ({ idx, p, dist: haversineKm(seed, p) }));
    withDist.sort((a, b) => a.dist - b.dist);
    const chosen = [seed, ...withDist.slice(0, Math.max(0, capPerDay - 1)).map((x) => x.p)];

    // Remove chosen from remaining
    const chosenSet = new Set(chosen.map((c) => c.id));
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (chosenSet.has(remaining[i].id)) remaining.splice(i, 1);
    }

    const items = chosen.map((base) => ({
      name: base.name,
      poiId: base.id,
      lat: base.lat,
      lng: base.lng,
      category: base.category,
      description: base.description,
      duration: base.duration ?? 120,
      location: base.location,
    }));

    days.push({ date: dayDate.toISOString().slice(0, 10), items });
  }
  return days;
}

async function generateItinerary(rawInput) {
  // Validate and normalize
  let normalized;
  try {
    normalized = normalize(rawInput);
  } catch (e) {
    const err = new Error('Invalid input');
    err.status = 400;
    err.details = e.message;
    err.code = 'INVALID_INPUT';
    throw err;
  }

  const { destination, interests, startDate, daysCount } = normalized;

  // Cache lookup
  const hash = hashInput({ destination, interests, startDate, daysCount, budget: normalized.budget, partySize: normalized.partySize });
  const cacheKey = `itinerary:${hash}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Fetch POIs
  const pois = await getPoisByDestinationAndInterests({ destination, interests });
  if (!pois || pois.length === 0) {
    const err = new Error('Unknown destination or no POIs found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    err.details = { destination };
    throw err;
  }

  // Group by proximity and fill each day up to cap (default 6 within 5–7 range)
  const cap = 6;
  const days = clusterIntoDaysByProximity(pois, daysCount, cap, startDate);

  const response = { days };

  // Cache result
  const ttl = Number(process.env.CACHE_TTL_SECONDS || 3600);
  await cache.set(cacheKey, response, ttl);

  return response;
}

module.exports = {
  generateItinerary,
  // export internals for potential unit tests
  clusterIntoDaysByProximity,
  hashInput,
};
