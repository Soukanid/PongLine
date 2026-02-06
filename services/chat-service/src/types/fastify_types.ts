import 'fastify'

// add attributes to Fastify types

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
    }
  }
}
