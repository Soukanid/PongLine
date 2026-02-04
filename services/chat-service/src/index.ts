import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import { chatRoutes } from './routes/chat.ts'


// init prisma client

export const prisma = new PrismaClient();

const fastify = Fastify({
  logger: true
});

fastify.register(chatRoutes)

const start = async () => {
  try {
    // This keeps the server alive!
    await fastify.listen({ port: 3002, host: '0.0.0.0' }); 
    console.log('Server is running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
