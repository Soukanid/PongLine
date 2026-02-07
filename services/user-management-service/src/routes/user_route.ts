import { UserController } from '../controllers/user_controller';
import { FastifyRequest, FastifyInstance } from 'fastify';

const userController = new UserController();

export async function userRoutes(server: FastifyInstance) {

  // controller to get all friends
  server.get('/friends', userController.getFriends);
  

}
