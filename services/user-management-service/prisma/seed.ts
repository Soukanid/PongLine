import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// 👇 Helper to download image URL and convert to Buffer
async function downloadAvatar(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.warn(`Failed to download avatar from ${url}, using empty buffer.`);
    return Buffer.alloc(0); // Fallback to avoid crashing
  }
}

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Clean the database
  // Note: Delete in order of foreign key constraints (Friendship first, then User)
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create your "Hero" user
  const heroAvatarUrl = 'https://i.pravatar.cc/150?u=hero';
  const heroAvatarBuffer = await downloadAvatar(heroAvatarUrl);

  const hero = await prisma.user.create({
    data: {
      email: 'me@example.com',
      username: 'hero_user',
      avatar: heroAvatarBuffer, // ✅ Save as Buffer
      isOnline: true,
    },
  });
  console.log(`Created Hero User: ${hero.username} (ID: ${hero.id})`);

  // 3. Create 50 Random Users
  const users = [];
  console.log('Generating 50 users (this might take a moment to download images)...');

  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const username = faker.internet.username({ firstName, lastName }) + i; 
    const avatarUrl = `https://i.pravatar.cc/150?u=${username}`;
    
    // Download the image for this specific user
    const avatarBuffer = await downloadAvatar(avatarUrl);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        username: username,
        avatar: avatarBuffer, // ✅ Save as Buffer
        isOnline: faker.datatype.boolean(),
      },
    });
    users.push(user);
    
    // Optional: Log progress every 10 users so you know it hasn't frozen
    if ((i + 1) % 10 === 0) console.log(`... created ${i + 1} users`);
  }
  console.log(`Created ${users.length} random users.`);

  // 4. Create Friendships for the Hero User
  const statuses = ['ACCEPTED', 'PENDING', 'BLOCKED'];
  
  // Note: 'Status' must match your Prisma enum exactly. 
  // If your enum is strictly 'ACCEPTED' | 'PENDING' | 'BLOCKED', cast it:
  // const statuses = ['ACCEPTED', 'PENDING', 'BLOCKED'] as const;

  for (const otherUser of users.slice(0, 30)) {
    const status = faker.helpers.arrayElement(statuses);
    const amISender = faker.datatype.boolean();

    await prisma.friendship.create({
      data: {
        status: status as any, // Cast to any or your specific Enum type
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
          status: faker.helpers.arrayElement(statuses) as any,
          senderId: userA.id,
          receiverId: userB.id,
        },
      });
    } catch (e) {
      continue; // Ignore duplicates
    }
  }
  console.log('Created background friendships.');
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
