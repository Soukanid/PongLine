import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import fastify, { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";

 const DATABASE_URL = process.env.DATABASE_URL;
 const adapter = new PrismaBetterSqlite3({
   url: DATABASE_URL || "file:../../database/auth.db",
 });

export const prisma = new PrismaClient({
   adapter,
  log: process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
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