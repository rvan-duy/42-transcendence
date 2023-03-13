import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  const alice = await prisma.user.upsert({

    where: { intraId: 0 },

    update: {},

    create: {

      intraId: 0,

      name: 'Alice',

    },

  });

  const bob = await prisma.user.upsert({

    where: { intraId: 1 },

    update: {},

    create: {

      intraId:  1,

      name: 'Bob',

    },

  });

  const chad = await prisma.room.upsert({

    where: { id: 1 },

    update: {},

    create: {

      name: "gameRoom",

      owner: {
        connect: {
          id: 1,
        }
      },
      admin: {
        connect: {
          id: 1,
        }
      },
      users: {
        connect: {
          id: 1,
        }
      },
    },

  });


  console.log({ alice, bob, chad });

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