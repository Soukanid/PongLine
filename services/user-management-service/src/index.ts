import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import { userRoutes } from './routes/user_route'


// init fastify 

const fastify = Fastify({
  logger: true
});

// add plugins

fastify.register(fastifyWebsocket);
fastify.register(userRoutes)

// run the server

const start = async () => {
  try {
    await fastify.listen({ port: 3005, host: '0.0.0.0' }); 
    console.log('user management Service is running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
