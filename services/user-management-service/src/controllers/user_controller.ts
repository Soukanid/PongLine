import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils/prisma_init';

export class UserController {

  async getFriends(req: FastifyRequest, reply: FastifyReply) {
    const userId = 1; //[soukaina] this is hardcoded for now

    try {
      const friendships = await prisma.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
          receiver: { select: { id: true, username: true, avatar: true } }
        }
      });

      // [soukaina ] here we do a loop into the friendships array
      // and pick the friend info and remove our info cause we don't need it
    
      const friends = friendships.map(f => {
        return f.senderId === userId ? f.receiver : f.sender;
      });

      return reply.send(friends);

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Failed to fetch friends' });
    }
  }
}
