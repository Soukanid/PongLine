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
          sender: { select: { id: true, username: true, avatar: true, isOnline: true } },
          receiver: { select: { id: true, username: true, avatar: true, isOnline: true } }
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

  async getChatFriends(req: FastifyRequest<{ Body: { ids: number[]}}>, reply: FastifyReply )
  {
     const { ids } = req.body;

      if (!ids || ids.length === 0)
        return reply.send([]);

      try {
        const users = await prisma.user.findMany({
          where: {
            id : { in: ids }
          },
          select: {
            id: true,
            username: true,
            avatar: true,
            isOnline: true
          }
        });

        return reply.send(users);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: 'Failed to fetch users'});
      }

  }

  async getProfileWithRelationship(req: FastifyRequest<{ Querystring: {myId: string, targetId: string}}>, reply: FastifyReply) {
    
    const me = parseInt(req.query.myId);
    const other = parseInt(req.query.targetId);

    if (me === other)
    {
      const user = await prisma.user.findUnique({ where: { id: me }});
      const rela_user = {...user, relationship: 'me'}
      return reply.send(rela_user);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: other },

      include: {
        receivedRequests: {
          where: { senderId: me }
        },

        sentRequests: {
          where: { receiverId: me }
        },
      }
    });
    
    if (!targetUser)
      throw new Error("User not found");

    let relationship = 'none';

    const friendship = targetUser.receivedRequests[0] || targetUser.sentRequests[0];

    if (friendship) 
    {
      if (friendship.status === "ACCEPTED")
        relationship = 'friend';
      else if (friendship.status === 'PENDING')
      {
        if (friendship.senderId === me)
            relationship = 'sent';
        else
            relationship = 'received';
      }
      else if (friendship.status === 'BLOCKED')
      {
        // who blocked who ?
        // [soukaina] to be fixed 
          relationship = 'blocked_by_me';
      }
    }
    
    const dataToSend = {email: targetUser.email, id: targetUser.id, username: targetUser.username
                        , avatar: targetUser.avatar, isOnline: targetUser.isOnline, relationship};

    return ( dataToSend );
  }

}
