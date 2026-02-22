import fastify, { FastifyInstance } from 'fastify';
import { prisma } from '../tournament/database'
import { rooms, createInitialState } from './gameLogic';
import { v4 as uuidv4 } from 'uuid';

export async function createGameRoom() {
  const roomId = uuidv4().substring(0, 12).toUpperCase();
  
  rooms[roomId] = {
      players: [],
      gameState: createInitialState(),
  };
  return roomId;
}

export default async function gameRoutes(fastify: FastifyInstance) {
    fastify.post('/create-room', async (request, reply) => {
        try {
            const roomId = await createGameRoom();
            return reply.status(201).send({
                success: true,
                roomId: roomId
            });
        } catch (error) {
            return reply.status(500).send({ success: false, error: "Internal Server Error" });
        }
    });
}

export async function saveMatch(matchResult: any, winner: any) {
    try {
        await prisma.$transaction(async (tx: any) => {
            await tx.player.upsert({
                where: { username: matchResult.username1 },
                update: {},
                create: { username: matchResult.username1 }
            });

            await tx.player.upsert({
                where: { username: matchResult.username2 },
                update: {},
                create: { username: matchResult.username2 }
            });

            await tx.match.create({ data: matchResult });

            await tx.player.updateMany({
                where: { username: { in: [matchResult.username1, matchResult.username2] } },
                data: { total_games: { increment: 1 } }
            });

            await tx.player.update({
                where: { username: winner.username },
                data: { total_wins: { increment: 1 } }
            });
        });
        console.log(`Match ${matchResult.room_id} saved successfully.`);
    } catch (error) {
        console.error("Transaction Failed: Match not saved.", error);
    }
}