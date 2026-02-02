import path from "path";
import sqlite3 from "sqlite3";
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';

const fastify = Fastify({
  logger: true
});

const start = async () => {
  try {
    // This keeps the server alive!
    await fastify.listen({ port: 3004, host: '0.0.0.0' }); 
    console.log('Server is running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
