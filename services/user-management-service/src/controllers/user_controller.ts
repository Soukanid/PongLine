import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils/prisma_init';
import path  from 'path';
import fs from 'fs';

export class UserController {

  async getFriendRequests(req: FastifyRequest, reply: FastifyReply)
  {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);

    try {
      const incomingRequests = await prisma.friendship.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING'
        },
        include: {
          sender: { 
            select: { id: true, username: true, avatar: true} 
          }
        }
      });

      const formattedRequests = incomingRequests.map((request: any) => {
        let avatarBase64: string | null = null;

        if (request.sender.avatar)
        {
          const base64String = request.sender.avatar.toString('base64');
          avatarBase64 = `data:image/png;base64,${base64String}`;
        }

        return {
          requestId: request.id,
          id: request.sender.id,
          username: request.sender.username,
          avatar: avatarBase64
        };
      });

      return reply.send(formattedRequests);

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Failed to fetch friend requests' });
    }
  }

  async getFriends(req: FastifyRequest, reply: FastifyReply) {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);

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
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400);

    const userId = parseInt(myId);
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
      const userIdStr = req.headers['x-user-id']?.toString();
      if (!userIdStr)
        return reply.code(400).send({ error: "Missing x-user-id header" });
      const myId = parseInt(userIdStr);

      const { ids } = req.body;

      if (!ids || ids.length === 0)
        return reply.send([]);

      try {
        const activeBlocks = await prisma.block.findMany({
          where: {
            blockerId: myId, 
            blockedId: { in: ids } 
          }
        });

        const blockedIds = new Set(
          activeBlocks.map(block => block.blockedId)
        );

        const allowedIds = ids.filter(id => !blockedIds.has(id));

        if (allowedIds.length === 0)
          return reply.send([]); 

        const users = await prisma.user.findMany({
          where: {
            id : { in: allowedIds }
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
      const defaultAvatarPath = path.join(__dirname, '../../data/avatars/default_avatar.png') 

      let avatarBuffer: Buffer;

      try {
        avatarBuffer = fs.readFileSync(defaultAvatarPath);
      } catch
      {
        avatarBuffer = Buffer.alloc(0);
      }
      const user = await prisma.user.create({
        data : {
          email: req.body.email,
          username: req.body.username,
          avatar: avatarBuffer
        },
      });
      return reply.status(201).send( {id: user.id });
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

 async getMe(req: FastifyRequest, reply: FastifyReply)
  {
      const myId = req.headers['x-user-id']?.toString();

      if (!myId)
      return reply.code(400).send();

      const userId = parseInt(myId);

      try {
        const user = await prisma.user.findUnique({
          where: { id: Number(userId) },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
          },
        });
        
        if (!user)
          return reply.status(404).send({ error: "User not found" + userId });

        let avatarBase64: string | null = null;

        if (user.avatar)
        {
          const base64String = user.avatar.toString('base64');
          avatarBase64 = `data:image/png;base64,${base64String}`;
        }

        const formatUsr = {
          requestId: user.id,
          id: user.id,
          username: user.username,
          avatar: avatarBase64
        };

       
        return reply.send(formatUsr);
      } catch (error)
      {
        console.error(error);
        return reply.status(500).send({ error: 'Failed to fetsh User'+ userId});
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

  formatUserResponse(user: any, relationship: string)
  {
    let avatarBase64: string | null = null;

    if (user.avatar)
        avatarBase64 = `data:image/png;base64,${user.avatar.toString('base64')}`;

    return {
        id: user.id,
        username: user.username,
        avatar: avatarBase64,
        isOnline: user.isOnline,
        relationship: relationship
    };
  }

  async getProfileWithRelationship(req: FastifyRequest<{ Querystring: { targetUsername: string } }>, reply: FastifyReply) {
    const userId = req.headers['x-user-id']?.toString();
    const myUsername = req.headers['x-user-username'];

    if (!userId || !myUsername)
      return ;

    const myId = parseInt(userId);
    const targetUsername = req.query.targetUsername;

    if (myUsername === targetUsername)
    {
        const user = await prisma.user.findUnique({ where: { id: myId } });
        if (!user)
          throw new Error("User not found");
        return this.formatUserResponse(user, 'me');
    }

    const targetUser = await prisma.user.findUnique({
        where: { username: targetUsername },
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

  async sendFriendRequest(req: FastifyRequest<{ Body: { targetUsername: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();

    if (!userId)
      return reply.code(400).send();

    const myId = parseInt(userId);

    try {
      const targetUser = await prisma.user.findUnique({
          where: 
            { username: req.body.targetUsername }
      });

      if (!targetUser)
        return reply.code(400);

      if (targetUser.id === myId)
        return reply.code(400);

      await prisma.friendship.create({
        data: { senderId: myId, receiverId: targetUser.id, status: "PENDING" }
      });

      return reply.send("Friend request sent" );
    } catch (error) {
      console.error(error);
      return reply.code(500).send("Failed to send request");
    }
  }

  async acceptFriendRequest(req: FastifyRequest<{ Body: { targetUsername: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();

    if (!userId)
      return reply.code(400).send();

    const myId = parseInt(userId);
    try {
      const targetUser = await prisma.user.findUnique({ where: { username: req.body.targetUsername } });
      if (!targetUser)
        return reply.code(404).send("User not found");

      const request = await prisma.friendship.findFirst({
        where: { senderId: targetUser.id, receiverId: myId, status: "PENDING" }
      });

      if (!request)
        return reply.code(404).send("No pending request found");

      await prisma.friendship.update({
        where: { id: request.id },
        data: { status: "ACCEPTED" }
      });

      return reply.send("Friend request accepted" );
    } catch (error) {
      console.error(error);
      return reply.code(500).send("Failed to accept request");
    }
  }

  async removeFriend(req: FastifyRequest<{ Body: { targetUsername: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();

    if (!userId)
      return reply.code(400).send();

    const myId = parseInt(userId);

    try {
      const targetUser = await prisma.user.findUnique({ 
        where: { username: req.body.targetUsername }
      });

      if (!targetUser)
        return reply.code(404).send();

      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { senderId: myId, receiverId: targetUser.id },
            { senderId: targetUser.id, receiverId: myId }
          ]
        }
      });
      return reply.send("Friendship removed" );
    } catch (error) {
      console.error(error);
      return reply.code(500).send("Failed to remove friend");
    }
  }

  async blockUser(req: FastifyRequest<{ Body: { targetUsername: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();

    if (!userId)
      return reply.code(400).send();

    const myId = parseInt(userId);

    try {
      const targetUser = await prisma.user.findUnique({
        where: { username: req.body.targetUsername }
      });

      if (!targetUser)
        return reply.code(404).send();

      const existingBlock = await prisma.block.findFirst({
        where: {
          blockerId: myId,
          blockedId: targetUser.id
        }
      });

      if (!existingBlock) {
        await prisma.block.create({
          data: {
            blockerId: myId,
            blockedId: targetUser.id
          }
        });
      }

      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { senderId: myId, receiverId: targetUser.id },
            { senderId: targetUser.id, receiverId: myId }
          ]
        }
      });

      return reply.send("User blocked");
      
    } catch (error) {
      console.error(error);
      return reply.code(500).send("Failed to block user");
    }
  }

  async unblockUser(req: FastifyRequest<{ Body: { targetUsername: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();

    if (!userId)
      return reply.code(400).send();

    const myId = parseInt(userId);

    try {
      const targetUser = await prisma.user.findUnique({ where: { username: req.body.targetUsername } });
      if (!targetUser)
        return reply.code(404).send();

      await prisma.block.deleteMany({
        where: { 
          blockerId: myId, blockedId: targetUser.id
            }
      });
      return reply.send("User unblocked");

    } catch (error) {
      console.error(error);
      return reply.code(500).send("Failed to unblock user");
    }
  }

  async checkBlockStatus(req: FastifyRequest<{ Querystring: { targetId: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();

    if (!userId)
      return reply.code(400).send();

    const myId = parseInt(userId);
    const targetId = parseInt(req.query.targetId);

    if (!targetId)
      return reply.code(400).send();

    try {

      const blockExists = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: myId, blockedId: targetId },
            { blockerId: targetId, blockedId: myId }
          ]
        }
      });

      return reply.send({ isBlocked: !!blockExists });

    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: "Failed to check block status" });
    }
  }

  async setOnlineStatus(req: FastifyRequest<{ Body: { id: number, isOnline: boolean } }>, reply: FastifyReply)
  {


    const userId = req.body.id;
    
    if (!userId)
      return reply.code(404).send();

    const myId = userId;

    const { isOnline } = req.body;

    try {
      await prisma.user.update({
        where: { id: myId },
        data: { isOnline: isOnline }
      });

      console.log(req.body.id);
      return reply.code(200).send({'success': "true"});
    } catch (error) {
      console.error(error);
      return reply.code(500).send('Failed to update status');
    }
  }

  async getIdByUsername(req: FastifyRequest<{ Querystring: { username: string } }>, reply: FastifyReply) {
    const { username } = req.query;
    
    if (!username)
      return reply.code(400).send();

    try {
      const user = await prisma.user.findUnique({
        where: { username: username },
        select: { id: true }
      });

      if (!user)
        return reply.code(404).send();

      return reply.send({ id: user.id });
    } catch (error) {
      console.error(error);
      return reply.code(500).send();
    }
  }
  async changeUsername(req: FastifyRequest<{ Body: { newUsername: string } }>, reply: FastifyReply)
  {
    const userId = req.headers['x-user-id']?.toString();
    
    if (!userId)
      return reply.code(401).send();

    const myId = parseInt(userId);
    const { newUsername } = req.body;

    if (!newUsername || newUsername.trim() === '')
      return reply.code(400).send();

    const trimmedUsername = newUsername.trim();

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: trimmedUsername }
      });

      if (existingUser)
      {
        if (existingUser.id === myId)
          return reply.code(200).send();
        return reply.code(409).send({ error: "Username is already taken" });
      }

      await prisma.user.update({
        where: { id: myId },
        data: { username: trimmedUsername },
        select: { username: true }
      });

      return reply.code(200).send({"success": "true"});

    } catch (error) {
      return reply.code(500).send({ error: "Failed to Update the Username"});
    }
  }
}
