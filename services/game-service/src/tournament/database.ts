
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createGameRoom } from './../game/database';
export const prisma = new PrismaClient();

export default async function tournamentRoutes(fastify: FastifyInstance) {

  fastify.get('/activeTournaments', async (request, reply) => {
    
    try {
      const activeTour = await prisma.tournament.findMany({
        where: {
          tour_state : "Pending"
        },
        select : {
          id : true,
          tour_name: true,
        }
      });

      reply.code(200).send(activeTour);
    } catch (error)
    {
      console.error(error);
      reply.code(400).send([]);
    }
  });
  
  const scheduleTournamentCleanup  = (tourId: string) =>  {
  
    setTimeout(async () => {
      try {
        const tour = await prisma.tournament.findUnique({
          where: { tour_id: tourId },
          select: { id: true, tour_state: true }
        });
    
        if (tour && tour.tour_state === "Pending") {
          await prisma.$transaction([
            prisma.match.deleteMany({ where: { tournamentId: tour.id } }),
            prisma.participant.deleteMany({ where: { tournamentId: tour.id } }),
            prisma.tournament.delete({ where: { id: tour.id } })
          ]);
        }
      } catch (error) {
        console.error("Error during tournament cleanup:", error);
      }
    }, 10 * 60 * 1000);
  
  }

  fastify.post('/create', async (request, reply) => {
    const { tour_name } = request.body as any;
    const creator_username = request.headers['x-user-username']?.toString();
    const creator_nickname = request.headers['x-user-alias']?.toString();
    const tourId = uuidv4().substring(0, 8).toUpperCase();

    // we are sure that is there but yeah typescript :{
    if (!creator_username)
      return reply.status(400);

    try {
      const roomIds = await Promise.all([
          createGameRoom(),
          createGameRoom(),
          createGameRoom()
      ]);

      const tour = await prisma.tournament.create({
          data: {
              tour_id: tourId,
              tour_name: tour_name,
              tour_state: "Pending",
              participant: {
                  create: { 
                    username: creator_username, 
                    nick_name: creator_nickname  || "Anonymous"
                  }
              },
              matches: {
                  create: roomIds.map(id => ({
                      room_id: id,
                  }))
              }
          },
          include: { matches: true, participant: true }
      });
      
      scheduleTournamentCleanup(tourId);

      return reply.status(201).send(tour);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to create tournament bracket" });
    }
  });

  async function startTournamentBrackets(tournament: any) {
    const players = tournament.participant;
    const matches = tournament.matches; 

    await prisma.$transaction([
      prisma.match.update({
          where: { id: matches[0].id },
          data: { username1: players[0].username, username2: players[1].username }
      }),
      prisma.match.update({
          where: { id: matches[1].id },
          data: { username1: players[2].username, username2: players[3].username }
      })
    ]);

    console.log(`Tournament ${tournament.tour_id} brackets initialized!`);
  }

  fastify.post('/join', async (request, reply) => {
    const { tour_id } = request.body as any;
    const username = request.headers['username'] as string;
    const nickname = request.headers['nickname'] as string;

    if (!username || !nickname) {
        return reply.code(400).send({ error: "Missing identity headers" });
    }

    try {
        const tour = await prisma.tournament.findUnique({
            where: { tour_id },
            include: { _count: { select: { participant: true } }, participant: true }
        });

        if (!tour) return reply.code(404).send({ error: "Tournament not found" });
        
        if (tour._count.participant >= 4) 
            return reply.code(400).send({ error: "Tournament is already full" });

        if (tour.participant.some(p => p.username === username)) 
            return reply.code(400).send({ error: "Already joined" });

        const isFull = tour._count.participant === 3;

        const updated = await prisma.tournament.update({
            where: { tour_id },
            data: {
                participant: { create: { username, nick_name: nickname } },
                tour_state: isFull ? "In-progress" : "Pending"
            },
            include: { participant: true, matches: true }
        });

        if (updated.tour_state === "In-progress") {
          await startTournamentBrackets(updated);
        }

        return reply.code(200).send(updated);

    } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Join failed" });
    }
  });

  fastify.delete('/delete/:tour_id', async (request, reply) => {
    const { tour_id } = request.params as { tour_id: string };

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { tour_id: tour_id },
            select: { id: true, tour_state: true }
        });

        if (!tournament) {
            return reply.status(404).send({ error: "Tournament not found" });
        }

        if (tournament.tour_state !== "Pending") {
            return reply.status(400).send({ 
                error: "Cannot delete a tournament that has already started or finished" 
            });
        }

        await prisma.$transaction([
            prisma.match.deleteMany({ where: { tournamentId: tournament.id } }),
            prisma.participant.deleteMany({ where: { tournamentId: tournament.id } }),
            prisma.tournament.delete({ where: { id: tournament.id } })
        ]);

        return reply.status(200).send({ message: "Tournament deleted successfully" });

    } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: "Internal server error during deletion" });
    }
  });
}
