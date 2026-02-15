import fastify, { FastifyInstance } from 'fastify';
import { prisma } from '../tournament/database'
import { rooms, createInitialState } from './gameLogic';
import { v4 as uuidv4 } from 'uuid';

export default async function gameRoutes(fastify: FastifyInstance) {
    fastify.post('/create-room', async (request, reply) => {
        try {
            const roomId = uuidv4().substring(0, 12).toUpperCase();

            rooms[roomId] = {
                players: [],
                gameState: createInitialState(),
            };

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
      await prisma.$transaction([

        prisma.match.create({ data: matchResult }),

        prisma.player.updateMany({
          where: { username: { in: [matchResult.username1, matchResult.username2] } },
          data: { total_games: { increment: 1 } }
        }),

        prisma.player.update({
          where: { username: winner.username },
          data: { total_wins: { increment: 1 } }
        })
      ]);
      console.log(`Match ${matchResult.room_id} saved to database.`);
    } catch (error) {
      console.error("Failed to save match:", error);
    }
}
