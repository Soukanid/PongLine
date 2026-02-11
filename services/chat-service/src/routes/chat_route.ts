import { type FastifyInstance } from 'fastify';
import { ChatController } from '../controllers/chat_controller.ts';

const chatController = new ChatController();

export async function chatRoutes(server: FastifyInstance) {

  server.get('/messages', chatController.getHistory);

  server.get('/chat_friends', chatController.getChatFriends);

  // WebSocket Route
  server.get('/ws', { 
    websocket: true,
    preHandler: async (req, reply) => {
      const { userId } = req.query as { userId: string };
      
      if (!userId) {
        throw new Error('Unauthorized: Missing userId');
      }
      
      req.user = { id: parseInt(userId) };
    }
  }, (connection, req) => {

      console.log("Connection object:", connection);
      chatController.handleConnection(connection, req); 
  });
}
