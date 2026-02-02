import { FastifyInstance } from 'fastify'
import { prisma } from '../index'

interface SendMessageBody {
  sender_id: number
  receiver_id: number
  content: string
}


export async function chatRoutes(server: FastifyInstance) {

  server.post<{ Body: SendMessageBody }>('/messages', async (request, reply) => {
    const { sender_id, received_id, content, type } = request.body

    try {
      const newMessage = await prisma.message.create({
        data: {
          sender_id,
          received_id,
          content
        }
      })
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to send message'})
    }
  })
}
