const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.poi.createMany({
    data: [
      {
        name: 'Petronas Twin Towers',
        category: 'landmark',
        description: 'Iconic twin skyscrapers with a sky bridge and observation deck.',
        lat: 3.1579,
        lng: 101.7112,
        location: 'Kuala Lumpur',
        destination: 'Kuala Lumpur',
      },
      {
        name: 'Batu Caves',
        category: 'landmark',
        description: 'Limestone caves featuring Hindu temples and a large golden statue.',
        lat: 3.2373,
        lng: 101.6840,
        location: 'Kuala Lumpur',
        destination: 'Kuala Lumpur',
      },
      {
        name: 'KL Tower',
        category: 'landmark',
        description: 'Tall tower with observation deck and revolving restaurant.',
        lat: 3.1536,
        lng: 101.7038,
        location: 'Kuala Lumpur',
        destination: 'Kuala Lumpur',
      },
      {
        name: 'National Mosque of Malaysia',
        category: 'landmark',
        description: 'Striking modern mosque with a star-shaped roof and minaret.',
        lat: 3.1412,
        lng: 101.6915,
        location: 'Kuala Lumpur',
        destination: 'Kuala Lumpur',
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
