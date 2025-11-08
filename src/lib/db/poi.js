const prisma = require('./client');

function normalizeDestination(d) {
  return (d || '').trim();
}

function interestsToCategories(interests) {
  if (!Array.isArray(interests) || interests.length === 0) return undefined;
  return interests.filter(Boolean);
}

async function getPoisByDestinationAndInterests({ destination, interests }) {
  const where = { destination: normalizeDestination(destination) };
  const cats = interestsToCategories(interests);
  if (cats) where.category = { in: cats };

  return prisma.poi.findMany({
    where,
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      lat: true,
      lng: true,
      location: true,
      destination: true,
    },
  });
}

module.exports = {
  getPoisByDestinationAndInterests,
  normalizeDestination,
  interestsToCategories,
};
