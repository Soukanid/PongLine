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
        
        let avatarBase64 : string | null = null;

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

        const newUsers = users.map(f => {


        let avatarBase64 : string | null = null;

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

  async getUser(req: FastifyRequest<{ Querystring: {id: string}}>, reply: FastifyReply)
  {
      var userId = req.query.id;

      try {
        const user = await prisma.user.findUnique({
          where: { id: Number(userId)}
        });
        
        if (!user)
          return reply.status(404).send({ error: 'User not found'});
      
        return reply.status(200);

      } catch (error)
      {
        console.error(error);
        return reply.status(500).send({ error: 'Failed to fetsh User'});
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

  async getProfileWithRelationship(req: FastifyRequest<{ Querystring: { myId: string, targetId: string } }>, reply: FastifyReply) {
    const myId = parseInt(req.query.myId);
    const targetId = parseInt(req.query.targetId);

    if (myId === targetId) {
        const user = await prisma.user.findUnique({ where: { id: myId } });
        if (!user) throw new Error("User not found");
        return this.formatUserResponse(user, 'me');
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        include: {
            receivedRequests: {
                where: { senderId: myId },
            },
            sentRequests: {
                where: { receiverId: myId },
            },
            blocksReceived: {
                where: { blockerId: myId },
            },
            blocksInitiated: {
                where: { blockedId: myId },
            }
        }
    });

    if (!targetUser)
        throw new Error("User not found");

    let relationship = 'none';

    const iBlockedThem = targetUser.blocksReceived.length > 0;
    const theyBlockedMe = targetUser.blocksInitiated.length > 0;

    if (iBlockedThem) {
        relationship = 'blocked_by_me';
    } else if (theyBlockedMe) {
        relationship = 'blocked_by_other'; 
    } 
    else {
        const friendship = targetUser.receivedRequests[0] || targetUser.sentRequests[0];

        if (friendship) {
            if (friendship.status === "ACCEPTED") {
                relationship = 'friend';
            } else if (friendship.status === "PENDING") {
                if (friendship.senderId === myId) {
                    relationship = 'sent';
                } else {
                    relationship = 'received';
                }
            }
        }
    }

    return this.formatUserResponse(targetUser, relationship);
}


formatUserResponse(user: any, relationship: string) {
    let avatarBase64: string | null = null;
    if (user.avatar) {
        avatarBase64 = `data:image/png;base64,${user.avatar.toString('base64')}`;
    }

    return {
        id: user.id,
        username: user.username,
        avatar: avatarBase64,
        isOnline: user.isOnline,
        relationship: relationship
    };
}

}
