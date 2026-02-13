
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function tournamentRoutes(fastify: FastifyInstance) {

  fastify.post('/api/tournaments/create', async (request, reply) => {
      const { tour_name, creator_username, creator_nickname } = request.body as any;
      const tourId = uuidv4().substring(0, 8).toUpperCase();
    
      try {
        const tour = await prisma.tournament.create({
          data: {
            tour_id: tourId,
            tour_name,
            tour_state: "Pending",
            
            participants: {
              create: { 
                username: creator_username, 
                nick_name: creator_nickname 
              }
            },
            
            matches: {
              create: [
                { room_id: `${tourId}_SEMI_1` },
                { room_id: `${tourId}_SEMI_2` },
                { room_id: `${tourId}_FINAL`  }
              ]
            }
          },
          include: { 
            participants: true,
            matches: true 
          }
        });
    
        return reply.status(201).send(tour);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: "Failed to create tournament bracket" });
      }
    });

  fastify.post('/api/tournaments/join', async (request, reply) => {
    const { tour_id, username, nickname } = request.body as any;
    
    try {
        const tour = await prisma.tournament.findUnique({
            where: { tour_id: tour_id },
            include: { participants: true }
        });

        if (!tour) {
            return reply.status(404).send({ error: "Tournament not found" });
        }

        if (tour.participants.length >= 4) {
            return reply.status(400).send({ error: "Tournament is already full" });
        }

        const alreadyJoined = tour.participants.some((p: any) => p.username === username);
        if (alreadyJoined) {
            return reply.status(400).send({ error: "You are already in this tournament" });
        }

        const updatedTour = await prisma.tournament.update({
            where: { tour_id: tour_id },
            data: {
                participants: {
                    create: { username: username, nick_name: nickname }
                },
                tour_state: tour.participants.length === 3 ? "In-progress" : "Pending"
            },
            include: { participants: true }
        });

        return reply.status(200).send(updatedTour);

    } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: "Internal server error during join" });
    }
  });
  fastify.delete('/api/tournaments/delete/:tour_id', async (request, reply) => {
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
