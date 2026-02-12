
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function tournamentRoutes(fastify: FastifyInstance) {

  fastify.post('/api/tournaments/create', async (request, reply) => {
    const { tour_name, creator_username, creator_nickname } = request.body as any;
    
    const tour = await prisma.tournament.create({
      data: {
        tour_id: uuidv4().substring(0, 8).toUpperCase(),
        tour_name,
        participants: {
          create: { username: creator_username, nick_name: creator_nickname }
        }
      },
      include: { participants: true }
    });
    return tour;
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
}
