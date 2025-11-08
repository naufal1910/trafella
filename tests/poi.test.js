jest.mock('../src/lib/db/client', () => ({
  poi: {
    findMany: jest.fn(),
  },
}));

const client = require('../src/lib/db/client');
const {
  getPoisByDestinationAndInterests,
} = require('../src/lib/db/poi');

describe('POI query helpers', () => {
  beforeEach(() => {
    client.poi.findMany.mockReset();
  });

  test('builds query with destination only', async () => {
    client.poi.findMany.mockResolvedValue([]);
    await getPoisByDestinationAndInterests({ destination: 'Kuala Lumpur', interests: [] });
    const args = client.poi.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ destination: 'Kuala Lumpur' });
    expect(Object.keys(args.select)).toEqual(
      expect.arrayContaining(['id', 'name', 'category', 'description', 'lat', 'lng', 'location', 'destination'])
    );
  });

  test('adds category filter when interests provided', async () => {
    client.poi.findMany.mockResolvedValue([]);
    await getPoisByDestinationAndInterests({ destination: 'Tokyo', interests: ['museums', 'food'] });
    const args = client.poi.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ destination: 'Tokyo', category: { in: ['museums', 'food'] } });
  });
});
