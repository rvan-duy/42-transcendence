import { Access, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  const alice = await prisma.user.upsert({

    where: { intraId: 1 },

    update: {},

    create: {

      intraId: 1,

      name: 'Alice',

    },

  });

  const bob = await prisma.user.upsert({

    where: { intraId: 2 },

    update: {},

    create: {

      intraId:  2,

      name: 'Bob',

    },

  });

  const chad = await prisma.room.upsert({

    where: { id: 1 },

    update: {},

    create: {

      name: 'gameRoom',

      owner: {
        connect: {
          intraId: 1,
        }
      },
      admin: {
        connect: {
          intraId: 2,
        }
      },
      users: {
        connect: [{
          intraId: 1,
        },
        {
          intraId: 2,
        }]
      },
    },

  });

  const daveroom = await prisma.room.upsert({

    where: { id: 2 },

    update: {},

    create: {

      name: 'Cluster',

      access: Access.PUBLIC,

      owner: {
        connect: {
          intraId: 2,
        }
      },
      admin: {
        connect: {
          intraId: 1,
        }
      },
    },

  });

  console.log({ alice, bob, chad, daveroom });

}

main()

  .then(async () => {

    await prisma.$disconnect();

  })

  .catch(async (e) => {

    console.error(e);

    await prisma.$disconnect();

    process.exit(1);

  });