import { type FastifyReply, type FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { prisma } from './../utils/prisma_init.ts';

const activeUsers = new Map<number, WebSocket>();

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
    };
  }
}

export class ChatController {

  async getHistory(req: FastifyRequest<{ Querystring: { friendId: string } }>, reply: FastifyReply) {
    const { friendId } = req.query;
    const myId = req.headers['x-user-id']?.toString();

    if (!myId || !friendId)
      return reply.code(400).send();

    const id1 = parseInt(myId);
    const id2 = parseInt(friendId);

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { sender_id: id1, receiver_id: id2 },
            { sender_id: id2, receiver_id: id1 }
          ]
        },
        orderBy: { created_at: 'asc' }
      });

      const messageswithId = messages.map(msg => ({
        ...msg,
        myId: id1
      }));

      return reply.send(messageswithId);
    } catch (error) {
      return reply.code(500).send({ error: 'Fetch failed' });
    }
  }

  async getChatFriends(req: FastifyRequest, reply: FastifyReply)
  {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);

    try {
      const users = await prisma.message.findMany({
        where: {
          OR: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        },
        select: {
          sender_id: true,
          receiver_id: true,
          created_at: true
        },

        orderBy: { created_at: 'asc' }
      });

      // to remove duplicated users and fetsh them
      const allIds = users.map(msg => msg.sender_id === userId ? msg.receiver_id : msg.sender_id);
      const contactIds = [...new Set(allIds)];

      if (contactIds.length === 0)
        return reply.send([]);

      const userServiceResponse = await fetch(`${process.env.USER_SERVICE_URL}chat_friends`,
      {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ ids: contactIds })
      });

      if (!userServiceResponse.ok)
        throw new Error('User Service failed');

      const userData = await userServiceResponse.json(); 
      return reply.send(userData);

    } catch (error) {
      console.error("Failed to fetch chat friends", error);
      return reply.status(500).send({ error: 'Internal Server Error'});
    }

  }

  async notify(req: FastifyRequest<{Body: {userId: string, type: string, payload: string}}>, reply: FastifyReply)
  {
    const { userId, type, payload } = req.body;

    const targetId = parseInt(userId);

    try {
        // save the notification 
        const savedNotif = await prisma.notification.create({
           data: {
             userId: targetId,
             type: type,
             content: payload,
             read: false
         }
       });

       const socket = activeUsers.get(targetId);

       // send the notification
       if (socket && socket.readyState)
       {
         socket.send(JSON.stringify({
           type: "NOTIFICATION",
           id: savedNotif.id,
           subType: type,
           data: payload
         }));
         return { status: "deliverd" }
       }
       return { status: "saved for later"};
    } catch (error)
    {
      console.error("Failed to save or notify the user", error);
      return reply.status(500).send({ error: 'Internal Server Error'});
    }
  }
  
  async markAsRead(req: FastifyRequest, reply: FastifyReply)
  {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);
    try {
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false
        },
        data: {
          read: true
        }
    });

      return reply.code(200).send();

    } catch (error) {
      console.error("Failed to update the notification state");
      return reply.status(500).send();
    }
  }

  async getNotifications(req: FastifyRequest, reply: FastifyReply)
  {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          read: false
        },
        orderBy: { createdAt: 'desc'}
      });

      return notifications;
    } catch (error)
    {
      console.error("Failed to fetch user notifications", error);
      return reply.status(500).send('Internal Server Error');
    }
  }

  async getUnreadCount(req: FastifyRequest, reply: FastifyReply) {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);
    try {
      const count = await prisma.message.count({
        where: {
          receiver_id: userId,
          read: false
        }
      });

      return reply.send({ count });
    } catch (error) {
      console.error(error);
      return reply.status(500).send('Failed to count unread messages');
    }
  }

  async markMessagesAsRead(req: FastifyRequest<{ Body: { friendId: number } }>, reply: FastifyReply)
  {
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);
    const { friendId } = req.body;
    if (!friendId)
      return reply.code(400).send();

    try {
      await prisma.message.updateMany({
        where: {
          receiver_id: userId,
          sender_id: friendId,
          read: false
        },
        data: {
          read: true
        }
      });

      return reply.code(200).send({ success: true });
    } catch (error) {
      console.error(error);
      return reply.status(500).send('Failed to mark messages as read');
    }
  }

  handleConnection(connection: any, req: FastifyRequest) {
    const socket: WebSocket = connection.socket || connection;
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return ;

    const userId = parseInt(myId);
    activeUsers.set(userId, socket);

    socket.on('message', async (rawMsg) => {
      try {
        const data = JSON.parse(rawMsg.toString());

        const { receiver_id, content } = data;

        if (!receiver_id || !content)
          return;
        const receiverIdNum = Number(receiver_id);
        // store the message
        const savedMsg = await prisma.message.create({
          data: {
            sender_id: userId,
            receiver_id: Number(receiver_id),
            content: content,
          }
        });

        const receiverSocket = activeUsers.get(receiverIdNum);

        // send the message to the receiver
        if (receiverSocket && receiverSocket.readyState)
        {
          receiverSocket.send(JSON.stringify({
            id: savedMsg.id,
            sender_id: savedMsg.sender_id,
            receiver_id: savedMsg.receiver_id,
            content: savedMsg.content,
            created_at: savedMsg.created_at.toISOString(),
          }));
        }
        
        // send the message to myself
        socket.send(JSON.stringify({
          id: savedMsg.id,
          myId: userId,
          sender_id: savedMsg.sender_id,
          receiver_id: savedMsg.receiver_id,
          content: savedMsg.content,
          created_at: savedMsg.created_at.toISOString(),
        }));

      } catch (error) {
        console.error("faild to save the message");
      }
    });

    socket.on('close', () => {
       const currentSocket = activeUsers.get(userId);
       
       if (currentSocket === socket) {
           activeUsers.delete(userId);
       }
    });
  }
}

