import fastify, { FastifyInstance , type FastifyRequest, type FastifyResponse} from 'fastify';
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
    fastify.post('/create-room', async (request: FastifyRequest, reply: FastifyResponse) => {
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

    fastify.get<{ Params: { username: string } }>('/stats/:username', async (request: FastifyRequest, reply: FastifyResponse) => {
        try {
            const { username } = request.params;

            const player = await prisma.player.findUnique({
                where: { username: username },
                select: {
                    total_wins: true,
                    total_games: true
                }
            });

            if (!player) {
                return reply.status(200).send({
                    stats: {
                        total_wins: 0,
                        total_games: 0,
                        total_losses: 0
                    }
                });
            }
            return reply.status(200).send({
                stats: {
                    total_wins: player.total_wins,
                    total_games: player.total_games,
                    total_losses: player.total_games - player.total_wins 
                }
            });

        } catch (error) {
            console.error("Failed to fetch player stats:", error);
            return reply.status(500).send("Internal Server Error");
        }
    });

    fastify.get<{ Params: { username: string } }>('/history/:username', async (request: FastifyRequest, reply:FastifyResponse) => {
      try {
        const { username } = request.params;
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { username1: username },
                    { username2: username }
                ]
            },
            orderBy: { playedAt: 'desc' },
            take: 50
        });
        
        return reply.status(200).send({ matches });
      } catch (error) {
        console.error(error);
        return reply.status(500).send("Internal Server Error" );
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

            const existingMatch = await tx.match.findFirst({
                where: { room_id: matchResult.room_id }
            });

            if (existingMatch) {
                await tx.match.update({
                    where: { id: existingMatch.id },
                    data: matchResult
                });
            } else {
                await tx.match.create({ data: matchResult });
            }

            await tx.player.updateMany({
                where: { username: { in: [matchResult.username1, matchResult.username2] } },
                data: { total_games: { increment: 1 } }
            });

            await tx.player.update({
                where: { username: winner.username },
                data: { total_wins: { increment: 1 } }
            });
            const tournamentId = existingMatch?.tournamentId || matchResult.tournamentId;
            if (tournamentId) {
                const tournamentMatches = await tx.match.findMany({
                    where: { tournamentId: tournamentId },
                    orderBy: { id: 'asc' }
                });

                const firstMatch = tournamentMatches[0];
                const secondMatch = tournamentMatches[1];
                const finalMatch = tournamentMatches[2];

                if (firstMatch?.winnerName && secondMatch?.winnerName) {
                    await tx.match.update({
                        where: { id: finalMatch.id },
                        data: {
                            username1: firstMatch.winnerName,
                            username2: secondMatch.winnerName
                        }
                    });
                    // add whatever you want
                    
                }
            }
            
        });
        console.log(`Match ${matchResult.room_id} saved successfully.`);
    } catch (error) {
        console.error("Transaction Failed: Match not saved.", error);
    }
}
    
