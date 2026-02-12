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


  async getHistory(req: FastifyRequest<{ Querystring: { user1: string, user2: string } }>, reply: FastifyReply) {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) return reply.code(400);

    const id1 = parseInt(user1);
    const id2 = parseInt(user2);

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
      return reply.send(messages);
    } catch (error) {
      return reply.code(500).send({ error: 'Fetch failed' });
    }
  }

  async getChatFriends(req: FastifyRequest<{ Querystring: {myId: string}}>, reply: FastifyReply)
  {
    const myId = parseInt(req.query.myId);

    try {
      const users = await prisma.message.findMany({
        where: {
          OR: [
            { sender_id: myId },
            { receiver_id: myId }
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
      const allIds = users.map(msg => msg.sender_id === myId ? msg.receiver_id : msg.sender_id);
      const contactIds = [...new Set(allIds)];

      if (contactIds.length === 0)
        return reply.send([]);


      const userServiceResponse = await fetch(`${process.env.USER_SERVICE_URL}/chat_friends`,
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

  handleConnection(connection: any, req: FastifyRequest) {
    const socket: WebSocket = connection.socket || connection;
    const userId = req.user.id;

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

