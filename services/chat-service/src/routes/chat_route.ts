import { type FastifyInstance } from 'fastify';
import { ChatController } from '../controllers/chat_controller.ts';
import websocket from '@fastify/websocket'

const chatController = new ChatController();

export async function chatRoutes(server: FastifyInstance) {

  server.get('/messages', chatController.getHistory);

  server.get('/chat_friends', chatController.getChatFriends);

  await server.register(websocket);
  // WebSocket Route
  server.get('/ws', { 
    websocket: true,
    preHandler: async (req, reply) => {

      //[soukaina] Auth Check Logic it should be modified
      const { userId } = req.query as { userId: string };
      if (!userId)
        throw new Error('Unauthorized');
      req.user = { id: parseInt(userId) };
    }
  }, (connection, req) => {

      chatController.handleConnection(connection, req); 
  });
}
