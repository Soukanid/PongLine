import 'dotenv/config'
import {fastify} from './server.ts'
import { prismaPlugin } from './plugins/prisma.ts'
import { authPlugin } from './plugins/auth.ts'
import authRoutes from './authRoutes.ts'

const PORT =  3001
const HOST =  '0.0.0.0'

async function main () {
  try {
    //register plugins
    await fastify.register(prismaPlugin);
    await fastify.register(authPlugin);

    //register routes
    await fastify.register(authRoutes);

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
