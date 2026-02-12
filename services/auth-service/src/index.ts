import 'dotenv/config'
import {fastify} from './server.ts'
import { prismaPlugin } from './plugins/prisma.ts'
import { authPlugin } from './plugins/auth.ts'
import authRoutes from './authRoutes.ts'

const PORT = parseInt(process.env.PORT || '3000')
const HOST = process.env.HOST || '0.0.0.0'

async function main () {
  try {
    //register plugins
    await fastify.register(prismaPlugin);
    await fastify.register(authPlugin);

    //register routes
    await fastify.register(authRoutes);

  /*
  //prisma test
  const user = await fastify.prisma.userAuth.create({
    data: {
      username: 'Alice',
      email: 'alice@prisma.io',
      passwordHash: 'Hello World',
      }
  })
  console.log('Created user:', user)

  // Fetch all users with their posts
  const allUsers = await fastify.prisma.UserAuth.findMany()
  console.log('All users:', JSON.stringify(allUsers, null, 2))
*/
    //start server
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Auth service running on http://${HOST}:${PORT}`);

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🛑 Shutting down auth service...");
      await fastify.prisma.$disconnect();
      await fastify.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting auth service:", error);
    process.exit(1);
  }
}

main()
