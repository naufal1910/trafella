const request = require('supertest');

jest.mock('../src/lib/db/poi', () => ({
  getPoisByDestinationAndInterests: jest.fn(),
}));

jest.mock('../src/lib/cache/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

const poi = require('../src/lib/db/poi');
const cache = require('../src/lib/cache/redis');
const app = require('../src/server');

describe('POST /api/itinerary', () => {
  const basePayload = {
    destination: 'Kuala Lumpur',
    startDate: '2025-01-01',
    endDate: '2025-01-03',
    interests: ['museums'],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('400 when invalid input (startDate > endDate)', async () => {
    const res = await request(app)
      .post('/api/itinerary')
      .send({ ...basePayload, startDate: '2025-01-05', endDate: '2025-01-03' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'INVALID_INPUT' });
  });

  test('404 when no POIs found for destination', async () => {
    cache.get.mockResolvedValue(null);
    poi.getPoisByDestinationAndInterests.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/itinerary')
      .send(basePayload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
  });

  test('200 returns itinerary with required item fields', async () => {
    cache.get.mockResolvedValue(null);
    const pois = [
      { id: 'p1', name: 'Museum A', category: 'museums', description: 'A', lat: 3.1579, lng: 101.7112, location: 'Kuala Lumpur' },
      { id: 'p2', name: 'Gallery B', category: 'museums', description: 'B', lat: 3.1585, lng: 101.7120, location: 'Kuala Lumpur' },
      { id: 'p3', name: 'Spot C', category: 'museums', description: 'C', lat: 3.1600, lng: 101.7130, location: 'Kuala Lumpur' },
    ];
    poi.getPoisByDestinationAndInterests.mockResolvedValue(pois);

    const res = await request(app)
      .post('/api/itinerary')
      .send(basePayload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.days)).toBe(true);
    const firstDay = res.body.days[0];
    expect(Array.isArray(firstDay.items)).toBe(true);
    const item = firstDay.items[0];
    expect(item).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        poiId: expect.any(String),
        lat: expect.any(Number),
        lng: expect.any(Number),
        category: expect.any(String),
        description: expect.any(String),
        duration: expect.any(Number),
        location: expect.any(String),
      })
    );
    expect(cache.set).toHaveBeenCalled();
  });

  test('returns cached response when available (cache hit)', async () => {
    const cached = { days: [{ date: '2025-01-01', items: [] }] };
    cache.get.mockResolvedValue(cached);

    const res = await request(app)
      .post('/api/itinerary')
      .send(basePayload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(cached);
    expect(poi.getPoisByDestinationAndInterests).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  test('400 when date range exceeds 14 days', async () => {
    const res = await request(app)
      .post('/api/itinerary')
      .send({ ...basePayload, startDate: '2025-01-01', endDate: '2025-01-20' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'INVALID_INPUT' });
  });

  test('trims destination before fetching POIs', async () => {
    cache.get.mockResolvedValue(null);
    poi.getPoisByDestinationAndInterests.mockResolvedValue([]);

    await request(app)
      .post('/api/itinerary')
      .send({ ...basePayload, destination: '  Kuala Lumpur  ' })
      .set('Content-Type', 'application/json');

    expect(poi.getPoisByDestinationAndInterests).toHaveBeenCalled();
    const args = poi.getPoisByDestinationAndInterests.mock.calls[0][0];
    expect(args.destination).toBe('Kuala Lumpur');
  });

  test('returns days array length equal to requested date range', async () => {
    cache.get.mockResolvedValue(null);
    const threePois = [
      { id: 'p1', name: 'A', category: 'museums', description: 'A', lat: 3.15, lng: 101.71, location: 'KL' },
      { id: 'p2', name: 'B', category: 'museums', description: 'B', lat: 3.151, lng: 101.712, location: 'KL' },
      { id: 'p3', name: 'C', category: 'museums', description: 'C', lat: 3.152, lng: 101.713, location: 'KL' },
    ];
    poi.getPoisByDestinationAndInterests.mockResolvedValue(threePois);

    const res = await request(app)
      .post('/api/itinerary')
      .send({ ...basePayload, startDate: '2025-01-01', endDate: '2025-01-03' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.days).toHaveLength(3);
  });

  test('caps items per day (<=6) and rolls overflow to next day', async () => {
    cache.get.mockResolvedValue(null);
    const manyPois = Array.from({ length: 10 }).map((_, i) => ({
      id: `p${i + 1}`,
      name: `Spot ${i + 1}`,
      category: 'museums',
      description: `Desc ${i + 1}`,
      lat: 3.15 + i * 0.0001,
      lng: 101.71 + i * 0.0001,
      location: 'KL',
    }));
    poi.getPoisByDestinationAndInterests.mockResolvedValue(manyPois);

    const res = await request(app)
      .post('/api/itinerary')
      .send({ ...basePayload, startDate: '2025-01-01', endDate: '2025-01-02' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const day1 = res.body.days[0];
    const day2 = res.body.days[1];
    expect(day1.items.length).toBeLessThanOrEqual(6);
    expect(day1.items.length + day2.items.length).toBe(10);
  });

  test('500 when internal error occurs returns structured error', async () => {
    cache.get.mockResolvedValue(null);
    poi.getPoisByDestinationAndInterests.mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .post('/api/itinerary')
      .send(basePayload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ code: 'INTERNAL_ERROR', message: expect.any(String) });
  });
});
