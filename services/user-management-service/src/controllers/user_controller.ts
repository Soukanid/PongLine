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

        const friendData = f.senderId === userId ? f.receiver : f.sender;
        
        let avatarBase64 = null;

        if (friendData.avatar)
        {
          const base64String = friendData.avatar.toString('base64');
          avatarBase64 = `data:image/png;base64,${base64String}`;
        }

        return {
          id: friendData.id,
          username: friendData.username,
          isOnline: friendData.isOnline,
          avatar: avatarBase64
        };
      });

      return reply.send(friends);

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Failed to fetch friends' });
    }
  }

  async getBlockedUsers(req: FastifyRequest, reply: FastifyReply) {
    const userId = 1; //[soukaina] this is hardcoded for now

    try {
      const blockedUser = await prisma.block.findMany({
        where: {
          blockerId: userId ,
        },
        include: {
          blocked: { select: { id: true, username: true, avatar: true, isOnline: true } }
        }
      });

      const finalblockedUsers = blockedUser.map(block => {
        return {
          id: block.blocked.id,
          username: block.blocked.username,
          isOnline: false,
          avatar: null
        };
      });
      return reply.send(finalblockedUsers);

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Failed to fetch Blocked friends' });
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

        const newUsers = users.map(f => {

        let avatarBase64 = null;

        if (f.avatar)
        {
          const base64String = f.avatar.toString('base64');
          avatarBase64 = `data:image/png;base64,${base64String}`;
        }

        return {
          id: f.id,
          username: f.username,
          isOnline: f.isOnline,
          avatar: avatarBase64
        };
      });

        return reply.send(newUsers);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: 'Failed to fetch users'});
      }

  }

  async createUser(req: FastifyRequest< { Body: { email: string, username: string }}>, reply: FastifyReply) {
    
    try {
      const user = await prisma.user.create({
        data : {
          email: req.body.email,
          username: req.body.username,
          avatar: Buffer.alloc(0)
        },
      });
      return reply.status(201).send( {userId: user.id });
    } catch (error)
    {
      console.error(error);
      return reply.status(500).send({ error: 'Failed to create the user'});
    }
  }

  async searchUser(req: FastifyRequest<{ Querystring: {str: string}}>, reply: FastifyReply)
  {
    var searchStr = req.query.str;

    if (!searchStr)  
      return reply.send([]);
    searchStr = searchStr.trim();
    try {
      const matchedUsers = await prisma.user.findMany({
        where: {
          username: {
            contains: searchStr,
          },
        },
        take: 10,
        select: {
          id: true,
          username: true
        },
      });

      return reply.send(matchedUsers);
    } catch (error)
    {
      console.error(error);
      return reply.status(500).send({ error: 'The search failed'});
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
   
    let avatarString = null;

    if (targetUser.avatar) {
      const base64String = targetUser.avatar.toString('base64');
      avatarString = `data:image/png;base64,${base64String}`;
    }
    const dataToSend = {email: targetUser.email, id: targetUser.id, username: targetUser.username
                        , avatar: avatarString, isOnline: targetUser.isOnline, relationship};

    return ( dataToSend );
  }

}
