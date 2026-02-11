import Fastify from 'fastify'
import { chatRoutes } from './routes/chat_route.ts'
import websocket from '@fastify/websocket'

// init fastify 

const fastify = Fastify({
  logger: true
});

// add plugins

await fastify.register(websocket);
fastify.addHook('onRequest', async (request, reply) => {
  console.log('------------------------------------------------');
  console.log(`🔍 INCOMING REQUEST: ${request.method} ${request.url}`);
  console.log('🔍 HEADERS:', request.headers);
  console.log('------------------------------------------------');
});
await fastify.register(chatRoutes)

// run the server

const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' }); 
    console.log('Chat Service is running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
