import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import * as sqlite3 from 'sqlite3';

const fastify = Fastify({ logger: true });

const db = new sqlite3.Database('/app/data/database.sqlite', (err: Error | null) => {
  if (err)
    console.error('Could not connect to database', err);
});


fastify.get('/api/auth/users', (request: FastifyRequest, reply: FastifyReply) => {
  db.all("SELECT * FROM users", [], (err: Error | null, rows: any[]) => {
    if (err) {
      reply.status(500).send({ error: err.message });
      return;
    }
    reply.send(rows);
  });
});

fastify.get('/test', async (request, reply) => {
  return { message: 'this si the auth Service via the API Gateway'}
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0'});
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
