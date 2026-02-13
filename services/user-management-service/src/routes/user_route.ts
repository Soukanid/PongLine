import { UserController } from '../controllers/user_controller';
import { type FastifyRequest, type FastifyInstance } from 'fastify';

const userController = new UserController();

export async function userRoutes(server: FastifyInstance) {

  // controller to get all friends
  server.get('/friends', userController.getFriends);

  // controller to get Blocked friends
  server.get('/blocked_users', userController.getBlockedUsers);

  // controller to get user, friend, mine profile
  server.get('/profile', userController.getProfileWithRelationship);
  
  server.post('/chat_friends', userController.getChatFriends);

  server.get('/search', userController.searchUser);

  server.post('/create_user', userController.createUser);
}
