import { fastify, type FastifyInstance, type FastifyRequest } from 'fastify'
import { prisma } from '../prisma_init.ts'
import { WebSocket } from 'ws';


interface SendMessageBody {
  sender_id: number
  receiver_id: number
  content: string
}

let activeUsers = new Map<number, WebSocket>();

export async function chatRoutes(server: FastifyInstance) {

  server.post<{ Body: SendMessageBody }>('/messages', async (request, reply) => {
    const { sender_id, receiver_id, content } = request.body

    try {
      const newMessage = await prisma.message.create({
        data: {
          sender_id,
          receiver_id,
          content
        }
      })
      
      return reply.code(201).send(newMessage)

    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to Post message'})
    }
  })

  server.get('/ws', { 
    websocket: true,
    preHandler: async (request, reply) => {
      const query = request.query as {userId: string};
      const userId = parseInt(query.userId || '0');

      if (!userId || isNaN(userId))
      {
        throw new Error('Unauthorized: Missing or Invalid User ID');
      }
      request.user = {id: userId };
      
    }
  }, (socket: WebSocket, request: FastifyRequest) => {

    // register the user
    activeUsers.set(request.user.id, socket);

    socket.on('message', (message) => {
        const text = message.toString()
    });

    socket.on('close', () => {
        activeUsers.delete(request.user.id);
    });
  });
}


