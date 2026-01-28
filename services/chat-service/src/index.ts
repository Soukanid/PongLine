import path from "path";
import sqlite3 from "sqlite3";
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';

const fastify = Fastify({
  logger: true
});


const dbPath = path.join(process.cwd(), "..", "data", "chat.sqlite");

export const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);




const start = async () => {
  try {
    // This keeps the server alive!
    await fastify.listen({ port: 3000, host: '0.0.0.0' }); 
    console.log('Server is running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
