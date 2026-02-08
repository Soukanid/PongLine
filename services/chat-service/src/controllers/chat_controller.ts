import { type FastifyReply, type FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { prisma } from './../utils/prisma_init.ts';

const activeUsers = new Map<number, WebSocket>();

export class ChatController {

  async sendMessage(req: FastifyRequest<{ Body: { sender_id: number, receiver_id: number, content: string } }>, reply: FastifyReply) {
    const { sender_id, receiver_id, content } = req.body;
    try {

      await prisma.message.create({
        data: { sender_id, receiver_id, content }
      });

      const receiverSocket = activeUsers.get(receiver_id);
      if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
        receiverSocket.send(JSON.stringify({
          sender_id,
          receiver_id,
          content,
          sent_at: new Date().toISOString()
        }));
      }

      return reply.code(201).send({ status: 'sent' });
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ error: 'Failed to send message' });
    }
  }

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
        orderBy: { sent_at: 'asc' }
      });
      return reply.send(messages);
    } catch (error) {
      return reply.code(500).send({ error: 'Fetch failed' });
    }
  }

  handleConnection(connection: any, req: FastifyRequest) {
    const socket: WebSocket = connection.socket;
    const userId = (req as any).user.id;

    activeUsers.set(userId, socket);

    socket.on('message', (rawMsg) => {
        // Handle incoming messages from socket if you want
        // But we are using the POST method mostly
    });

    socket.on('close', () => {
       activeUsers.delete(userId);
    });
  }
}

