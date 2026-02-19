import { type FastifyInstance } from 'fastify';
import { ChatController } from '../controllers/chat_controller.ts';

const chatController = new ChatController();

export async function chatRoutes(server: FastifyInstance) {

  server.get('/messages', chatController.getHistory);

  server.get('/chat_friends', chatController.getChatFriends);

  // WebSocket Route
  server.get('/ws', { 
    websocket: true,
  }, (connection, req) => {

      chatController.handleConnection(connection, req); 
  });

  server.post('/notify', chatController.notify);

  server.get('/notifications', chatController.getNotifications);
  
  server.post('/mark-read', chatController.markAsRead);
}

