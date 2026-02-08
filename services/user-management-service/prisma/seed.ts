import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Clean the database
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create your "Hero" user
  const hero = await prisma.user.create({
    data: {
      email: 'me@example.com',
      username: 'hero_user',
      avatar: 'https://i.pravatar.cc/150?u=hero',
      isOnline: true,
    },
  });
  console.log(`Created Hero User: ${hero.username} (ID: ${hero.id})`);

  // 3. Create 50 Random Users
  const users = [];
  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    // FIX: Changed 'userName' to 'username'
    const username = faker.internet.username({ firstName, lastName }) + i; 
    
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        username: username,
        avatar: `https://i.pravatar.cc/150?u=${username}`, 
        isOnline: faker.datatype.boolean(),
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} random users.`);

  // 4. Create Friendships for the Hero User
  const statuses = ['ACCEPTED', 'PENDING', 'BLOCKED'];
  
  for (const otherUser of users.slice(0, 30)) {
    const status = faker.helpers.arrayElement(statuses);
    const amISender = faker.datatype.boolean();

    await prisma.friendship.create({
      data: {
        status: status,
        senderId: amISender ? hero.id : otherUser.id,
        receiverId: amISender ? otherUser.id : hero.id,
      },
    });
  }
  console.log('Created friendships for Hero user.');

  // 5. Create background friendships
  for (let i = 0; i < 150; i++) {
    const userA = faker.helpers.arrayElement(users);
    const userB = faker.helpers.arrayElement(users);

    if (userA.id === userB.id) continue;

    try {
      await prisma.friendship.create({
        data: {
          status: faker.helpers.arrayElement(statuses),
          senderId: userA.id,
          receiverId: userB.id,
        },
      });
    } catch (e) {
      continue;
    }
  }
  console.log('Created background friendships.');
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
