import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fastify, { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const prisma = new PrismaClient({
  log:["query", "info", "warn", "error"]
});

export const prismaPlugin = fp(async (fastify: FastifyInstance)=>{
    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async (fastify: FastifyInstance)=>{
        await fastify.prisma.$disconnect()
    })
})

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}
