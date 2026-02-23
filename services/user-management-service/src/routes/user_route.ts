import { UserController } from '../controllers/user_controller';
import { type FastifyRequest, type FastifyInstance } from 'fastify';

const userController = new UserController();

export async function userRoutes(server: FastifyInstance) {

  // controller to get all friends
  server.get('/friends', userController.getFriends);

  // controller to get Blocked friends
  server.get('/blocked_users', userController.getBlockedUsers);

  // to be checked ************
  server.get('/invitations', userController.getFriendRequests);

  // controller to get user, friend, mine profile
  server.get('/profile', userController.getProfileWithRelationship.bind(userController));
  
  server.post('/chat_friends', userController.getChatFriends);

  server.get('/search', userController.searchUser);

  server.post('/create_user', userController.createUser);

  server.get('/me', userController.getMe);

  server.post('/friends/request', userController.sendFriendRequest);
  
  server.post('/friends/accept', userController.acceptFriendRequest);
  
  server.post('/friends/remove', userController.removeFriend);

  server.post('/blocks/add', userController.blockUser);
  
  server.post('/blocks/remove', userController.unblockUser);

  server.get('/blocks/check', userController.checkBlockStatus);

  server.patch('/online', userController.setOnlineStatus);

  server.get('/get-id', userController.getIdByUsername);
}
