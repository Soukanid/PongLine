import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { chatRoutes } from './routes/chat_route.ts'


// init fastify 

const fastify = Fastify({
  logger: true
});

// add plugins

fastify.register(fastifyWebsocket);
fastify.register(chatRoutes)

// run the server

const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' }); 
    console.log('Server is running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
